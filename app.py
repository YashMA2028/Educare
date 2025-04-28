from flask import Flask, render_template, request, jsonify, session, url_for
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from rank_bm25 import BM25Okapi
import numpy as np
import re
import os
import speech_recognition as sr
from werkzeug.utils import secure_filename
import tempfile
import json
from pathlib import Path
import time
from threading import Timer

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Needed for session handling

# Configure upload folder for voice files
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize speech recognizer
recognizer = sr.Recognizer()

# Voice session state
voice_session = {
    'active': False,
    'listening': False,
    'timeout_timer': None
}

# Load the model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load Q&A data from JSON file
def load_qa_data():
    try:
        current_dir = Path(__file__).parent
        json_path = current_dir / 'datasets' / 'English_Poem1.json'
        
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list) and all(isinstance(item, dict) and 
                                           'question' in item and 
                                           'answer' in item for item in data):
                return data
            else:
                raise ValueError("Invalid JSON structure")
    except Exception as e:
        print(f"Error loading Q&A data: {e}")
        return []

# Load the query data
query_data = load_qa_data()

# Course structure database
COURSES = {
    "10": ["English", "Mathematics", "Science", "Social_Studies"],
    "9": ["English", "Mathematics", "Science"],
    "8": ["English", "Mathematics", "Science"]
}

# Navigation phrases
nav_phrases = [
    {"phrase": "standard 10", "grade": "10", "subject": None},
    {"phrase": "standard 9", "grade": "9", "subject": None},
    {"phrase": "standard 8", "grade": "8", "subject": None},
    {"phrase": "english", "grade": None, "subject": "English"},
    {"phrase": "mathematics", "grade": None, "subject": "Mathematics"},
    {"phrase": "math", "grade": None, "subject": "Mathematics"},
    {"phrase": "science", "grade": None, "subject": "Science"},
    {"phrase": "social studies", "grade": None, "subject": "Social_Studies"},
    {"phrase": "social science", "grade": None, "subject": "Social_Studies"},
    {"phrase": "home page", "action": "home"},
    {"phrase": "main menu", "action": "home"},
    {"phrase": "go back", "action": "back"},
    {"phrase": "hello bot", "action": "activate_voice"}
]

# Preprocessing
def preprocess_text(text):
    text = text.lower()
    tokens = re.findall(r"\w+", text)
    return " ".join(tokens)

# Prepare data for chatbots
questions = [q["question"] for q in query_data]
answers = [q["answer"] for q in query_data]
preprocessed_questions = [preprocess_text(q) for q in questions]

# Embeddings and BM25 for query chatbot
question_embeddings = model.encode(preprocessed_questions)
tokenized_questions = [q.split() for q in preprocessed_questions]
bm25_questions = BM25Okapi(tokenized_questions)

# Navigation data
nav_texts = [nav["phrase"] for nav in nav_phrases]
preprocessed_nav_texts = [preprocess_text(text) for text in nav_texts]
nav_embeddings = model.encode(preprocessed_nav_texts)
tokenized_nav_texts = [text.split() for text in preprocessed_nav_texts]
bm25_nav = BM25Okapi(tokenized_nav_texts)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def transcribe_audio(audio_file_path):
    try:
        with sr.AudioFile(audio_file_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
            return text
    except sr.UnknownValueError:
        return None
    except sr.RequestError as e:
        print(f"Could not request results from Google Speech Recognition service; {e}")
        return None

def create_anchor_tag(text, link):
    return f'<a href="/subject/{link}">{text}</a>'

def reset_voice_timeout():
    if voice_session['timeout_timer'] is not None:
        voice_session['timeout_timer'].cancel()
    voice_session['timeout_timer'] = Timer(5.0, stop_voice_listening)
    voice_session['timeout_timer'].start()

def stop_voice_listening():
    voice_session['listening'] = False
    print("Voice input stopped due to inactivity")

def enhanced_navigation_chatbot(user_query):
    processed_query = preprocess_text(user_query)
    current_grade = session.get('current_grade')
    
    # Check for activation phrase
    if processed_query == "hello bot":
        voice_session['active'] = True
        voice_session['listening'] = True
        reset_voice_timeout()
        return {
            "type": "voice_activation",
            "content": "Hello! I'm your education assistant. How can I help you today?",
            "html": False
        }
    
    # 1. First try to detect subject in any phrase
    subject_mapping = {
        'english': 'English',
        'math': 'Mathematics',
        'mathematics': 'Mathematics',
        'science': 'Science',
        'social': 'Social_Studies',
        'social studies': 'Social_Studies',
        'social science': 'Social_Studies'
    }
    
    detected_subject = None
    for keyword, subject in subject_mapping.items():
        if keyword in processed_query:
            detected_subject = subject
            break
    
    # If subject detected
    if detected_subject:
        # Case 1: Standard already selected in session
        if current_grade:
            if detected_subject in COURSES[current_grade]:
                link = f"{detected_subject}_{current_grade}"
                display_name = detected_subject.replace('_', ' ')
                return {
                    "type": "redirect",
                    "content": f"Taking you to {display_name} Standard {current_grade}",
                    "link": link,
                    "html": True
                }
            else:
                # Subject not available for current grade
                available_grades = [g for g in COURSES if detected_subject in COURSES[g]]
                if available_grades:
                    grade_links = [create_anchor_tag(
                        f"Standard {g}", 
                        f"{detected_subject}_{g}"
                    ) for g in available_grades]
                    return {
                        "type": "navigation",
                        "content": f"{detected_subject} not available for Standard {current_grade}. Try: {', '.join(grade_links)}",
                        "html": True
                    }
                else:
                    return {
                        "type": "navigation",
                        "content": f"Sorry, {detected_subject} is not available in any standard.",
                        "html": False
                    }
        
        # Case 2: No standard selected yet
        else:
            available_grades = [g for g in COURSES if detected_subject in COURSES[g]]
            if available_grades:
                # Create links for each available standard
                grade_links = [create_anchor_tag(
                    f"Standard {g}", 
                    f"{detected_subject}_{g}"
                ) for g in available_grades]
                
                return {
                    "type": "navigation",
                    "content": f"Please select a standard for {detected_subject}: {', '.join(grade_links)}",
                    "html": True
                }
            else:
                return {
                    "type": "navigation",
                    "content": f"Sorry, {detected_subject} is not available in any standard.",
                    "html": False
                }
    
    # 2. Detect standard if no subject found
    grade_patterns = {
        '10': ['10', 'tenth', 'standard 10', 'std 10', 'grade 10', 'class 10'],
        '9': ['9', 'ninth', 'standard 9', 'std 9', 'grade 9', 'class 9'],
        '8': ['8', 'eighth', 'standard 8', 'std 8', 'grade 8', 'class 8']
    }
    
    detected_grade = None
    for grade, patterns in grade_patterns.items():
        if any(pattern in processed_query for pattern in patterns):
            detected_grade = grade
            break
    
    if detected_grade:
        session['current_grade'] = detected_grade
        session['nav_stage'] = 'subject_selection'
        subject_links = []
        for subj in COURSES[detected_grade]:
            display_name = subj.replace('_', ' ')
            subject_links.append(create_anchor_tag(display_name, f"{subj}_{detected_grade}"))
        subject_list = ", ".join(subject_links)
        return {
            "type": "navigation",
            "content": f"Standard {detected_grade} selected. Please choose a subject: {subject_list}",
            "html": True
        }
    
    # 3. Fallback to original navigation logic
    query_embedding = model.encode([processed_query])
    nav_similarity = cosine_similarity(query_embedding, nav_embeddings)[0]
    best_nav_idx = np.argmax(nav_similarity)
    
    if nav_similarity[best_nav_idx] > 0.6:
        nav_match = nav_phrases[best_nav_idx]
        
        if "action" in nav_match:
            if nav_match['action'] == 'back':
                if session.get('nav_stage') == 'subject_selection':
                    session.pop('current_grade', None)
                    session['nav_stage'] = None
                    return {
                        "type": "navigation",
                        "content": "Please select a standard (8, 9, or 10)",
                        "action": {"type": "select_standard"}
                    }
            session.clear()
            return {
                "type": "navigation",
                "content": "Returning to home page",
                "action": {"type": "home"}
            }
    
    # No match found - guide user
    if 'current_grade' in session:
        subject_links = []
        for subj in COURSES[session['current_grade']]:
            display_name = subj.replace('_', ' ')
            subject_links.append(create_anchor_tag(display_name, f"{subj}_{session['current_grade']}"))
        subject_list = ", ".join(subject_links)
        return {
            "type": "navigation",
            "content": f"Please select a subject for Standard {session['current_grade']}: {subject_list}",
            "html": True
        }
    else:
        standard_links = [
            create_anchor_tag(f"Standard {grade}", f"select_standard/{grade}") 
            for grade in ["10", "9", "8"]
        ]
        standard_list = ", ".join(standard_links)
        return {
            "type": "navigation",
            "content": f"Please select a standard to begin: {standard_list}",
            "html": True
        }

def query_chatbot(user_query):
    processed_query = preprocess_text(user_query)
    
    # Reset voice timeout on each query
    if voice_session['active']:
        reset_voice_timeout()
    
    # Semantic search
    query_embedding = model.encode([processed_query])
    q_similarity = cosine_similarity(query_embedding, question_embeddings)[0]
    best_q_idx = np.argmax(q_similarity)
    best_q_score = q_similarity[best_q_idx]

    # BM25 search
    bm25_scores = bm25_questions.get_scores(processed_query.split())
    best_bm25_q_idx = np.argmax(bm25_scores)
    best_bm25_q_score = bm25_scores[best_bm25_q_idx]

    if best_q_score > 0.65 or best_bm25_q_score > 5:
        return {
            "type": "answer",
            "content": answers[best_q_idx],
            "confidence": float(max(best_q_score, best_bm25_q_score/10))
        }
    else:
        return {
            "type": "answer",
            "content": "I couldn't find a good match. Try rephrasing your question.",
            "confidence": 0.0
        }

@app.route('/')
def index():
    session.clear()
    voice_session['active'] = False
    voice_session['listening'] = False
    if voice_session['timeout_timer'] is not None:
        voice_session['timeout_timer'].cancel()
    return render_template('index.html')

@app.route('/home')
def home():
    session.clear()
    return render_template('English_10.html')

@app.route('/select_standard/<grade>')
def select_standard(grade):
    session['current_grade'] = grade
    session['nav_stage'] = 'subject_selection'
    return jsonify({
        "response": f"Standard {grade} selected. Please choose a subject.",
        "action": {"type": "select_subject", "grade": grade}
    })

@app.route('/subject/<path:subject_link>')
def load_subject(subject_link):
    try:
        if subject_link.endswith('.html'):
            subject_link = subject_link[:-5]
            
        parts = subject_link.rsplit('_', 1)
        if len(parts) != 2:
            return "Invalid subject link format", 400
            
        subject, grade = parts
        
        if grade not in COURSES:
            return f"Standard {grade} not found", 404
            
        if subject not in COURSES[grade]:
            return f"Subject {subject.replace('_', ' ')} not found for Standard {grade}", 404
            
        template_name = f"{subject}_{grade}.html"
        template_path = os.path.join(app.template_folder, template_name)
        
        if not os.path.exists(template_path):
            return f"Content page not found: {template_name}", 404
            
        return render_template(template_name)
    
    except Exception as e:
        return f"Error loading subject: {str(e)}", 500

@app.route('/upload-voice', methods=['POST'])
def upload_voice():
    if 'voice' not in request.files:
        return jsonify({"error": "No voice file provided"}), 400
    
    file = request.files['voice']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        transcribed_text = transcribe_audio(filepath)
        
        try:
            os.remove(filepath)
        except:
            pass
        
        if transcribed_text:
            # Reset the voice timeout timer
            reset_voice_timeout()
            
            return jsonify({
                "text": transcribed_text,
                "status": "success"
            })
        else:
            return jsonify({
                "error": "Could not transcribe audio",
                "status": "error"
            }), 400
    else:
        return jsonify({
            "error": "File type not allowed",
            "status": "error"
        }), 400

@app.route('/activate-voice', methods=['POST'])
def activate_voice():
    voice_session['active'] = True
    voice_session['listening'] = True
    reset_voice_timeout()
    return jsonify({
        "status": "success",
        "message": "Voice mode activated",
        "welcome_message": "Hello! I'm your education assistant. How can I help you today?"
    })

@app.route('/check-voice-status', methods=['GET'])
def check_voice_status():
    return jsonify({
        "active": voice_session['active'],
        "listening": voice_session['listening']
    })

@app.route('/navigation-bot', methods=['POST'])
def navigation_bot_api():
    data = request.json
    user_query = data.get("query", "").strip().lower()
    voice_input = data.get("voice", False)
    
    if not user_query:
        return jsonify({"response": "Please provide a valid query."})
    
    if user_query in ["home", "main menu", "go home"]:
        session.clear()
        voice_session['active'] = False
        voice_session['listening'] = False
        if voice_session['timeout_timer'] is not None:
            voice_session['timeout_timer'].cancel()
        return jsonify({
            "response": "Returning to home page",
            "action": {
                "type": "redirect",
                "url": url_for('home')
            },
            "html": False,
            "voice_support": voice_input
        })
    
    response = enhanced_navigation_chatbot(user_query)
    
    if response.get("type") == "redirect":
        return jsonify({
            "response": response["content"],
            "action": {
                "type": "redirect",
                "url": url_for('load_subject', subject_link=response["link"])
            },
            "html": response.get("html", False),
            "voice_support": voice_input
        })
    
    return jsonify({
        "response": response["content"],
        "action": response.get("action"),
        "html": response.get("html", False),
        "voice_support": voice_input
    })

@app.route('/query-bot', methods=['POST'])
def query_bot_api():
    data = request.json
    user_query = data.get("query", "").strip().lower()
    voice_input = data.get("voice", False)
    
    if not user_query:
        return jsonify({"response": "Please provide a valid query."})
    
    if user_query in ["home", "main menu", "go home"]:
        session.clear()
        voice_session['active'] = False
        voice_session['listening'] = False
        if voice_session['timeout_timer'] is not None:
            voice_session['timeout_timer'].cancel()
        return jsonify({ 
            "response": "Returning to home page",
            "action": {
                "type": "redirect",
                "url": url_for('index')
            },
            "html": False,
            "voice_support": voice_input
        })
    
    response = query_chatbot(user_query)
    return jsonify({
        "response": response["content"],
        "confidence": response.get("confidence", 0),
        "voice_support": voice_input
    })

if __name__ == "__main__":
    app.run(debug=True)
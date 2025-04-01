from flask import Flask, render_template, request, jsonify, session
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from rank_bm25 import BM25Okapi
import numpy as np
import re
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Needed for session handling

# Load the model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Dataset for query chatbot
query_data = [
    {"question": "What is the title of the poem?", "answer": "Where the Mind is Without Fear"},
    {"question": "Who is the author of the poem?", "answer": "Rabindranath Tagore"},
    {"question": "Where is the poem sourced from?", "answer": "Gitanjali"},
    {"question": "What is the meaning of 'Where the mind is without fear and the head is held high'?", 
     "answer": "A world where people live without fear and with dignity."},
    {"question": "What is the meaning of 'Where knowledge is free'?", 
     "answer": "Education should be accessible to all."},
    {"question": "What is the meaning of 'Where the world has not been broken up into fragments by narrow domestic walls'?", 
     "answer": "The world should be united, without divisions of caste, religion, or nationality."},
    {"question": "What is the meaning of 'Where words come out from the depth of truth'?", 
     "answer": "People should speak honestly and truthfully."},
    {"question": "What is the meaning of 'Where tireless striving stretches its arms towards perfection'?", 
     "answer": "Hard work and continuous efforts should be aimed at achieving excellence."},
    {"question": "What is the meaning of 'Where the clear stream of reason has not lost its way into the dreary desert sand of dead habit'?", 
     "answer": "Logic and reasoning should not be overshadowed by blind traditions."},
    {"question": "What is the meaning of 'Where the mind is led forward by Thee into ever-widening thought and action'?", 
     "answer": "God should guide people toward progressive thinking and meaningful actions."},
    {"question": "What is the meaning of 'Into that heaven of freedom, my Father, let my country awake'?", 
     "answer": "The poet prays for a truly free nation, both politically and intellectually."},
    {"question": "What does 'narrow domestic walls' mean?", 
     "answer": "Divisions based on caste, religion, or social class."},
    {"question": "What does 'tireless striving' mean?", 
     "answer": "Continuous efforts towards a goal."},
    {"question": "What does 'stretches its arms' mean?", 
     "answer": "Aiming to achieve something."},
    {"question": "What does 'dead habit' mean?", 
     "answer": "Outdated traditions that hinder progress."},
    {"question": "What does 'ever-widening' mean?", 
     "answer": "Continuously expanding one's thinking."},
    {"question": "What does 'heaven of freedom' mean?", 
     "answer": "A state of complete freedom in thoughts and actions."},
    {"question": "What does the poet pray to the Almighty for?", 
     "answer": "Tagore prays for a nation where people live without fear, knowledge is free, and society is progressive and united."},
    {"question": "What are 'reason' and 'dead habit' compared to?", 
     "answer": "Reason is compared to a clear stream, while dead habit is compared to a dreary desert sand, showing how logic can be lost in outdated traditions."},
    {"question": "What does the poet wish for?", 
     "answer": "He wishes for a nation that is free, educated, and progressive, where people are guided by truth and reason."},
    {"question": "What are the main themes of the poem?", 
     "answer": "Freedom of Thought and Expression, Importance of Education, Nationalism and Unity, Overcoming Fear and Oppression, Breaking Social Barriers."},
    {"question": "What is the historical context of the poem?", 
     "answer": "The poem was written during British rule in India, reflecting Tagore's vision of an independent and progressive nation."}
]

# Course structure database
COURSES = {
    "10": ["English", "Mathematics", "Science", "Social Studies"],
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
    {"phrase": "science", "grade": None, "subject": "Science"},
    {"phrase": "social studies", "grade": None, "subject": "Social Studies"},
    {"phrase": "home page", "action": "home"},
    {"phrase": "main menu", "action": "home"},
    {"phrase": "go back", "action": "back"},
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

def create_anchor_tag(text, link):
    """Helper function to create HTML anchor tags"""
    return f'<a href="/subject/{link}">{text}</a>'

def navigation_chatbot(user_query):
    """Handle step-by-step navigation with anchor tags"""
    processed_query = preprocess_text(user_query)
    current_stage = session.get('nav_stage', None)
    
    # Stage 1: No standard selected yet
    if not current_stage:
        for grade in ["10", "9", "8"]:
            if f"standard {grade}" in processed_query or f"std {grade}" in processed_query or f"{grade}th" in processed_query:
                session['current_grade'] = grade
                session['nav_stage'] = 'subject_selection'
                
                # Create clickable subject links
                subject_links = [create_anchor_tag(subj, f"{subj}_{grade}") for subj in COURSES[grade]]
                subject_list = ", ".join(subject_links)
                
                return {
                    "type": "navigation",
                    "content": f"Standard {grade} selected. Please choose a subject: {subject_list}",
                    "action": {"type": "select_subject", "grade": grade},
                    "html": True
                }
    
    # Stage 2: Standard selected, need subject
    elif current_stage == 'subject_selection':
        grade = session.get('current_grade')
        if grade:
            for subject in COURSES[grade]:
                if subject.lower() in processed_query:
                    link = f"{subject}_{grade}"
                    return {
                        "type": "navigation",
                        "content": f"Taking you to {create_anchor_tag(f'{subject} Standard {grade}', link)}",
                        "action": {"type": "open_subject", "link": link},
                        "html": True
                    }
            
            # Show subjects again as clickable links
            subject_links = [create_anchor_tag(subj, f"{subj}_{grade}") for subj in COURSES[grade]]
            subject_list = ", ".join(subject_links)
            return {
                "type": "navigation",
                "content": f"Please select a subject for Standard {grade}: {subject_list}",
                "action": {"type": "select_subject", "grade": grade},
                "html": True
            }
    
    # Handle direct matches from nav_phrases
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
        
        if nav_match.get('subject'):
            if 'current_grade' in session:
                subject = nav_match['subject']
                grade = session['current_grade']
                link = f"{subject}_{grade}"
                return {
                    "type": "navigation",
                    "content": f"Taking you to {create_anchor_tag(f'{subject} Standard {grade}', link)}",
                    "action": {"type": "open_subject", "link": link},
                    "html": True
                }
            else:
                # Create standard selection links
                standard_links = [
                    create_anchor_tag(f"Standard {grade}", f"select_standard/{grade}") 
                    for grade in ["10", "9", "8"]
                ]
                standard_list = ", ".join(standard_links)
                return {
                    "type": "navigation",
                    "content": f"Please select a standard first: {standard_list}",
                    "action": {"type": "select_standard"},
                    "html": True
                }
        
        if nav_match.get('grade'):
            session['current_grade'] = nav_match['grade']
            session['nav_stage'] = 'subject_selection'
            subject_links = [
                create_anchor_tag(subj, f"{subj}_{nav_match['grade']}") 
                for subj in COURSES[nav_match['grade']]
            ]
            subject_list = ", ".join(subject_links)
            return {
                "type": "navigation",
                "content": f"Standard {nav_match['grade']} selected. Please choose a subject: {subject_list}",
                "action": {"type": "select_subject", "grade": nav_match['grade']},
                "html": True
            }
    
    # No match found - guide user with clickable links
    if 'current_grade' in session:
        subject_links = [
            create_anchor_tag(subj, f"{subj}_{session['current_grade']}") 
            for subj in COURSES[session['current_grade']]
        ]
        subject_list = ", ".join(subject_links)
        return {
            "type": "navigation",
            "content": f"Please select a subject for Standard {session['current_grade']}: {subject_list}",
            "action": {"type": "select_subject", "grade": session['current_grade']},
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
            "action": {"type": "select_standard"},
            "html": True
        }

def query_chatbot(user_query):
    """Handle poem-related questions (same as before)"""
    processed_query = preprocess_text(user_query)
    
    # Semantic search
    query_embedding = model.encode([processed_query])
    q_similarity = cosine_similarity(query_embedding, question_embeddings)[0]
    best_q_idx = np.argmax(q_similarity)
    best_q_score = q_similarity[best_q_idx]

    # BM25 search
    bm25_scores = bm25_questions.get_scores(processed_query.split())
    best_bm25_q_idx = np.argmax(bm25_scores)
    best_bm25_q_score = bm25_scores[best_bm25_q_idx]

    # Return best match
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
    return render_template('index.html')

@app.route('/home')
def home():
    session.clear()
    return render_template('home.html')

@app.route('/select_standard/<grade>')
def select_standard(grade):
    """Handle standard selection via link click"""
    session['current_grade'] = grade
    session['nav_stage'] = 'subject_selection'
    return jsonify({
        "response": f"Standard {grade} selected. Please choose a subject.",
        "action": {"type": "select_subject", "grade": grade}
    })

@app.route('/subject/<path:subject_link>')
def load_subject(subject_link):
    """Handle subject links in Subject_Standard format"""
    try:
        parts = subject_link.split('_')
        if len(parts) != 2:
            return "Invalid subject link format", 400
            
        subject, standard = parts
        template_name = f"{subject}_{standard}.html"
        
        # Verify template exists
        template_path = os.path.join(app.template_folder, template_name)
        if not os.path.exists(template_path):
            return f"Subject content not found: {template_name}", 404
            
        return render_template(template_name)
    
    except Exception as e:
        return f"Error loading subject: {str(e)}", 500

@app.route('/navigation-bot', methods=['POST'])
def navigation_bot_api():
    data = request.json
    user_query = data.get("query", "")
    voice_input = data.get("voice", False)
    
    if not user_query:
        return jsonify({"response": "Please provide a valid query."})
    
    response = navigation_chatbot(user_query)
    
    response_with_voice = {
        "response": response["content"],
        "action": response.get("action"),
        "html": response.get("html", False),
        "voice_support": True if voice_input else False
    }
    
    return jsonify(response_with_voice)

@app.route('/query-bot', methods=['POST'])
def query_bot_api():
    data = request.json
    user_query = data.get("query", "")
    voice_input = data.get("voice", False)
    
    if not user_query:
        return jsonify({"response": "Please provide a valid query."})
    
    response = query_chatbot(user_query)
    
    response_with_voice = {
        "response": response["content"],
        "confidence": response.get("confidence", 0),
        "voice_support": True if voice_input else False
    }
    
    return jsonify(response_with_voice)

if __name__ == "__main__":
    app.run(debug=True)
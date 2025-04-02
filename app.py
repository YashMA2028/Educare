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
     "answer": "The poem was written during British rule in India, reflecting Tagore's vision of an independent and progressive nation."},
     {
    "question": "What is the narrator quite successful at?",
    "answer": "The narrator is quite successful at stealing, as he is an experienced and fairly successful thief."
  },
  {
    "question": "Who does ‘I’ refer to in this story?",
    "answer": "'I' refers to Hari Singh, the narrator of the story, who is a young thief."
  },
  {
    "question": "What favours did Anil do for the narrator?",
    "answer": "Anil taught the narrator to cook, write, and helped him with basic education, including writing his name and learning to write sentences."
  },
  {
    "question": "What proves that the narrator still practised deceit?",
    "answer": "The narrator lied about his name (calling himself Hari Singh), and he also lied about his ability to cook to secure a job with Anil."
  },
  {
    "question": "What could have caused the scars on Hari’s face?",
    "answer": "The scars on Hari’s face could have been caused by his life as a thief, involving dangerous situations and confrontations."
  },
  {
    "question": "Why did Hari hesitate to board the train?",
    "answer": "Hari hesitated to board the train because of an unexplained feeling, perhaps guilt or uncertainty about his decision to rob Anil."
  },
  {
    "question": "Why does Hari believe that friends were more trouble than help?",
    "answer": "Hari believes that friends are more trouble than help because they complicate his life, and he prefers to stay independent, not trusting anyone."
  },
  {
    "question": "What is face reading?",
    "answer": "Face reading refers to the practice of analyzing people’s facial expressions and features to determine their emotions or character traits."
  },
  {
    "question": "What were Hari’s regrets as he pondered over his theft?",
    "answer": "Hari regretted losing Anil’s trust and realized that stealing would not lead him to be a clever, respected man, but rather someone trapped in deceit."
  },
  {
    "question": "Does Anil realize that he has been robbed?",
    "answer": "Although Anil likely knows he has been robbed, he does not show it outwardly. He keeps his calm and pays Hari the next morning without showing any signs of anger or disappointment."
  },
  {
    "question": "Why did Hari feel nervous?",
    "answer": "Hari felt nervous because returning the stolen money undetected was more difficult than stealing it in the first place. He feared being caught."
  },
  {
    "question": "What is a satchel?",
    "answer": "A school bag."
  },
  {
    "question": "What does 'pard' mean?",
    "answer": "It is a poetical short form of ‘leopard’."
  },
  {
    "question": "What does 'cannon’s mouth' refer to?",
    "answer": "It refers to facing great danger to life."
  },
  {
    "question": "What are youthful hose?",
    "answer": "They are close-fitting coverings for legs."
  },
  {
    "question": "What are players in this context?",
    "answer": "Actors."
  },
  {
    "question": "What do 'exits and entrances' refer to?",
    "answer": "They refer to the coming and going of people in life, similar to an act or play."
  },
  {
    "question": "What does puking mean?",
    "answer": "It means throwing up or vomiting."
  },
  {
    "question": "What is a woeful ballad?",
    "answer": "A sad, sorrowful song or poem."
  },
  {
    "question": "Why is reputation like a bubble?",
    "answer": "Reputation is like a bubble because it is fragile and can easily burst, often when put under pressure."
  },
  {
    "question": "What is the major difference noticed in the 5th and 6th stage of life?",
    "answer": "The 5th stage is that of a mature, wise man (the justice) who holds a position of authority, while the 6th stage is characterized by the physical decline and weakness of old age, marked by a shriveled body and loss of strength."
  },
  {
    "question": "What does treble mean in this context?",
    "answer": "It refers to something that is three times weaker than its usual state."
  },
  {
    "question": "What is oblivion?",
    "answer": "It is the state of being unaware or unconscious of surroundings and happenings."
  },
  {
    "question": "What does second childishness mean?",
    "answer": "It refers to a return to the helpless, ignorant state of a child, typically in old age."
  },
  {
    "question": "What does sans mean?",
    "answer": "Sans means without."
  }
]

# Course structure database - updated with underscores for multi-word subjects
COURSES = {
    "10": ["English", "Mathematics", "Science", "Social_Studies"],
    "9": ["English", "Mathematics", "Science"],
    "8": ["English", "Mathematics", "Science"]
}

# Navigation phrases - updated with underscores for multi-word subjects
nav_phrases = [
    {"phrase": "standard 10", "grade": "10", "subject": None},
    {"phrase": "standard 9", "grade": "9", "subject": None},
    {"phrase": "standard 8", "grade": "8", "subject": None},
    {"phrase": "english", "grade": None, "subject": "English"},
    {"phrase": "mathematics", "grade": None, "subject": "Mathematics"},
    {"phrase": "science", "grade": None, "subject": "Science"},
    {"phrase": "social studies", "grade": None, "subject": "Social_Studies"},
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
                
                # Create clickable subject links with proper display names
                subject_links = []
                for subj in COURSES[grade]:
                    display_name = subj.replace('_', ' ')
                    subject_links.append(create_anchor_tag(display_name, f"{subj}_{grade}"))
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
                # Match both with and without underscores
                if subject.lower().replace('_', ' ') in processed_query:
                    link = f"{subject}_{grade}"
                    display_name = subject.replace('_', ' ')
                    return {
                        "type": "navigation",
                        "content": f"Taking you to {create_anchor_tag(f'{display_name} Standard {grade}', link)}",
                        "action": {"type": "open_subject", "link": link},
                        "html": True
                    }
            
            # Show subjects again as clickable links
            subject_links = []
            for subj in COURSES[grade]:
                display_name = subj.replace('_', ' ')
                subject_links.append(create_anchor_tag(display_name, f"{subj}_{grade}"))
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
                display_name = subject.replace('_', ' ')
                return {
                    "type": "navigation",
                    "content": f"Taking you to {create_anchor_tag(f'{display_name} Standard {grade}', link)}",
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
            subject_links = []
            for subj in COURSES[nav_match['grade']]:
                display_name = subj.replace('_', ' ')
                subject_links.append(create_anchor_tag(display_name, f"{subj}_{nav_match['grade']}"))
            subject_list = ", ".join(subject_links)
            return {
                "type": "navigation",
                "content": f"Standard {nav_match['grade']} selected. Please choose a subject: {subject_list}",
                "action": {"type": "select_subject", "grade": nav_match['grade']},
                "html": True
            }
    
    # No match found - guide user with clickable links
    if 'current_grade' in session:
        subject_links = []
        for subj in COURSES[session['current_grade']]:
            display_name = subj.replace('_', ' ')
            subject_links.append(create_anchor_tag(display_name, f"{subj}_{session['current_grade']}"))
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
    """Handle poem-related questions"""
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
    # Changed from home.html to English_10.html as the main page
    return render_template('English_10.html')

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
        # Remove .html if present
        if subject_link.endswith('.html'):
            subject_link = subject_link[:-5]
            
        # Split into subject and grade
        parts = subject_link.rsplit('_', 1)
        if len(parts) != 2:
            return "Invalid subject link format", 400
            
        subject, grade = parts
        
        # Verify the grade exists in our courses
        if grade not in COURSES:
            return f"Standard {grade} not found", 404
            
        # Verify the subject exists for this grade
        if subject not in COURSES[grade]:
            return f"Subject {subject.replace('_', ' ')} not found for Standard {grade}", 404
            
        # Check if the template exists
        template_name = f"{subject}_{grade}.html"
        template_path = os.path.join(app.template_folder, template_name)
        
        if not os.path.exists(template_path):
            return f"Content page not found: {template_name}", 404
            
        return render_template(template_name)
    
    except Exception as e:
        return f"Error loading subject: {str(e)}", 500

@app.route('/navigation-bot', methods=['POST'])
def navigation_bot_api():
    data = request.json
    user_query = data.get("query", "").strip().lower()
    voice_input = data.get("voice", False)
    
    if not user_query:
        return jsonify({"response": "Please provide a valid query."})
    
    # Handle home command
    if user_query in ["home", "main menu", "go home"]:
        session.clear()
        return jsonify({
            "response": "Returning to home page",
            "action": {
                "type": "redirect",
                "url": url_for('index')  # This will generate the correct URL for index.html
            },
            "html": False,
            "voice_support": voice_input
        })
    
    response = navigation_chatbot(user_query)
    
    # If navigation chatbot suggested home (from nav_phrases)
    if response.get("content") == "Returning to home page":
        response["action"] = {
            "type": "redirect",
            "url": url_for('index')
        }
    
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
    
    # Handle home command
    if user_query in ["home", "main menu", "go home"]:
        session.clear()
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
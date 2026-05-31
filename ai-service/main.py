from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import torch
import numpy as np
import logging
from langdetect import detect, DetectorFactory

# Ensure consistent language detection
DetectorFactory.seed = 0

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="UCRS Multilingual AI Service")

# Initialize the model
# Using 'paraphrase-multilingual-MiniLM-L12-v2' for high-quality multilingual support
logger.info("Loading Multilingual SentenceTransformer model...")
try:
    model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    logger.info("Multilingual model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    model = None

DEPARTMENTS = {
    "Electricity Board": [
        "power cut", "voltage issue", "current went off suddenly", "transformer spark", 
        "electric wire hanging", "street light not working", "meter problem", "no electricity",
        "power fluctuation", "bill payment issue electricity",
        "மின்சாரம் இல்லை", "மின்வெட்டு", "மின்சார கம்பிகள் அறுந்து கிடக்கின்றன", "தெருவிளக்கு எரியவில்லை"
    ],
    "Water Supply": [
        "no water", "water leakage", "pipe burst", "dirty water", "muddy water",
        "low water pressure", "drainage overflow near water line", "water bill issue",
        "borewell problem", "municipal water not coming",
        "தண்ணீர் வரவில்லை", "குடிநீர் கசிவு", "குழாய் உடைப்பு", "அழுக்கு தண்ணீர்", "தண்ணீர் வரி"
    ],
    "Municipality": [
        "garbage collection", "street cleaning", "stray dogs", "property tax", 
        "illegal construction", "park maintenance", "encroachment on public space",
        "building permit query", "community hall booking",
        "குப்பை சேகரிப்பு", "தெரு சுத்தம்", "தெரு நாய்கள்", "வீட்டு வரி", "ஆக்கிரமிப்பு"
    ],
    "Road Maintenance": [
        "potholes", "road repair", "tar road damage", "bridge cracks", 
        "median broken", "obstruction on road", "unlevelled road", "road digging",
        "சாலை பழுது", "பள்ளம்", "சாலை சேதம்", "பாலம் விரிசல்"
    ],
    "Police": [
        "theft", "robbery", "harassment", "accident", "missing person", 
        "public nuisance", "suspicious activity", "noise pollution late night",
        "traffic violation reporting", "police patrol request",
        "திருட்டு", "கொள்ளை", "தொல்லை", "விபத்து", "காணாமல் போனவர்", "சந்தேகத்திற்குரிய நபர்"
    ],
    "Health Department": [
        "fever outbreak", "mosquito menace", "hospital hygiene", 
        "expired medicine", "food safety", "vaccination query", "dengue alert",
        "stagnant water breeding mosquitoes", "government hospital issue",
        "காய்ச்சல்", "கொசு தொல்லை", "மருத்துவமனை சுகாதாரம்", "தடுப்பூசி", "டெங்கு"
    ],
    "Transport": [
        "bus timing", "driver behavior", "public transport issue", 
        "traffic signal fault", "illegal parking", "metro query",
        "overcrowded bus", "auto rickshaw overcharging",
        "பேருந்து நேரம்", "போக்குவரத்து சிக்கல்", "சிக்னல் கோளாறு", "ஆட்டோ கட்டணம்"
    ],
    "Revenue Department": [
        "land dispute", "certificate delay", "encroachment", "patta issue", 
        "government scheme info", "income certificate",
        "caste certificate", "property registration",
        "நில தகராறு", "பட்டா பிரச்சனை", "சான்றிதழ் தாமதம்", "அரசு திட்டம்"
    ],
    "Sanitation": [
        "drainage blockage", "sewage leak", "toilet cleaning", 
        "public dustbin full", "bad smell in area", "stagnant water",
        "open drain", "unclean public toilet",
        "சாக்கடை அடைப்பு", "மலம் கசிவு", "கழிப்பறை சுத்தம்", "துர்நாற்றம்"
    ]
}

# Pre-calculate embeddings for department anchors if model is loaded
dept_anchor_embeddings = {}
if model:
    logger.info("Pre-calculating department anchor embeddings...")
    for dept, anchors in DEPARTMENTS.items():
        dept_anchor_embeddings[dept] = model.encode(anchors, convert_to_tensor=True)
    logger.info("Multilingual anchors encoded.")

class ComplaintText(BaseModel):
    text: str

class ComplaintAnalysisResponse(BaseModel):
    department: str
    confidence: float
    severity: str
    priority_score: int
    generated_title: str
    detected_language: str

@app.get("/", response_class=HTMLResponse)
def read_root():
    status_color = "emerald" if model is not None else "rose"
    status_text = "Operational" if model is not None else "Degraded (Model Failed to Load)"
    status_icon = "🟢" if model is not None else "🔴"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UCRS AI Routing Service</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body {{
                font-family: 'Plus Jakarta Sans', sans-serif;
                background-color: #0b0f19;
            }}
            .ambient-glow {{
                position: absolute;
                width: 400px;
                height: 400px;
                background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%);
                border-radius: 50%;
                filter: blur(40px);
            }}
            .glass {{
                background: rgba(17, 24, 39, 0.7);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.08);
            }}
        </style>
    </head>
    <body class="relative min-h-screen text-slate-100 flex items-center justify-center p-4 overflow-hidden">
        <!-- Background Ambient Glows -->
        <div class="ambient-glow -top-40 -left-40"></div>
        <div class="ambient-glow -bottom-40 -right-40"></div>
        
        <div class="glass max-w-xl w-full rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 text-center transition-all duration-300 hover:border-indigo-500/20">
            <!-- Icon/Branding -->
            <div class="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
            </div>
            
            <h1 class="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                UCRS AI Service
            </h1>
            <p class="text-slate-400 text-sm md:text-base mb-8">
                Statewide multilingual natural language processing for automated grievance classification, severity analysis, and duplicate detection.
            </p>
            
            <!-- Diagnostics / Status Grid -->
            <div class="grid grid-cols-2 gap-4 mb-8 text-left">
                <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                    <span class="text-xs text-slate-500 uppercase tracking-wider block mb-1">System Status</span>
                    <span class="text-sm font-semibold flex items-center gap-2 text-{status_color}-400">
                        <span>{status_icon}</span> {status_text}
                    </span>
                </div>
                <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                    <span class="text-xs text-slate-500 uppercase tracking-wider block mb-1">AI Engine</span>
                    <span class="text-sm font-semibold text-slate-300">
                        Multilingual MiniLM
                    </span>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="space-y-3">
                <a href="/docs" class="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-center">
                    Interactive API Docs (Swagger)
                </a>
                <div class="flex gap-3">
                    <a href="/health" class="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white font-medium py-3 px-4 rounded-2xl transition-all duration-200 text-sm">
                        🔍 Diagnostics
                    </a>
                    <a href="/redoc" class="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white font-medium py-3 px-4 rounded-2xl transition-all duration-200 text-sm">
                        📚 ReDoc Schema
                    </a>
                </div>
            </div>
            
            <div class="mt-8 border-t border-slate-800/80 pt-6">
                <p class="text-xs text-slate-500">
                    Tamil Nadu Unified Public Grievance Redressal System • Microservice Node
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)

@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "model_loaded": model is not None,
        "engine": "Multilingual NLP (MiniLM-L12-v2)"
    }

@app.post("/analyze", response_model=ComplaintAnalysisResponse)
def analyze_complaint(complaint: ComplaintText):
    if not model:
        raise HTTPException(status_code=500, detail="AI Model not loaded")
    
    text = complaint.text
    logger.info(f"Incoming complaint: {text[:50]}...")
    
    # Language Detection
    try:
        lang = detect(text)
    except:
        lang = "unknown"
    logger.info(f"Detected language: {lang}")

    query_embedding = model.encode(text, convert_to_tensor=True)
    
    # Calculate similarity with all anchors in all departments
    best_dept = "Municipality" # Default
    max_sim = 0.0
    
    for dept, anchors_emb in dept_anchor_embeddings.items():
        cos_sim = util.cos_sim(query_embedding, anchors_emb)
        dept_max_sim = torch.max(cos_sim).item()
        
        if dept_max_sim > max_sim:
            max_sim = dept_max_sim
            best_dept = dept
    
    confidence = round(max_sim, 2)
    
    # Semantic severity detection
    emergency_anchors = [
        "danger", "emergency", "immediately", "hazard", "life threatening", "urgent",
        "ஆபத்து", "அவசரம்", "உடனடியாக"
    ]
    emergency_emb = model.encode(emergency_anchors, convert_to_tensor=True)
    severity_sim = torch.max(util.cos_sim(query_embedding, emergency_emb)).item()
    
    severity = "Low"
    priority_score = int(max_sim * 100)
    
    if severity_sim > 0.5:
        severity = "Critical"
        priority_score = min(priority_score + 40, 100)
    elif severity_sim > 0.35 or max_sim > 0.8:
        severity = "High"
        priority_score = min(priority_score + 20, 100)
    elif max_sim > 0.5:
        severity = "Medium"
    
    # Generate Title (Semantic based)
    anchors = DEPARTMENTS[best_dept]
    cos_sim_anchors = util.cos_sim(query_embedding, dept_anchor_embeddings[best_dept])
    best_anchor_idx = torch.argmax(cos_sim_anchors).item()
    generated_title = anchors[best_anchor_idx].title()
    
    logger.info(f"Analysis Result: {best_dept} ({confidence})")

    return ComplaintAnalysisResponse(
        department=best_dept,
        confidence=confidence,
        severity=severity,
        priority_score=priority_score,
        generated_title=generated_title,
        detected_language=lang
    )

@app.post("/multilingual-test")
def test_multilingual(complaint: ComplaintText):
    return analyze_complaint(complaint)

class SimilarityRequest(BaseModel):
    text1: str
    text2: str

@app.post("/similarity")
def check_similarity(req: SimilarityRequest):
    if not model:
        raise HTTPException(status_code=500, detail="AI Model not loaded")
        
    emb1 = model.encode(req.text1, convert_to_tensor=True)
    emb2 = model.encode(req.text2, convert_to_tensor=True)
    
    similarity = util.cos_sim(emb1, emb2).item()
    
    return {
        "similarity_score": round(similarity, 4),
        "is_duplicate": similarity > 0.75
    }

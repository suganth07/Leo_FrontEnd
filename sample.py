from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from googleapiclient.discovery import build
from google.oauth2 import service_account
from PIL import Image
import numpy as np
import io
import pickle
import json
import time
import logging
from supabase import create_client
from uuid import uuid4
import os
import base64
import requests
from dotenv import load_dotenv
import insightface
import cv2
import gc
import psutil
from numpy.linalg import norm

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logging.getLogger("httpx").setLevel(logging.ERROR)


# App
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load credentials
load_dotenv()
SCOPES = ['https://www.googleapis.com/auth/drive']

encoded_credentials = os.getenv("GOOGLE_SERVICE_ACCOUNT_BASE64")
if not encoded_credentials:
    raise ValueError("Service account Base64 is missing!")
decoded_json = base64.b64decode(encoded_credentials)
credentials = service_account.Credentials.from_service_account_info(
    json.loads(decoded_json), scopes=SCOPES
)
drive_service = build('drive', 'v3', credentials=credentials)

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = "encodings"
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Photo root folder
PHOTOS_FOLDER_ID = os.getenv("PHOTOS_FOLDER_ID")

# No models stored locally - Using InsightFace with optimal ArcFace model
API_FACE_KEY = os.getenv("API_FACE_KEY", "")

# Global face analysis app instance (lazy loaded for memory efficiency)
_face_app = None

def get_face_app():
    """
    Get InsightFace app instance with the best and fastest model.
    Uses ArcFace ResNet100 model which provides excellent accuracy and speed.
    Lazy loading to optimize memory usage.
    """
    global _face_app
    if _face_app is None:
        logger.info("Initializing InsightFace with ArcFace model...")
        _face_app = insightface.app.FaceAnalysis(
            providers=['CPUExecutionProvider'],  # Use CPU for better compatibility
            name='buffalo_l'  # This is the best balanced model (ResNet100-based)
        )
        _face_app.prepare(ctx_id=0, det_size=(640, 640))  # Optimal detection size
        logger.info("InsightFace initialized successfully")
    return _face_app


# Models
class FolderRequest(BaseModel):
    folder_id: str
    force: bool = False

# Utils
def save_encodings(folder_id: str, encodings_data: list):
    buffer = io.BytesIO()
    pickle.dump(encodings_data, buffer)
    buffer.seek(0)
    path = f"{folder_id}.pkl"
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{path}"
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/octet-stream",
        "x-upsert": "true"
    }
    response = requests.post(upload_url, headers=headers, data=buffer)
    if response.status_code not in (200, 201):
        raise Exception(f"Upload failed: {response.text}")

def load_encodings(folder_id: str):
    try:
        path = f"{folder_id}.pkl"
        data = supabase.storage.from_(SUPABASE_BUCKET).download(path)
        return pickle.loads(data) if data else None
    except Exception:
        return None

def delete_encoding(folder_id: str):
    path = f"{folder_id}.pkl"
    headers = {"Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"}
    requests.delete(f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{path}", headers=headers)

def list_drive_files(folder_id: str, mime_type: str = 'image/') -> list:
    query = f"'{folder_id}' in parents and mimeType contains '{mime_type}' and trashed=false"
    response = drive_service.files().list(q=query, fields="files(id, name, webContentLink)").execute()
    return response.get('files', [])

def read_image_from_drive(file_id: str) -> np.ndarray:
    """Read image directly from Google Drive without local storage"""
    file_data = drive_service.files().get_media(fileId=file_id).execute()
    # Process directly in memory
    image = np.array(Image.open(io.BytesIO(file_data)))
    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR)


# Memory management utilities for minimal storage deployment
def clear_memory():
    """Force garbage collection to free memory"""
    gc.collect()

def get_memory_usage():
    """Get current memory usage"""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / 1024 / 1024  # MB


# Speed/Accuracy optimization
def optimize_face_app_for_speed():
    """
    Configure the face app for maximum speed while maintaining good accuracy.
    This can be called if you need faster processing at the cost of some accuracy.
    """
    global _face_app
    if _face_app is not None:
        # Reduce detection size for faster processing
        _face_app.prepare(ctx_id=0, det_size=(320, 320))
        logger.info("Face app optimized for speed")

def optimize_face_app_for_accuracy():
    """
    Configure the face app for maximum accuracy.
    This can be called if you need the best accuracy at the cost of some speed.
    """
    global _face_app
    if _face_app is not None:
        # Increase detection size for better accuracy
        _face_app.prepare(ctx_id=0, det_size=(960, 960))
        logger.info("Face app optimized for accuracy")


# Routes
@app.get("/hello")
async def hello():
    return {"message": "hello"}

@app.get("/api/folders")
async def list_folders():
    folders = list_drive_files(PHOTOS_FOLDER_ID, mime_type='application/vnd.google-apps.folder')
    return {"folders": folders}

@app.get("/api/images")
async def list_images(folder_id: str):
    try:
        items = list_drive_files(folder_id)
        images = [{
            "id": item["id"],
            "name": item["name"],
            "url": f"https://drive.google.com/uc?export=download&id={item['id']}"
        } for item in items]
        return {"images": images}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/api/create_encoding")
async def create_encoding(request: FolderRequest):
    folder_id, force = request.folder_id, request.force
    if load_encodings(folder_id) and not force:
        return {"status": "exists", "message": "Encoding already exists."}
    if force:
        delete_encoding(folder_id)

    files = list_drive_files(folder_id)
    encodings = []
    
    # Get face analysis app (lazy loaded)
    app = get_face_app()
    
    logger.info(f"Processing {len(files)} files for encoding...")
    
    for i, item in enumerate(files):
        try:
            # Log memory usage periodically
            if i % 10 == 0:
                logger.info(f"Processing file {i+1}/{len(files)}, Memory: {get_memory_usage():.1f}MB")
            
            # Process image directly in memory - no local storage
            img_np = read_image_from_drive(item["id"])
            faces = app.get(img_np)
            if faces:
                # InsightFace returns normalized embeddings, use the embedding directly
                encodings.append({
                    "id": item["id"],
                    "name": item["name"],
                    "embedding": faces[0].embedding.tolist()  # Use raw embedding for better accuracy
                })
            # Clear memory immediately
            del img_np
            if i % 5 == 0:  # Clear memory every 5 images
                clear_memory()
                
        except Exception as e:
            logger.warning(f"Skipping {item['name']}: {e}")
    
    save_encodings(folder_id, encodings)
    clear_memory()  # Final memory cleanup
    
    return {"status": "created", "message": f"Encoding created for {len(encodings)} faces.", "memory_used": f"{get_memory_usage():.1f}MB"}

@app.post("/api/match")
async def match_faces(file: UploadFile = File(...), folder_id: str = Form(...)):
    try:
        # Process uploaded image directly in memory
        img_bytes = await file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        img_np = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

        # Get face analysis app (lazy loaded)
        app = get_face_app()
        faces = app.get(img_np)

        if not faces:
            return JSONResponse(content={"error": "No face found."}, status_code=400)

        # Get the embedding from the uploaded image
        uploaded_embedding = faces[0].embedding
        # Normalize the embedding for cosine similarity
        uploaded_embedding = uploaded_embedding / norm(uploaded_embedding)
        
        known_data = load_encodings(folder_id)

        if not known_data:
            return JSONResponse(content={"error": "Encodings not found."}, status_code=404)

        matched = []

        async def event_stream():
            total = len(known_data)
            for i, item in enumerate(known_data):
                # Convert back from list to numpy array and normalize
                item_embedding = np.array(item["embedding"])
                item_embedding = item_embedding / norm(item_embedding)
                
                # Calculate cosine similarity between normalized embeddings
                similarity = np.dot(uploaded_embedding, item_embedding)
                
                # Use threshold of 0.6 for good balance between accuracy and recall
                if similarity > 0.6:
                    matched.append({
                        "id": item["id"],
                        "name": item["name"],
                        "url": f"https://drive.google.com/uc?export=download&id={item['id']}",
                        "similarity": float(similarity)  # Include similarity score
                    })
                yield f"data: {json.dumps({'progress': int((i + 1) / total * 100)})}\n\n"
                time.sleep(0.05)

            yield f"data: {json.dumps({'progress': 100, 'images': sorted(matched, key=lambda x: x['similarity'], reverse=True)})}\n\n"

        # Clear memory after processing
        del img_np
        result = StreamingResponse(event_stream(), media_type="text/event-stream")
        
        return result

    except Exception as e:
        logger.exception("Match error")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/api/has-encoding")
async def has_encoding(folder_id: str):
    try:
        files = supabase.storage.from_(SUPABASE_BUCKET).list("")
        exists = any(f["name"] == f"{folder_id}.pkl" for f in files)
        return {"exists": exists}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/api/file-metadata")
async def file_metadata(file_id: str):
    try:
        data = drive_service.files().get(fileId=file_id, fields="name").execute()
        return {"name": data["name"]}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/api/file-download")
async def file_download(file_id: str):
    try:
        content = drive_service.files().get_media(fileId=file_id).execute()
        metadata = drive_service.files().get(fileId=file_id, fields="name").execute()
        return StreamingResponse(io.BytesIO(content), media_type="application/octet-stream", headers={
            "Content-Disposition": f'attachment; filename="{metadata.get("name", file_id)}"'
        })
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/api/delete_encoding")
async def delete_encoding_api(request: FolderRequest):
    try:
        delete_encoding(request.folder_id)
        return {"status": "deleted", "message": "Encoding deleted."}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/api/check_encoding_exists")
async def check_encoding_exists(request: FolderRequest):
    try:
        exists = load_encodings(request.folder_id) is not None
        return {"exists": exists}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/generate-folder-token")
def generate_folder_token(data: dict):
    token = str(uuid4())
    supabase.table("folder_tokens").insert({
        "folder_name": data["folder_name"],
        "token": token
    }).execute()
    return {"token": token}

@app.get("/health")
async def health_check():
    """Health check endpoint with memory monitoring and model info"""
    try:
        memory_mb = get_memory_usage()
        model_loaded = _face_app is not None
        return {
            "status": "healthy",
            "memory_usage_mb": round(memory_mb, 1),
            "memory_limit_mb": 512,
            "memory_usage_percent": round((memory_mb / 512) * 100, 1),
            "face_model_loaded": model_loaded,
            "face_model": "InsightFace Buffalo_L (ArcFace ResNet100)" if model_loaded else "Not loaded"
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.post("/api/optimize-speed")
async def optimize_for_speed():
    """Optimize face recognition for maximum speed"""
    try:
        optimize_face_app_for_speed()
        return {"status": "optimized", "mode": "speed", "message": "Face recognition optimized for speed"}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/api/optimize-accuracy")
async def optimize_for_accuracy():
    """Optimize face recognition for maximum accuracy"""
    try:
        optimize_face_app_for_accuracy()
        return {"status": "optimized", "mode": "accuracy", "message": "Face recognition optimized for accuracy"}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10001))
    uvicorn.run("sample:app", host="0.0.0.0", port=port)

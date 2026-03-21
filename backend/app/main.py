from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException, Header
from typing import Optional
from dotenv import load_dotenv
import logging
import time
import hashlib

from contextlib import asynccontextmanager

# Load environment variables at the very beginning
load_dotenv()

from app.services.model_service import model_service
from app.services.supabase_service import supabase_service
from app.schemas.api_schemas import TrafficInput, DetectionResponse, AlertUpdate
from app.middleware.auth import get_current_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model at startup
    model_service.load_model()
    yield
    # Clean up if needed

app = FastAPI(title="ThreatVision Backend", version="1.0.0", lifespan=lifespan)

logger = logging.getLogger(__name__)

def process_analysis(input_data: TrafficInput, user_id: Optional[str] = None):
    start_time = time.time()
    
    # Preprocess (simple hash for input tracking)
    input_hash = hashlib.sha256(input_data.network_data.encode()).hexdigest()
    
    # Run inference
    result = model_service.predict(input_data.network_data)
    
    latency = (time.time() - start_time) * 1000 # ms
    
    # Prepare DB record
    db_data = {
        "source_ip": input_data.metadata.get("source_ip"),
        "network_data": input_data.network_data,
        "input_hash": input_hash,
        "classification": result["classification"],
        "confidence": result["confidence"],
        "probabilities": result["probabilities"],
        "model_version": result["model_version"],
        "user_id": user_id,
        "latency_ms": latency,
        "device_id": input_data.metadata.get("device_id")
    }
    
    # Log to Supabase
    detection = supabase_service.log_detection(db_data)
    
    # Trigger alert if malicious
    if result["alert_generated"] and detection:
        severity = "High" if result["confidence"] > 0.9 else "Medium"
        supabase_service.create_alert(detection["id"], severity)
    
    return result

@app.post("/analyze", response_model=DetectionResponse)
def analyze_traffic(
    input_data: TrafficInput, 
    background_tasks: BackgroundTasks, 
    user_id: str = Depends(get_current_user)
):
    """
    FastAPI runs regular 'def' routes in a threadpool, which is ideal
    for CPU-heavy tasks like the model prediction.
    """
    result = process_analysis(input_data, user_id)
    return result

@app.get("/detections")
async def get_detections(limit: int = 50, source_ip: Optional[str] = None, user_id: str = Depends(get_current_user)):
    return supabase_service.get_detections(limit=limit, source_ip=source_ip)

@app.get("/alerts")
async def get_alerts(limit: int = 50, status: Optional[str] = None, user_id: str = Depends(get_current_user)):
    return supabase_service.get_alerts(limit=limit, status=status)

@app.patch("/alerts/{alert_id}")
async def update_alert(alert_id: str, update_data: AlertUpdate, user_id: str = Depends(get_current_user)):
    result = supabase_service.update_alert(alert_id, update_data.model_dump(exclude_unset=True))
    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")
    return result

@app.get("/metrics")
async def get_metrics(user_id: str = Depends(get_current_user)):
    return supabase_service.get_metrics()

@app.get("/model-info")
async def get_model_info():
    return {
        "model_name": model_service.model_name,
        "device": model_service.device,
        "threshold": model_service.threshold,
        "labels": model_service.labels
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model_service.model is not None}

from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class TrafficInput(BaseModel):
    network_data: str
    api_sequence: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DetectionResponse(BaseModel):
    classification: str
    confidence: float
    model_version: str
    alert_generated: bool

class AlertUpdate(BaseModel):
    status: str
    assigned_to: Optional[str] = None

import pytest
from app.services.model_service import ModelService

def test_model_service_prediction():
    service = ModelService()
    # Mocking or loading lightly if possible, here we assume it can load locally
    # For a real CI, you'd mock the transformer model
    text = "GET /admin.php?id=1' OR 1=1--"
    result = service.predict(text)
    
    assert "classification" in result
    assert "confidence" in result
    assert "model_version" in result
    assert isinstance(result["confidence"], float)

def test_batch_prediction():
    service = ModelService()
    texts = ["GET /index.html", "POST /login HTTP/1.1"]
    results = service.batch_predict(texts)
    
    assert len(results) == 2
    assert results[0]["classification"] in ["Benign", "Malicious"]

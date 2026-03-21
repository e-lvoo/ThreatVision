import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F
import logging
import time
from typing import Dict, Any, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = "gates04/DistilBERT-Network-Intrusion-Detection"
        self.tokenizer: Optional[Any] = None
        self.model: Optional[Any] = None
        self.labels = ["Benign", "Malicious"] # Adjust based on actual model labels if different
        self.threshold = 0.8 # Default threshold

    def load_model(self):
        """Load the model and tokenizer from Hugging Face."""
        if self.model is None or self.tokenizer is None:
            try:
                logger.info(f"Loading model {self.model_name} on {self.device}...")
                start_time = time.time()
                
                tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
                
                if model is None or tokenizer is None:
                    raise ValueError("Tokenizer or Model returned None from Hugging Face")

                model.to(self.device)
                model.eval()
                
                self.tokenizer = tokenizer
                self.model = model
                
                logger.info(f"Model loaded in {time.time() - start_time:.2f} seconds.")
            except Exception as e:
                logger.error(f"Failed to load model {self.model_name}: {e}")
                self.model = None
                self.tokenizer = None

    def predict(self, text: str) -> Dict[str, Any]:
        """Perform inference on the input text."""
        if self.model is None or self.tokenizer is None:
            self.load_model()

        # If still None after load attempt, return a fallback result
        t = self.tokenizer
        m = self.model
        if t is None or m is None:
            logger.error("Model unavailable for prediction")
            return {
                "classification": "Error",
                "confidence": 0.0,
                "probabilities": [0.5, 0.5],
                "model_version": "None",
                "alert_generated": False,
                "error": "Model failed to load"
            }
        
        assert t is not None, "Tokenizer must be loaded"
        assert m is not None, "Model must be loaded"

        inputs = t(text, return_tensors="pt", truncation=True, padding=True).to(self.device)
        
        with torch.no_grad():
            outputs = m(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            
            conf, pred_idx = torch.max(probs, dim=1)
            confidence = float(conf.item())
            idx = int(pred_idx.item())
            prediction = str(self.labels[idx])

            return {
                "classification": prediction,
                "confidence": confidence,
                "probabilities": probs.tolist()[0],
                "model_version": self.model_name,
                "alert_generated": confidence > self.threshold if prediction == "Malicious" else False
            }

    def batch_predict(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Perform batch inference."""
        if self.model is None or self.tokenizer is None:
            self.load_model()

        t = self.tokenizer
        m = self.model
        if t is None or m is None:
            return [{ "error": "Model unavailable" } for _ in texts]
        
        assert t is not None, "Tokenizer must be loaded"
        assert m is not None, "Model must be loaded"

        inputs = t(texts, return_tensors="pt", truncation=True, padding=True).to(self.device)
        
        with torch.no_grad():
            outputs = m(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            
            confs, pred_indices = torch.max(probs, dim=1)
            
            results = []
            for i in range(len(texts)):
                confidence = float(confs[i].item())
                idx = int(pred_indices[i].item())
                prediction = str(self.labels[idx])
                results.append({
                    "classification": prediction,
                    "confidence": confidence,
                    "probabilities": probs[i].tolist(),
                    "model_version": self.model_name,
                    "alert_generated": confidence > self.threshold if prediction == "Malicious" else False
                })
            return results

# Singleton instance
model_service = ModelService()

import httpx
import os
import logging
import time
from typing import Dict, Any, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self):
        self.model_name = "gates04/DistilBERT-Network-Intrusion-Detection"
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model_name}"
        self.api_key = os.getenv("HF_API_KEY")
        self.labels = ["Benign", "Malicious"]
        self.threshold = 0.8

    def _get_headers(self):
        return {"Authorization": f"Bearer {self.api_key}"}

    def predict(self, text: str) -> Dict[str, Any]:
        """Perform inference on the input text via Hugging Face API."""
        try:
            start_time = time.time()
            
            with httpx.Client() as client:
                response = client.post(
                    self.api_url,
                    headers=self._get_headers(),
                    json={"inputs": text},
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()

            logger.info(f"Inference completed in {time.time() - start_time:.2f} seconds.")

            # Result is a list of [{"label": ..., "score": ...}]
            scores = result[0] if isinstance(result[0], list) else result
            top = max(scores, key=lambda x: x["score"])
            prediction = top["label"]
            confidence = float(top["score"])

            probabilities = [0.0, 0.0]
            for item in scores:
                if item["label"] in self.labels:
                    idx = self.labels.index(item["label"])
                    probabilities[idx] = float(item["score"])

            return {
                "classification": prediction,
                "confidence": confidence,
                "probabilities": probabilities,
                "model_version": self.model_name,
                "alert_generated": confidence > self.threshold if prediction == "Malicious" else False
            }

        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return {
                "classification": "Error",
                "confidence": 0.0,
                "probabilities": [0.5, 0.5],
                "model_version": self.model_name,
                "alert_generated": False,
                "error": str(e)
            }

    def batch_predict(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Perform batch inference via Hugging Face API."""
        try:
            with httpx.Client() as client:
                response = client.post(
                    self.api_url,
                    headers=self._get_headers(),
                    json={"inputs": texts},
                    timeout=60.0
                )
                response.raise_for_status()
                results = response.json()

            output = []
            for result in results:
                scores = result if isinstance(result, list) else [result]
                top = max(scores, key=lambda x: x["score"])
                prediction = top["label"]
                confidence = float(top["score"])

                probabilities = [0.0, 0.0]
                for item in scores:
                    if item["label"] in self.labels:
                        idx = self.labels.index(item["label"])
                        probabilities[idx] = float(item["score"])

                output.append({
                    "classification": prediction,
                    "confidence": confidence,
                    "probabilities": probabilities,
                    "model_version": self.model_name,
                    "alert_generated": confidence > self.threshold if prediction == "Malicious" else False
                })
            return output

        except Exception as e:
            logger.error(f"Batch prediction failed: {e}")
            return [{"error": str(e)} for _ in texts]

# Singleton instance
model_service = ModelService()
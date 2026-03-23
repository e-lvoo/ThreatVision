import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
        if not self.url or not self.key:
            logger.warning("Supabase credentials not found in environment variables.")
        self.client: Optional[Client] = None

    def init_client(self):
        if self.client is not None:
            return self.client

        if not self.url or not self.key:
            logger.warning("Supabase client not initialized because credentials are missing.")
            return None

        self.client = create_client(self.url, self.key)
        logger.info("Supabase client initialized successfully.")
        return self.client

    def log_detection(self, data: dict):
        """Insert a detection result into the database."""
        if not self.client:
            logger.error("Supabase client not initialized.")
            return None
        
        try:
            result = self.client.table("detection_results").insert(data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error logging detection: {e}")
            return None

    def create_alert(self, detection_id: str, severity: str = "Medium"):
        """Create an alert for a malicious detection."""
        if not self.client:
            return None
        
        alert_data = {
            "detection_id": detection_id,
            "severity": severity,
            "status": "new"
        }
        try:
            result = self.client.table("alerts").insert(alert_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating alert: {e}")
            return None

    def get_detections(self, limit: int = 50, source_ip: Optional[str] = None):
        """Fetch latest detections with filtering."""
        if not self.client:
            return []
        try:
            query = self.client.table("detection_results").select("*")
            if source_ip:
                query = query.eq("source_ip", source_ip)
            result = query.order("timestamp", desc=True).limit(limit).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching detections: {e}")
            return []

    def get_alerts(self, limit: int = 50, status: Optional[str] = None):
        """Fetch latest alerts."""
        if not self.client:
            return []
        try:
            query = self.client.table("alerts").select("*, detection_results(*)")
            if status:
                query = query.eq("status", status)
            result = query.order("created_at", desc=True).limit(limit).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching alerts: {e}")
            return []

    def update_alert(self, alert_id: str, data: dict):
        """Update an alert's status or assignment."""
        if not self.client:
            return None
        try:
            result = self.client.table("alerts").update(data).eq("id", alert_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error updating alert: {e}")
            return None

    def get_metrics(self):
        """Fetch monitoring metrics efficiently."""
        if not self.client:
            return {}
        try:
            # Optimize: use count with head=True to avoid fetching all rows
            detections = self.client.table("detection_results") \
                .select("*", count="exact") \
                .limit(1) \
                .execute()
            total_count = detections.count if detections.count is not None else 0
            
            malicious = self.client.table("detection_results") \
                .select("*", count="exact") \
                .eq("classification", "Malicious") \
                .limit(1) \
                .execute()
            malicious_count = malicious.count if malicious.count is not None else 0
            
            return {
                "total_detections": total_count,
                "malicious_detections": malicious_count,
                "benign_detections": total_count - malicious_count,
                "detection_rate": (malicious_count / total_count) if total_count > 0 else 0
            }
        except Exception as e:
            logger.error(f"Error fetching metrics: {e}")
            return {}

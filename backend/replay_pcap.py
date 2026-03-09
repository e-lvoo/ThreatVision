import sys
import requests
import time
import logging
from scapy.all import rdpcap, Raw, IP
import argparse
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PCAPReplayer:
    def __init__(self, api_url="http://localhost:8000/analyze", delay=0.1):
        self.api_url = api_url
        self.delay = delay
        self.total_processed = 0
        self.detections = 0

    def extract_payload(self, packet):
        """Extract text payload from the packet."""
        if Raw in packet:
            try:
                payload = packet[Raw].load.decode('utf-8', errors='ignore')
                if len(payload.strip()) > 5:
                    return payload
            except Exception:
                pass
        return None

    def send_to_api(self, payload, src_ip):
        """Send captured payload to the ThreatVision API."""
        try:
            data = {
                "network_data": payload,
                "metadata": {
                    "source_ip": src_ip,
                    "device_id": "pcap-replayer",
                    "capture_tool": "scapy-replayer"
                }
            }
            response = requests.post(self.api_url, json=data, timeout=5)
            if response.status_code == 200:
                result = response.json()
                if result.get("alert_generated"):
                    self.detections += 1
                    logger.warning(f"[MALICIOUS] Detected in packet from {src_ip}! Confidence: {result.get('confidence'):.2f}")
                return True
            else:
                logger.error(f"API Error: {response.status_code}")
        except Exception as e:
            logger.error(f"Failed to send to API: {e}")
        return False

    def replay(self, pcap_file):
        """Replay packets from a PCAP file."""
        if not os.path.exists(pcap_file):
            logger.error(f"File not found: {pcap_file}")
            return

        logger.info(f"Reading PCAP file: {pcap_file}")
        try:
            packets = rdpcap(pcap_file)
            logger.info(f"Loaded {len(packets)} packets. Starting replay...")
            
            for packet in packets:
                if IP in packet:
                    payload = self.extract_payload(packet)
                    if payload:
                        self.total_processed += 1
                        success = self.send_to_api(payload, packet[IP].src)
                        if success and self.delay > 0:
                            time.sleep(self.delay)
                            
            logger.info("--- Replay Summary ---")
            logger.info(f"Total Packets Processed: {self.total_processed}")
            logger.info(f"Detections Found: {self.detections}")
            
        except Exception as e:
            logger.error(f"Error reading PCAP: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ThreatVision PCAP Replayer")
    parser.add_argument("file", help="Path to the .pcap file")
    parser.add_argument("--url", default="http://localhost:8000/analyze", help="API URL")
    parser.add_argument("--delay", type=float, default=0.1, help="Delay between packets (seconds)")
    
    args = parser.parse_args()
    
    replayer = PCAPReplayer(api_url=args.url, delay=args.delay)
    replayer.replay(args.file)

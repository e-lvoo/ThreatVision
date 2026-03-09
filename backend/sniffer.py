import sys
import requests
import json
import logging
from scapy.all import sniff, IP, TCP, UDP, Raw
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ThreatVisionSniffer:
    def __init__(self, api_url="http://localhost:8000/analyze", interface=None):
        self.api_url = api_url
        self.interface = interface
        self.packet_count = 0

    def extract_payload(self, packet):
        """Extract text payload from the packet."""
        if Raw in packet:
            try:
                payload = packet[Raw].load.decode('utf-8', errors='ignore')
                # Basic filtering to get meaningful text (e.g., HTTP headers/body)
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
                    "device_id": f"sniffer-{self.interface or 'default'}",
                    "capture_tool": "scapy-sniffer"
                }
            }
            response = requests.post(self.api_url, json=data, timeout=2)
            if response.status_code == 200:
                result = response.json()
                status = "DETECTED" if result.get("alert_generated") else "Clean"
                logger.info(f"[{status}] Packet from {src_ip} analyzed. Confidence: {result.get('confidence'):.2f}")
            else:
                logger.error(f"API Error: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Failed to send to API: {e}")

    def packet_callback(self, packet):
        """Callback function for each captured packet."""
        if IP in packet:
            src_ip = packet[IP].src
            payload = self.extract_payload(packet)
            
            if payload:
                # Avoid sniffing our own API requests to prevent infinite loops
                # (Simple check: if destination is localhost and port is 8000, skip)
                if packet.haslayer(TCP) and packet[IP].dst == "127.0.0.1" and packet[TCP].dport == 8000:
                    return

                self.packet_count += 1
                self.send_to_api(payload, src_ip)

    def start(self):
        """Start the sniffer."""
        logger.info(f"Starting ThreatVision Sniffer on interface: {self.interface or 'all'}")
        logger.info(f"Sending data to: {self.api_url}")
        try:
            sniff(
                iface=self.interface,
                prn=self.packet_callback,
                store=0,
                filter="tcp or udp" # Focus on common traffic
            )
        except Exception as e:
            logger.error(f"Sniffer error: {e}")
            if "WinError 10022" in str(e) or "Npcap" in str(e):
                logger.error("TIP: Ensure Npcap/WinPcap is installed and you are running as Administrator.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ThreatVision Network Sniffer")
    parser.add_argument("--url", default="http://localhost:8000/analyze", help="API URL")
    parser.add_argument("--iface", default=None, help="Network interface to sniff on")
    
    args = parser.parse_args()
    
    sniffer = ThreatVisionSniffer(api_url=args.url, interface=args.iface)
    sniffer.start()

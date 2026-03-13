import sys
import requests
import json
import logging
import os
from scapy.all import sniff, IP, TCP, UDP, Raw
import argparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ThreatVisionSniffer:
    def __init__(self, api_url=None, api_key=None, interface=None):
        # Prefer env variables, then args, then defaults
        self.api_url = api_url or os.getenv("TV_API_URL", "http://localhost:8000/analyze")
        self.api_key = api_key or os.getenv("TV_API_KEY")
        self.interface = interface
        self.packet_count = 0
        
        # Identify local IPs to avoid loopback sniffing
        self.local_ips = self._get_local_ips()
        
        # If cloud hosted, we need a key
        if "localhost" not in self.api_url and "127.0.0.1" not in self.api_url and not self.api_key:
            logger.warning("Sniffer pointing to remote URL but no API Key found. Authorization may fail.")

    def _get_local_ips(self):
        """Simple heuristic to find local IPs."""
        import socket
        try:
            hostname = socket.gethostname()
            return socket.gethostbyname_ex(hostname)[2] + ["127.0.0.1"]
        except:
            return ["127.0.0.1"]

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
            
            headers = {}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            response = requests.post(self.api_url, json=data, headers=headers, timeout=5)
            
            if response.status_code == 200:
                result = response.json()
                status = "DETECTED" if result.get("alert_generated") else "Clean"
                logger.info(f"[{status}] Packet from {src_ip} analyzed. Confidence: {result.get('confidence'):.2f}")
            elif response.status_code == 401:
                logger.error("API Error: 401 Unauthorized. Check your TV_API_KEY.")
            else:
                logger.error(f"API Error: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Failed to send to API: {e}")

    def packet_callback(self, packet):
        """Callback function for each captured packet."""
        if IP in packet:
            src_ip = packet[IP].src
            dst_ip = packet[IP].dst
            
            # LOOP PREVENTION: Don't sniff traffic going to our own API
            # This prevents recursive analysis of the sniffer's own reports
            if "render.com" in self.api_url or "vercel.app" in self.api_url:
                # For cloud, we often rely on common sense or hostname checks
                # but a simple way is to check port or specific headers if we could.
                # Here we just check simple string match for demonstration.
                pass 

            payload = self.extract_payload(packet)
            
            if payload:
                # Simple loop prevention for local dev
                if dst_ip in self.local_ips and packet.haslayer(TCP) and (packet[TCP].dport == 8000 or packet[TCP].dport == 5173):
                    return

                self.packet_count += 1
                self.send_to_api(payload, src_ip)

    def start(self):
        """Start the sniffer."""
        logger.info(f"Starting ThreatVision Sniffer on interface: {self.interface or 'all'}")
        logger.info(f"Sending data to: {self.api_url}")
        if self.api_key:
            logger.info("Authentication: Bearer Token Enabled")
            
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
    parser = argparse.ArgumentParser(description="ThreatVision Network Sniffer Agent")
    parser.add_argument("--url", default=None, help="API URL (overrides TV_API_URL env)")
    parser.add_argument("--key", default=None, help="API Key (overrides TV_API_KEY env)")
    parser.add_argument("--iface", default=None, help="Network interface to sniff on")
    
    args = parser.parse_args()
    
    sniffer = ThreatVisionSniffer(api_url=args.url, api_key=args.key, interface=args.iface)
    sniffer.start()

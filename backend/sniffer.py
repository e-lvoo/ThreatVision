import os
import argparse
import logging
import socket
import time
from urllib.parse import urlparse

import requests
from scapy.all import IP, Raw, TCP, UDP, sniff
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
    def __init__(self, api_url=None, interface=None):
        # Prefer env variable, then args, then deployed backend default
        self.api_url = api_url or os.getenv("TV_API_URL") or "https://threatvision-backend.onrender.com/analyze"
        self.interface = interface
        self.packet_count = 0
        self.relevant_packet_count = 0

        # Identify local IPs and backend target IPs to avoid loopback sniffing
        self.local_ips = self._get_local_ips()
        self.api_host = self._get_api_host()
        self.api_host_ips = self._get_api_host_ips()
        self.loop_markers = {
            "onrender.com",
            "threatvision-backend"
        }
        if self.api_host:
            self.loop_markers.add(self.api_host.lower())

    def _get_local_ips(self):
        """Simple heuristic to find local IPs."""
        try:
            hostname = socket.gethostname()
            return socket.gethostbyname_ex(hostname)[2] + ["127.0.0.1"]
        except Exception:
            return ["127.0.0.1"]

    def _get_api_host(self):
        parsed = urlparse(self.api_url)
        return parsed.hostname

    def _get_api_host_ips(self):
        if not self.api_host:
            return set()

        try:
            _, _, ip_list = socket.gethostbyname_ex(self.api_host)
            return set(ip_list)
        except Exception:
            return set()

    def extract_payload(self, packet):
        """Extract readable payload text when available."""
        if Raw not in packet:
            return None

        try:
            payload = packet[Raw].load.decode("utf-8", errors="ignore").strip()
            return payload or None
        except Exception:
            return None

    def is_interesting_payload(self, payload):
        if not payload:
            return False

        keywords = [
            "GET", "POST", "HTTP",
            "Host:", "User-Agent",
            "login", "password", "admin",
            "select", "drop", "insert",
            "<script>", "' or", "--"
        ]

        payload_lower = payload.lower()
        return any(keyword.lower() in payload_lower for keyword in keywords)

    def should_ignore_packet(self, packet, payload_text=None):
        """Ignore packets that look like our own backend traffic."""
        if IP not in packet:
            return True

        src_ip = packet[IP].src
        dst_ip = packet[IP].dst

        if src_ip in self.api_host_ips or dst_ip in self.api_host_ips:
            return True

        if payload_text:
            lowered = payload_text.lower()
            if any(marker in lowered for marker in self.loop_markers):
                return True

        return False

    def send_to_api(self, data):
        """Send captured payload to the ThreatVision API."""
        headers = {"Content-Type": "application/json"}

        try:
            response = requests.post(self.api_url, json=data, headers=headers, timeout=20)

            if response.status_code == 200:
                result = response.json()
                status = "DETECTED" if result.get("alert_generated") else "Clean"
                logger.info(f"[{status}] Relevant payload #{self.relevant_packet_count} analyzed. Confidence: {result.get('confidence'):.2f}")
            else:
                logger.error(f"API Error: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Failed to send to API: {e}")

    def packet_callback(self, packet):
        """Callback function for each captured packet."""
        try:
            payload_text = self.extract_payload(packet)
            if self.should_ignore_packet(packet, payload_text):
                return

            if not payload_text:
                return

            if not self.is_interesting_payload(payload_text):
                return

            self.packet_count += 1
            self.relevant_packet_count += 1

            if self.relevant_packet_count % 10 != 0:
                return

            logger.debug("\n[DEBUG PAYLOAD]\n%s", payload_text[:200])

            data = {
                "network_data": payload_text[:500],
                "api_sequence": payload_text[:200],
                "metadata": {
                    "source": "sniffer"
                }
            }
            self.send_to_api(data)
        except Exception as e:
            logger.debug(f"Packet handling error: {e}")

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
        except KeyboardInterrupt:
            self.flush_packets()
            logger.info("Sniffer stopped by user.")
        except Exception as e:
            logger.error(f"Sniffer error: {e}")
            if "WinError 10022" in str(e) or "Npcap" in str(e):
                logger.error("TIP: Ensure Npcap/WinPcap is installed and you are running as Administrator.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ThreatVision Network Sniffer Agent")
    parser.add_argument("--url", default=None, help="API URL (overrides TV_API_URL env)")
    parser.add_argument("--iface", default=None, help="Network interface to sniff on")
    
    args = parser.parse_args()
    
    sniffer = ThreatVisionSniffer(api_url=args.url, interface=args.iface)
    sniffer.start()

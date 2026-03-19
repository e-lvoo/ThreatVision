# ThreatVision 🛡️

ThreatVision is a real-time, AI-powered network intrusion and malware detection system. It employs an **Agent-Collector architecture**, analyzing live network traffic using state-of-the-art Hugging Face transformer models to identify malicious activity, and visualizing the data in a modern, React-based Security Operations Center (SOC) dashboard.

## 🏗️ System Architecture

The system is broken down into three main components:

1. **Frontend (Vercel)**: A React/Vite web application acting as the SOC. It listens to real-time threat alerts from Supabase.
2. **Backend (Render)**: A FastAPI Python service deployed via Docker. It receives packet data, queries the Hugging Face Inference API for threat analysis, and logs alerts to the database.
3. **Local Sniffer Agent (Your Network)**: A lightweight Python script (`sniffer.py`) running on your local network/machine. It captures live packets and ships them over HTTPS to the remote backend.

---

## 🚀 Deployment Guide

### 1. Database Setup (Supabase)
ThreatVision relies on Supabase for data storage and real-time websockets.
1. Create a new project on [Supabase](https://supabase.com).
2. Set up your authentication (`profiles` table) and database schema (`detections`, `alerts` tables).
3. Obtain your **Project URL** and **Service Role Key / Anon Key**.

### 2. Backend Deployment (Render)
The backend is completely containerized and uses `httpx` to communicate with the Hugging Face API, removing the need for heavy local GPU dependencies.

1. Push your repository to GitHub.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the **Build Command** to Docker. Render will automatically detect the `Dockerfile` inside the `backend/` directory if configured correctly, or you can specify the root directory as `backend/`.
5. **Environment Variables**: You MUST set the following Environment Variables in the Render dashboard:
    *   `SUPABASE_URL`: Your Supabase project URL.
    *   `SUPABASE_JWT_SECRET`: Your Supabase JWT secret (for verifying auth tokens).
    *   `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for backend inserts).
    *   `HF_API_KEY`: Your Hugging Face Access Token *(crucial for making inference API calls)*.
6. Deploy the service. Once live, note the URL (e.g., `https://threatvision-api.onrender.com`).

### 3. Frontend Deployment (Vercel)
The UI is a standard React SPA (Single Page Application).

1. Go to [Vercel](https://vercel.com) and create a new Project.
2. Select your GitHub repository.
3. Set the **Framework Preset** to `Vite`.
4. Ensure the **Root Directory** is set to `Frontend/`.
5. **Environment Variables**: Add your Supabase credentials here for the client-side app:
    *   `VITE_SUPABASE_URL`: Your Supabase project URL.
    *   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anonymous public key.
    *   `VITE_API_URL`: The URL of your newly deployed Render Backend (e.g., `https://threatvision-api.onrender.com`).
6. Deploy! Vercel will use the `vercel.json` provided to correctly route all traffic to `index.html`.

---

## 🕵️ Running the Local Sniffer Agent

Because your backend is now in the cloud, it cannot directly "see" your local Wi-Fi or Ethernet traffic. You must run the `sniffer.py` script locally on the network you wish to monitor.

### Prerequisites (Local Machine)
1. Python 3.10+ installed.
2. Install Npcap (Windows) or libpcap (Linux/Mac) for packet capture.
3. Install the sniffer requirements:
   ```bash
   cd backend
   pip install scapy requests python-dotenv
   ```

### Configuration
Create a `.env` file in the `backend/` directory on your local machine (use `.env.example` as a template):
```env
TV_API_URL=https://your-render-app-url.onrender.com/analyze
TV_API_KEY=your_secure_bearer_token  # Optional: Implement this in middleware if restricting agent access
```

### Start Capturing
Run the sniffer as Administrator/Root (required to capture raw packets):
```bash
python sniffer.py
```
*(Optional: Use `--iface "Wi-Fi"` to specify a specific network interface).*

The sniffer will silently capture text/http payloads, ignore its own outbound API calls (to prevent infinite loops), and forward the traffic to your Render backend where the AI model will evaluate it.

---

## 🧠 How the AI Works (Hugging Face API)

The backend (`model_service.py`) no longer downloads gigabytes of PyTorch weights to the server. Instead, it utilizes the **Hugging Face Serverless Inference API**.

1. The `sniffer.py` captures a packet payload.
2. It POSTs the text payload to FastAPI (`/analyze`).
3. FastAPI takes the text and makes an asynchronous `httpx` HTTP call to:
   `https://api-inference.huggingface.co/models/gates04/DistilBERT-Network-Intrusion-Detection`
4. Hugging Face processes the text using their DistilBERT model and returns a probability score (e.g., `92% Malicious`).
5. FastAPI logs this to Supabase and determines if an Alert should be triggered based on the target threshold.

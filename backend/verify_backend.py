import os
import sys
from dotenv import load_dotenv

# Add the current directory to path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.model_service import model_service
from app.services.supabase_service import supabase_service

def verify_integration():
    print("🔍 Starting Integration Verification...\n")

    # 1. Environment Variables
    print("--- 1. Checking Environment Variables ---")
    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    
    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    else:
        print("✅ Supabase credentials detected.")

    # 2. Model Loading
    print("\n--- 2. Checking Model Loading ---")
    try:
        model_service.load_model()
        print(f"✅ Model '{model_service.model_name}' loaded successfully on {model_service.device}.")
    except Exception as e:
        print(f"❌ Model loading failed: {e}")

    # 3. Database Connection
    print("\n--- 3. Checking Database Connection ---")
    if supabase_service.client:
        try:
            # Try to fetch model_info as a connectivity test
            info = supabase_service.client.table("model_info").select("*").limit(1).execute()
            print("✅ Successfully connected to Supabase Database.")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            print("💡 Did you apply the SQL migrations in the Supabase Dashboard?")
    else:
        print("❌ Supabase client initialization failed. Check your .env setup.")

    print("\n--- Summary ---")
    print("If all steps are green, run: uvicorn app.main:app --reload")

if __name__ == "__main__":
    verify_integration()

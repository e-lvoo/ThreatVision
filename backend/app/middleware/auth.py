import logging
import os
import secrets

from fastapi import HTTPException, Request
from jose import JWTError, jwt

logger = logging.getLogger(__name__)

def _get_agent_api_key() -> str | None:
    """
    Dedicated machine-to-machine credential for the local sniffer agent.

    We support both `TV_AGENT_API_KEY` and `TV_API_KEY` so existing setups can
    keep working while making the preferred server-side variable explicit.
    """
    return os.getenv("TV_AGENT_API_KEY") or os.getenv("TV_API_KEY")

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = auth_header.split(" ")[1]

    # Support a dedicated API key for the sniffer agent before attempting user JWT validation.
    agent_api_key = _get_agent_api_key()
    if agent_api_key and secrets.compare_digest(token, agent_api_key):
        return "sniffer-agent"

    supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    if not supabase_jwt_secret:
        logger.error("SUPABASE_JWT_SECRET not found and provided bearer token is not a valid agent key")
        raise HTTPException(status_code=500, detail="Internal server configuration error")

    try:
        payload = jwt.decode(token, supabase_jwt_secret, algorithms=["HS256"], audience="authenticated")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except JWTError as e:
        logger.error(f"JWT validation error: {e}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")

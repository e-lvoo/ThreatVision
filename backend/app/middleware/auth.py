from fastapi import Request, HTTPException
from jose import jwt, JWTError
import os
import logging

logger = logging.getLogger(__name__)

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = auth_header.split(" ")[1]
    supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    
    if not supabase_jwt_secret:
        logger.error("SUPABASE_JWT_SECRET not found in environment")
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

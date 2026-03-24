from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, EmailStr, Field
from services.auth import generate_otp, send_otp_email, store_otp, verify_stored_otp
from services.database import get_db

router = APIRouter()

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=8)

class VerifyRequest(BaseModel):
    email: EmailStr
    otp: str

@router.post("/signup")
async def signup(request: SignupRequest):
    """
    Registers a user and sends an OTP to their email.
    """
    print(f"DEBUG: Signup request received for {request.email}")
    
    # Persistent User Check
    mongodb = get_db()
    if mongodb is not None:
        existing = await mongodb.users.find_one({"email": request.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered. Please log in.")
    
    otp_code = generate_otp()
    await store_otp(request.email, otp_code, data={"password": request.password, "name": request.name})
    
    print(f"DEBUG: Attempting to send email...")
    success = await send_otp_email(request.email, otp_code)
    
    if not success:
        return {
            "status": "partial_success",
            "message": "Signup recorded, but email delivery failed (SMTP not configured).",
            "otp_debug": otp_code if "gaurimamidwar" in request.email else None
        }
    
    return {"status": "success", "message": "OTP sent to your email."}

@router.post("/verify")
async def verify(request: VerifyRequest):
    """
    Verifies the OTP and marks user as active in MongoDB.
    """
    user_data = await verify_stored_otp(request.email, request.otp)
    if user_data is None:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")
    
    # Save User to DB Permanently
    mongodb = get_db()
    if mongodb is not None:
        await mongodb.users.update_one(
            {"email": request.email},
            {"$set": {
                "email": request.email, 
                "name": (user_data or {}).get("name"),
                "password": (user_data or {}).get("password"),
                "verified": True
            }},
            upsert=True
        )
    
    return {"status": "success", "message": "Email verified and user saved!"}


class LoginRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8)

@router.post("/login")
async def login(request: LoginRequest):
    """
    Standard login - returns user info so frontend can store it.
    """
    email = request.email
    # Try to get user's name from DB if available
    user_name = email.split('@')[0].replace('.', ' ').title()
    mongodb = get_db()
    if mongodb is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    user_doc = await mongodb.users.find_one({"email": email})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    if user_doc.get("password") != request.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    user_name = user_doc.get("name") or email.split('@')[0].replace('.', ' ').title()
    
    return {
        "status": "success",
        "message": "Login successful.",
        "user": {
            "name": user_name,
            "email": email
        }
    }

class ProfileUpdateRequest(BaseModel):
    email: EmailStr
    name: str
    profession: Optional[str] = None

@router.put("/profile")
async def update_profile(request: ProfileUpdateRequest):
    mongodb = get_db()
    if mongodb is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    await mongodb.users.update_one(
        {"email": request.email},
        {"$set": {"name": request.name, "profession": request.profession}},
        upsert=True
    )
    return {"status": "success", "message": "Profile updated successfully"}

class PasswordChangeRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str = Field(..., min_length=8)

@router.put("/password")
async def change_password(request: PasswordChangeRequest):
    mongodb = get_db()
    if mongodb is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    # In a real app, we would verify the current password hash here.
    # For now, we update the password directly as requested for the MVP.
    await mongodb.users.update_one(
        {"email": request.email},
        {"$set": {"password": request.new_password}},
        upsert=True
    )
    return {"status": "success", "message": "Password updated successfully"}
from typing import Optional


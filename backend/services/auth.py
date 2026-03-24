import random
import string
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import Optional, Any, Dict

# --- SMTP MAIL CONFIGURATION ---
# To get a Gmail App Password: 
# 1. Enable 2-Step Verification on your Google Account.
# 2. Go to: https://myaccount.google.com/apppasswords
# 3. Create a new "App" called "ResumeAI" and copy the 16-character code.

MAIL_USERNAME = "gaurimamidwar@gmail.com" # ✅ Done!
MAIL_PASSWORD = "hbsq lxvg wxxu ssll" # ✅ Done!
MAIL_FROM = MAIL_USERNAME
MAIL_PORT = 587
MAIL_SERVER = "smtp.gmail.com"
MAIL_STARTTLS = True
MAIL_SSL_TLS = False

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=MAIL_PORT,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_STARTTLS=MAIL_STARTTLS,
    MAIL_SSL_TLS=MAIL_SSL_TLS,
    USE_CREDENTIALS=True
)

from services.database import get_db
import asyncio

def generate_otp(length: int = 6) -> str:
    """
    Generates a random numeric OTP of the specified length.
    """
    return ''.join(random.choices(string.digits, k=length))

# Temporary In-Memory Storage for OTPs (Fallback)
OTP_STORE = {}

async def store_otp(email: str, otp_code: str, data: Optional[Dict[str, Any]] = None):
    """
    Saves OTP and associated user data to MongoDB or fallback dictionary.
    """
    mongodb = get_db()
    if mongodb is not None:
        try:
            # Upsert OTP with expiration (TTL)
            await mongodb.otps.update_one(
                {"email": email},
                {"$set": {"otp": otp_code, "data": data, "createdAt": asyncio.get_event_loop().time()}},
                upsert=True
            )
            print(f"DEBUG: Saved OTP for {email} to MongoDB.")
            return True
        except Exception as e:
            print(f"DEBUG: MongoDB OTP save failed: {e}")
            
    # Fallback to in-memory
    OTP_STORE[email] = {"otp": otp_code, "data": data}
    return True

async def verify_stored_otp(email: str, otp_code: str):
    """
    Verifies OTP and returns associated data if successful.
    """
    mongodb = get_db()
    if mongodb is not None:
        try:
            record = await mongodb.otps.find_one({"email": email})
            if record and record["otp"] == otp_code:
                await mongodb.otps.delete_one({"email": email})
                return record.get("data") or {}
        except Exception as e:
            print(f"DEBUG: MongoDB OTP verification failed: {e}")
            
    # Fallback
    stored = OTP_STORE.get(email)
    if stored and stored["otp"] == otp_code:
        OTP_STORE.pop(email, None)
        return stored.get("data") or {}
    return None

async def send_otp_email(recipient_email: str, otp_code: str):
    """
    Sends the OTP code to the recipient's email with a strict timeout.
    """
    # Robust Mock Mode Check - DO NOT DO ANYTHING IF THIS FAILS
    if "YOUR_GMAIL" in MAIL_USERNAME or "YOUR_APP_PASSWORD" in MAIL_PASSWORD or "@gmail.com" not in MAIL_USERNAME:
        print(f"DEBUG: [MOCK MODE] skipping all SMTP overhead. OTP: {otp_code}")
        return False

    try:
        # Create config and fm ONLY when needed
        conf = ConnectionConfig(
            MAIL_USERNAME=MAIL_USERNAME,
            MAIL_PASSWORD=MAIL_PASSWORD,
            MAIL_FROM=MAIL_USERNAME,
            MAIL_PORT=MAIL_PORT,
            MAIL_SERVER=MAIL_SERVER,
            MAIL_STARTTLS=MAIL_STARTTLS,
            MAIL_SSL_TLS=MAIL_SSL_TLS,
            USE_CREDENTIALS=True
        )
        
        message = MessageSchema(
            subject="Your ResumeAI Verification Code",
            recipients=[recipient_email],
            body=f"Your code is: {otp_code}",
            subtype="html"
        )
        
        fm = FastMail(conf)
        
        # Strict 10s timeout for mail delivery
        await asyncio.wait_for(fm.send_message(message), timeout=10.0)
        return True
    except asyncio.TimeoutError:
        print(f"DEBUG: Mail delivery TIMEOUT (10s reached)")
        return False
    except Exception as e:
        print(f"DEBUG: Error sending email: {e}")
        return False

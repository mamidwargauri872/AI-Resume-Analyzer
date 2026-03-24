from motor.motor_asyncio import AsyncIOMotorClient
import os

# --- MONGODB CONFIGURATION ---
# Replace with your real MongoDB Atlas connection string
MONGODB_URI = "mongodb+srv://mamidwargauri872_db_user:HWT1xejxmucYMYq1@cluster0.0tweoyl.mongodb.net/?appName=Cluster0"

DB_NAME = "resume_analyzer_db"

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    """
    Initializes the MongoDB connection on app startup.
    """
    if "YOUR_PASSWORD" in MONGODB_URI:
        print("DEBUG: [MOCK DB MODE] Using local memory because MongoDB URI is not configured.")
        return False
        
    try:
        db.client = AsyncIOMotorClient(MONGODB_URI)
        db.db = db.client[DB_NAME]
        print(f"DEBUG: Connected to MongoDB database: {DB_NAME}")
        return True
    except Exception as e:
        print(f"DEBUG: Error connecting to MongoDB: {e}")
        return False

async def close_mongo_connection():
    """
    Closes the MongoDB connection on app shutdown.
    """
    if db.client:
        db.client.close()
        print("DEBUG: MongoDB connection closed.")

def get_db():
    return db.db

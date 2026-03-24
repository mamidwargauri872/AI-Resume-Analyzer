# Full-Stack AI Resume Analyzer

An AI-Powered Resume Analysis System that evaluates a candidate's resume against a given job description. 
Features a **FastAPI** backend conditionally integrated with the **Google Gemini (LLM)** and a decoupled **React (Vite)** frontend.

## Features
- **Frontend UI**: A vibrant, modern React UI for drag-and-drop resume uploading featuring high-quality CSS glassmorphism.
- **LLM Integration (Optional)**: Deep semantic analysis using the free Google Gemini model by simply dropping your API Key in the UI. 
- **Offline Fallback**: Without an API key, the backend automatically falls back to regex-based natural language heuristic parsing via NLTK/pdfplumber.
- **Match Scoring & AI Actionable Insights**: Generates targeted suggestions for improving the candidate's resume based on specific missing skills.

## Quick Start (Windows)
We have provided convenient batch scripts to run the application instantly!

1. **Start the Backend server**:
   Double click the `run_server.bat` file in the main folder.
   
2. **Start the Frontend UI**:
   Double click the `run_frontend.bat` file in the main folder.

3. **Use the App**:
   Open a web browser to **http://localhost:5173** to view and use the dashboard!

## Manual Setup & Execution
If you prefer running commands manually in PowerShell:

### Backend FastAPI
```powershell
.\venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Frontend React
```powershell
cd frontend
npm run dev
```

import pdfplumber
import nltk
from nltk.corpus import names
import re
from utils.skill_db import TECH_SKILLS

# Removed nltk.download() auto-checks because they reach out to github and severely hang the backend on some networks.
# The models are already installed locally from Phase 1.

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file using pdfplumber."""
    text = ""
    import io
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Error parsing PDF: {e}")
    return text

def extract_name(text: str) -> str:
    """Extract a probable name using a simple regex/heuristic."""
    # Look at the first 3 lines of the text
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    for line in lines[:3]:
        # If a line has 2-3 words and no numbers, it's likely a name
        if re.match(r"^[A-Za-z ]{3,30}$", line):
            return line
    if lines:
        return lines[0][:50]
    return "Unknown Candidate"

def extract_skills(text: str) -> list:
    """Extract skills from text based on predefined skill database."""
    text_lower = text.lower()
    found_skills = set()
    
    # Simple keyword matching using regex to ensure whole word match
    for skill in TECH_SKILLS:
        # Regex to match the skill as a whole word
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Keep meaningful casing: capitalize standard names mostly
            formatted_skill = skill.title() if len(skill)>3 else skill.upper()
            if skill == "nodejs": formatted_skill = "Node.js"
            if skill == "node.js": formatted_skill = "Node.js"
            if skill == "ci/cd": formatted_skill = "CI/CD"
            if skill == "rest api": formatted_skill = "REST API"
            if skill == "mysql": formatted_skill = "MySQL"
            if skill == "postgresql": formatted_skill = "PostgreSQL"
            if skill == "mongodb": formatted_skill = "MongoDB"
            if skill == "github": formatted_skill = "GitHub"
            if skill == "gitlab": formatted_skill = "GitLab"
            if skill == "scikit-learn": formatted_skill = "Scikit-Learn"

            found_skills.add(formatted_skill)
            
    return sorted(list(found_skills))

def parse_resume(file_bytes: bytes) -> dict:
    """Master function to parse a resume PDF into structured data."""
    text = extract_text_from_pdf(file_bytes)
    name = extract_name(text)
    skills = extract_skills(text)
    
    return {
        "name": name,
        "skills": skills,
        "raw_text": text
    }

def parse_job_description(text: str) -> dict:
    """Parse job description text into structured data."""
    skills = extract_skills(text)
    return {
        "skills": skills,
        "raw_text": text
    }

import json
import asyncio
import os

# --- GOOGLE GEMINI CONFIGURATION ---
# 1. Get a free API key from https://aistudio.google.com/
# 2. Paste your key below:
GEMINI_API_KEY = "AIzaSyDC9sNnWv5mGZThRC6XPH9p9E7Q_QkBv8o"
# -----------------------------------

def calculate_match_score(matched_skills: list, missing_skills: list) -> float:
    total_required = len(matched_skills) + len(missing_skills)
    if total_required == 0:
        return 0.0
    score = (len(matched_skills) / total_required) * 100.0
    return round(score, 2)

def generate_suggestions(missing_skills: list) -> list:
    suggestions = []
    for skill in missing_skills:
        suggestions.append(f"Consider adding {skill} experience or relevant projects to your resume.")
    if not suggestions:
        suggestions.append("Great job! Your skills seem to closely match the job description.")
    return suggestions

async def get_gemini_analysis(resume_text: str, jd_text: str):
    """
    Official Google Gemini AI analysis.
    Only runs if GEMINI_API_KEY is provided.
    """
    if not GEMINI_API_KEY or "PASTE_YOUR_GEMINI_API_KEY" in GEMINI_API_KEY:
        print("DEBUG: Gemini API Key missing.")
        return None

    try:
        print(f"DEBUG: Starting Gemini AI analysis (Length: JD={len(jd_text)}, Resume={len(resume_text)})...")
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Standard Gemini 1.5 Flash model
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        Act as a highly specialized Tech Recruiter. 
        Perform a Deep Match analysis between this Resume and Job Description.
        
        Job Description:
        {jd_text[:2000]}
        
        Resume Text:
        {resume_text[:4000]}
        
        ---
        Your Goal: Find EVERY technical skill, tool, and soft skill that matches between the two.
        Also find critical requirements in the JD that are MISSING in the resume.
        
        Provide a JSON response with these EXACT keys:
        1. "match_score": (integer 0-100. Be realistic but generous for relevant experience)
        2. "matched_skills": (list of tools/technologies found in both)
        3. "missing_skills": (list of key tools/skills found in JD but NOT in resume)
        4. "suggestions": (list of 4 specific, actionable bullet points to improve the resume for this specific role)
        5. "name": (the candidate's name from the resume)
        
        Return ONLY valid JSON. Start with {{ and end with }}.
        """
        
        # Run the API call with a 15s timeout
        response = await asyncio.wait_for(
            asyncio.to_thread(model.generate_content, prompt),
            timeout=30.0
        )
        print("DEBUG: Gemini AI responded successfully.")
        
        # Clean up the markdown response if present
        text = response.text
        import re
        # Try to find JSON within any code blocks or just balanced braces
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
            
        result = json.loads(text)
        print(f"DEBUG: Gemini result parsed successfully. Score: {result.get('match_score')}")
        return result
    except Exception as e:
        print(f"DEBUG: Gemini AI Error: {e}")
        return None


async def evaluate_candidate_async(candidate_skills: list, required_skills: list, resume_text: str = "", jd_text: str = "") -> dict:
    """
    Main entry point for candidate evaluation. 
    Kicks off Gemini in background and uses baseline matcher as fallback.
    """
    # 1. Start Gemini analysis in background
    ai_task = asyncio.create_task(get_gemini_analysis(resume_text, jd_text))
    
    # 2. Get baseline results quickly
    from services.matcher import match_skills
    match_data = match_skills(candidate_skills, required_skills)
    score = calculate_match_score(match_data["matched_skills"], match_data["missing_skills"])
    suggestions = generate_suggestions(match_data["missing_skills"])
    
    from services.parser import extract_name
    candidate_name = extract_name(resume_text)

    base_result = {
        "match_score": score,
        "matched_skills": match_data["matched_skills"],
        "missing_skills": match_data["missing_skills"],
        "suggestions": suggestions,
        "name": candidate_name,
        "is_llm_enhanced": False
    }

    # 3. Wait up to 30s for Gemini (Longer timeout for stability)
    try:
        ai_result = await asyncio.wait_for(ai_task, timeout=30.0)
        if ai_result:
            print(f"DEBUG: Merging Gemini results for {ai_result.get('name', candidate_name)}")
            
            # Merge logic:
            # - Use Gemini's score if provided
            # - Merge skill lists (union of both)
            # - Use Gemini's name if it found a better one
            final_matched = list(set(ai_result.get("matched_skills", []) + match_data["matched_skills"]))
            final_missing = ai_result.get("missing_skills", match_data["missing_skills"])
            
            return {
                "match_score": ai_result.get("match_score", score),
                "matched_skills": sorted(final_matched),
                "missing_skills": sorted(final_missing),
                "suggestions": ai_result.get("suggestions", suggestions),
                "name": ai_result.get("name", candidate_name),
                "is_llm_enhanced": True
            }
    except Exception as e:
        print(f"DEBUG: AI Wait timed out or failed: {e}. Returning baseline.")
        pass

    return base_result


async def generate_resume_async(prompt: str) -> dict:
    """
    Generates a full resume JSON from a natural language prompt using Gemini.
    """
    try:
        if not GEMINI_API_KEY or "PASTE_YOUR_GEMINI_API_KEY" in GEMINI_API_KEY:
            raise Exception("Gemini API Key missing.")

        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        
        model = genai.GenerativeModel('gemini-pro')
        
        full_prompt = f"""
        Act as an expert Resume Writer and Career Coach.
        The user wants to generate a resume with the following details:
        "{prompt}"
        
        Generate a complete, highly professional, ATS-friendly resume based on this prompt. 
        Make up realistic companies, dates, and metrics if they are not provided, but keep them aligned with the user's prompt.
        
        Provide a JSON response with these EXACT keys:
        1. "name": (string, candidate's name)
        2. "contact": (string, like "New York, NY | phone | email | linkedin")
        3. "summary": (string, a strong professional summary paragraph)
        4. "experience": (list of objects: {{"title": "", "company": "", "location": "", "dates": "", "bullets": ["", ""] }})
        5. "education": (list of objects: {{"degree": "", "school": "", "location": "", "dates": "" }})
        6. "skills": (list of strings)
        7. "projects": (list of objects: {{"name": "", "technologies": "", "bullets": ["", ""] }})
        8. "achievements": (list of strings)
        9. "interests": (list of strings)
        
        Return ONLY valid JSON. Start with {{ and end with }}.
        """
        
        print(f"DEBUG: Calling Gemini for resume generation with prompt length {len(prompt)}")
        response = await asyncio.wait_for(
            asyncio.to_thread(model.generate_content, full_prompt),
            timeout=45.0
        )
        
        import re
        text = response.text
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
            
        return json.loads(text)
    except Exception as e:
        print(f"DEBUG: Gemini AI Generation Failed (using dynamic fallback): {e}")
        
        # Super simple prompt parser for dynamic fallback
        lower_prompt = prompt.lower()
        
        # Detect basic role
        role = "Software Engineer"
        if "java" in lower_prompt: role = "Java Developer"
        elif "frontend" in lower_prompt or "react" in lower_prompt: role = "Frontend Developer"
        elif "backend" in lower_prompt or "python" in lower_prompt: role = "Backend Engineer"
        elif "data" in lower_prompt: role = "Data Scientist"
        elif "manager" in lower_prompt: role = "Product Manager"
        
        # Detect basic skills based on prompt
        skills = ["Agile Methodologies", "Software Architecture", "Team Leadership"]
        if "java" in lower_prompt: skills.extend(["Java", "Spring Boot", "Hibernate", "Microservices", "REST APIs"])
        elif "react" in lower_prompt: skills.extend(["React.js", "JavaScript", "TypeScript", "Redux", "TailwindCSS"])
        else: skills.extend(["Python", "SQL", "Docker", "AWS"])

        return {
            "name": "Alex Candidate (AI Auto-generated)",
            "contact": "San Francisco, CA | (555) 123-4567 | alex.candidate@example.com",
            "summary": f"Results-driven {role} with a proven track record of designing and scaling robust systems. Highly adaptable, with a strong foundation in modern engineering principles and a passion for building high-quality solutions.",
            "experience": [
                {
                    "title": f"Senior {role}",
                    "company": "TechFusion Inc.",
                    "location": "San Francisco, CA",
                    "dates": "Mar 2021 - Present",
                    "bullets": [
                        f"Architected a distributed platform reducing system latency by 40% using {skills[3] if len(skills)>3 else 'modern technologies'}.",
                        "Mentored a team of 4 junior developers and established CI/CD pipelines increasing deployment frequency by 150%.",
                        "Led cross-functional initiatives to rewrite legacy monolithic applications into scalable microservices."
                    ]
                },
                {
                    "title": role,
                    "company": "Innovate Software",
                    "location": "Remote",
                    "dates": "Jun 2018 - Feb 2021",
                    "bullets": [
                        "Developed dynamic components increasing user engagement metrics by over 25%.",
                        "Collaborated with project managers and UX designers to deliver features ahead of project deadlines.",
                        "Optimized database queries resulting in a 30% performance boost for critical application endpoints."
                    ]
                }
            ],
            "education": [
                {
                    "degree": "Bachelor of Science in Computer Science",
                    "school": "State University",
                    "location": "City, ST",
                    "dates": "2014 - 2018"
                }
            ],
            "skills": skills,
            "projects": [
                {
                    "name": "Enterprise Optimization Engine",
                    "technologies": skills[4] if len(skills)>4 else "Cloud Services, Databases",
                    "bullets": [
                        "Designed a high-throughput transaction engine capable of handling 5000 requests per second.",
                        "Implemented caching strategies that reduced database load significantly."
                    ]
                }
            ],
            "achievements": [
                "Awarded 'Engineer of the Year' at TechFusion Inc. (2022)",
                "Published a widely-cited open source library with over 10k stars on GitHub",
                "Winner of the 2019 Global Hackathon for innovative AI solutions"
            ],
            "interests": [
                "Open Source Contribution",
                "Algorithmic Trading",
                "Mountain Biking",
                "AI Ethics"
            ]
        }


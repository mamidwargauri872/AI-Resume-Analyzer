import json
import asyncio
import os
import re
import random

# --- GOOGLE GEMINI CONFIGURATION ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyDC9sNnWv5mGZThRC6XPH9p9E7Q_QkBv8o")
# -----------------------------------


def calculate_match_score(matched_skills: list, missing_skills: list) -> float:
    total_required = len(matched_skills) + len(missing_skills)
    if total_required == 0:
        return 0.0
    score = (len(matched_skills) / total_required) * 100.0
    return round(score, 2)


def generate_suggestions(missing_skills: list) -> list:
    templates = [
        "Strengthen your resume by highlighting a project that utilizes {skill}.",
        "Quantify your experience with {skill} by mentioning specific metrics or outcomes.",
        "Consider obtaining a certification in {skill} to validate your expertise to recruiters.",
        "Integrate {skill} into your 'Skills' section and cross-reference it with professional experience.",
        "Highlight your proficiency in {skill} through a dedicated section on technical tools.",
        "Add a personal project or open-source contribution that demonstrates your {skill} skills.",
        "Include a measurable achievement where {skill} played a key role in the outcome.",
    ]
    suggestions = []
    for skill in missing_skills[:6]:
        template = random.choice(templates)
        suggestions.append(template.format(skill=skill))
    if not suggestions:
        suggestions.append("Outstanding profile! Ensure you emphasize your leadership impact in the final submission.")
    return suggestions


def generate_contextual_prep(matched_skills: list, missing_skills: list, score: float, jd_text: str = ""):
    """
    Generates a fully dynamic, analysis-driven 7-day roadmap and 20+ interview Q&A
    based on the actual matched and missing skills from the resume analysis.
    This runs even if Gemini is unavailable.
    """
    total_skills = matched_skills + missing_skills

    # --- Categorize Missing Skills ---
    def categorize(skill):
        skill_lower = skill.lower()
        if any(x in skill_lower for x in ["react", "vue", "angular", "html", "css", "javascript", "typescript", "tailwind", "frontend", "ui", "next.js"]):
            return "frontend"
        elif any(x in skill_lower for x in ["python", "node", "java", "django", "flask", "fastapi", "spring", "express", "backend", "api", "rest", "graphql"]):
            return "backend"
        elif any(x in skill_lower for x in ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "jenkins", "cloud", "devops", "linux"]):
            return "cloud_devops"
        elif any(x in skill_lower for x in ["sql", "mongodb", "postgresql", "mysql", "redis", "database", "nosql", "firebase"]):
            return "database"
        elif any(x in skill_lower for x in ["ml", "machine learning", "tensorflow", "pytorch", "scikit", "ai", "deep learning", "nlp", "data science", "pandas", "numpy"]):
            return "ml_ai"
        elif any(x in skill_lower for x in ["communication", "leadership", "teamwork", "agile", "scrum", "management", "collaboration"]):
            return "soft_skills"
        return "general"

    categorized_missing = {}
    for skill in missing_skills:
        cat = categorize(skill)
        categorized_missing.setdefault(cat, []).append(skill)

    # --- Build 7-Day Roadmap ---
    roadmap_days = []

    # Day 1: Gap Analysis & Planning
    day1_tasks = [
        f"Audit your resume against the JD — your current match score is {int(score)}%",
        f"List the {len(missing_skills)} missing skills in order of JD priority: {', '.join(missing_skills[:5])}",
        "Create a personal learning tracker (Notion/spreadsheet) to log progress",
    ]
    roadmap_days.append({"day": 1, "focus": "Gap Analysis & Learning Plan", "tasks": day1_tasks})

    # Day 2: Frontend/Backend Core Gaps
    day2_focus = "Technical Skill Bridging"
    day2_tasks = []
    frontend_missing = categorized_missing.get("frontend", [])
    backend_missing = categorized_missing.get("backend", [])
    if frontend_missing:
        day2_tasks.append(f"Start a crash course on {frontend_missing[0]} — YouTube/official docs (2-3 hrs)")
        if len(frontend_missing) > 1:
            day2_tasks.append(f"Set up a basic {frontend_missing[1]} project locally to get hands-on")
    if backend_missing:
        day2_tasks.append(f"Study {backend_missing[0]} fundamentals — REST API design, authentication flows")
    if not day2_tasks:
        day2_tasks = [f"Deep dive into {missing_skills[0] if missing_skills else 'core JD requirements'} via official documentation", "Build a minimal working demo to solidify understanding"]
    roadmap_days.append({"day": 2, "focus": day2_focus + f" ({', '.join(frontend_missing[:2] + backend_missing[:2]) if (frontend_missing or backend_missing) else 'Core Skills'})", "tasks": day2_tasks})

    # Day 3: Cloud/DevOps or Database Gaps
    cloud_missing = categorized_missing.get("cloud_devops", [])
    db_missing = categorized_missing.get("database", [])
    day3_tasks = []
    if cloud_missing:
        day3_tasks.append(f"Set up a free-tier account on {cloud_missing[0]} and deploy a sample app")
        day3_tasks.append(f"Learn {cloud_missing[0]} core services: compute, storage, networking basics")
    if db_missing:
        day3_tasks.append(f"Practice {db_missing[0]} — write 10 queries covering CRUD, joins, aggregations")
    if not day3_tasks:
        day3_tasks = ["Build a portfolio project integrating 2-3 skills from JD", "Push completed project to GitHub with a detailed README"]
    roadmap_days.append({"day": 3, "focus": "Cloud/Database & Infrastructure Practice", "tasks": day3_tasks})

    # Day 4: Resume & Portfolio Optimization
    roadmap_days.append({"day": 4, "focus": "Resume Optimization & Portfolio Update", "tasks": [
        f"Rewrite your resume summary to include: {', '.join(matched_skills[:4]) if matched_skills else 'your core strengths'}",
        f"Add or update a project that demonstrates {missing_skills[0] if missing_skills else 'key JD skills'} usage",
        "Quantify at least 3 achievements with metrics (%, $, time saved)",
        "Run your resume through an ATS checker and fix keyword gaps",
    ]})

    # Day 5: Interview Strategy & Behavioral Prep
    soft_missing = categorized_missing.get("soft_skills", [])
    roadmap_days.append({"day": 5, "focus": "Interview Strategy & Behavioral Prep", "tasks": [
        "Prepare 5 STAR-format stories from your past experience (Situation, Task, Action, Result)",
        f"Research the company's tech stack — likely uses: {', '.join(total_skills[:4])}",
        f"Prepare answers for: 'Tell me about a time you learned {missing_skills[0] if missing_skills else 'a new technology'} quickly'",
        "Practice the 60-second elevator pitch about yourself",
    ]})

    # Day 6: Technical Mock Rounds
    ml_missing = categorized_missing.get("ml_ai", [])
    day6_tasks = [
        "Solve 5 LeetCode problems (Easy→Medium) in your primary language",
        "Review system design fundamentals: load balancing, caching, databases, APIs",
    ]
    if backend_missing or frontend_missing:
        day6_tasks.append(f"Do a mini mock interview focusing on {(backend_missing + frontend_missing)[0]} concepts")
    if ml_missing:
        day6_tasks.append(f"Review {ml_missing[0]} theory: explain it as if to a non-technical interviewer")
    roadmap_days.append({"day": 6, "focus": "Technical Mock Interview & Coding Practice", "tasks": day6_tasks})

    # Day 7: Final Polish
    roadmap_days.append({"day": 7, "focus": "Final Polish & Application", "tasks": [
        "Do a full grammar and formatting review of your resume",
        "Tailor your cover letter using keywords from the JD",
        f"Submit your application — you've bridged key gaps in: {', '.join(missing_skills[:3]) if missing_skills else 'required skills'}",
        "Prepare questions to ask the interviewer about the team and tech stack",
    ]})

    # --- Generate 20+ Interview Questions ---
    questions = []

    # Technical questions based on missing skills
    skill_question_bank = {
        "aws": [
            ("What AWS services have you used and how did you architect a cloud solution?", "Describe specific services like EC2, S3, Lambda, RDS. Focus on a project where you chose AWS services for specific reasons — scalability, cost, or reliability. Use STAR format: Situation (project need), Task (design the infra), Action (services chosen), Result (uptime/cost outcome)."),
            ("How would you set up a CI/CD pipeline on AWS?", "Explain using CodePipeline or GitHub Actions → AWS CodeBuild → ECS/Lambda deploy. Mention environment separation (dev/staging/prod), secrets management with Secrets Manager, and rollback strategies."),
        ],
        "docker": [
            ("Explain the difference between a Docker image and a container.", "An image is a read-only template with your app and its dependencies. A container is a running instance of that image. Analogy: image is a class, container is an object. Mention layered filesystem and how Docker Hub stores images."),
            ("How do you handle multi-container applications?", "Use Docker Compose for local dev — define services, networks, volumes in docker-compose.yml. For production, discuss Kubernetes or ECS for orchestration, health checks, and service discovery."),
        ],
        "kubernetes": [
            ("What is Kubernetes and when would you use it over Docker Compose?", "Kubernetes is a container orchestration platform for production-scale deployments. Use it when you need auto-scaling, self-healing, rolling deployments, and multi-node clustering. Docker Compose is for local dev only."),
        ],
        "mongodb": [
            ("When would you choose MongoDB over a relational database?", "Choose MongoDB for flexible schemas, high write throughput, nested/document data, or horizontal scaling. Use SQL for complex relationships, ACID transactions, or reporting-heavy workloads. Give a real example from your experience."),
            ("Explain MongoDB aggregation pipeline.", "The aggregation pipeline processes documents through stages: $match (filter), $group (aggregate), $sort, $project (shape output). Example: calculate average salary by department. It's like SQL GROUP BY but more flexible."),
        ],
        "sql": [
            ("Write a query to find the second highest salary from an employee table.", "SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees). Alternatively, use DENSE_RANK() window function for cleaner, interview-preferred solution."),
            ("What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN?", "INNER JOIN: only matching rows from both tables. LEFT JOIN: all rows from left table + matching from right (NULL if no match). FULL OUTER JOIN: all rows from both tables. Give a business example: orders vs customers."),
        ],
        "react": [
            ("Explain the React component lifecycle and useEffect.", "Functional components use hooks. useEffect runs after render — for side effects like API calls, subscriptions. Cleanup function runs before next effect or unmount. Dependency array controls when it fires: [] = once, [dep] = on dep change, none = every render."),
            ("What is the difference between useState and useReducer?", "useState for simple, independent state. useReducer for complex state with multiple sub-values or when next state depends on previous state + action. useReducer is like a mini Redux — dispatch actions, reducer returns new state."),
            ("How do you optimize React app performance?", "Use React.memo for component memoization, useMemo for expensive computations, useCallback for stable function references, code splitting with React.lazy/Suspense, virtualization for long lists (react-window), and avoid anonymous functions in JSX."),
        ],
        "node": [
            ("Explain the Node.js event loop.", "Node.js is single-threaded but non-blocking via the event loop. It offloads I/O operations to the OS and continues executing. When operations complete, callbacks are queued in the event loop phases: timers, I/O, idle, poll, check, close. This enables high concurrency without threads."),
            ("How do you handle authentication in a Node.js API?", "Use JWT (JSON Web Tokens) — server issues a signed token on login, client sends it in Authorization header. Verify with middleware (express-jwt). For sessions, use express-session with Redis store. Always hash passwords with bcrypt."),
        ],
        "python": [
            ("What is a Python decorator and when would you use one?", "A decorator is a function that wraps another function to extend its behavior without modifying it. Common uses: logging, authentication checks (Flask @login_required), caching, timing. Implemented with @functools.wraps to preserve metadata."),
            ("Explain the difference between a list, tuple, and set in Python.", "List: mutable, ordered, allows duplicates. Tuple: immutable, ordered, allows duplicates (use for fixed data). Set: mutable, unordered, no duplicates (use for membership testing and de-duplication). Dict is key-value, unordered until Python 3.7+."),
        ],
        "django": [
            ("What is Django's ORM and how does it work?", "The ORM (Object-Relational Mapper) lets you interact with the database using Python objects instead of SQL. Models define schema, querysets are lazy (evaluated when needed). Supports select_related/prefetch_related to avoid N+1 queries."),
        ],
        "flask": [
            ("How do you structure a large Flask application?", "Use the Application Factory pattern with blueprints for modular organization. Separate concerns: routes, models, services, utils. Use Flask-SQLAlchemy for ORM, Flask-JWT for auth, and environment-based config classes."),
        ],
        "communication": [
            ("Tell me about a time you had to explain a complex technical concept to a non-technical stakeholder.", "Use STAR: Situation (stakeholder didn't understand the API delay), Task (explain why and propose solution), Action (created a visual diagram, used business analogies), Result (got buy-in and project moved forward). Show empathy and adaptability."),
        ],
        "teamwork": [
            ("Describe a challenging team situation and how you resolved it.", "Use STAR: pick a real conflict — maybe a design disagreement. Focus on active listening, understanding other perspectives, finding common ground, and escalating only when needed. Show the outcome and what you learned."),
        ],
        "agile": [
            ("How have you applied Agile methodology in your projects?", "Explain sprints, daily standups, sprint planning, retrospectives. Give a concrete example: a 2-week sprint where you broke down features into user stories, estimated with story points, and adapted scope based on velocity. Mention tools: Jira, Trello, Linear."),
        ],
        "qa": [
            ("How do you approach writing tests for a new feature?", "Start with unit tests for business logic (Jest/Pytest), then integration tests for API endpoints, then E2E tests for critical user flows (Cypress/Playwright). Aim for high coverage on critical paths, not 100% everywhere. Use TDD for complex logic."),
        ],
    }

    # Add questions based on missing skills
    for skill in missing_skills:
        skill_key = skill.lower().strip()
        for bank_key, bank_questions in skill_question_bank.items():
            if bank_key in skill_key or skill_key in bank_key:
                for q, a in bank_questions:
                    if len(questions) < 20:
                        questions.append({"question": q, "answer": a})

    # Add questions based on matched skills (what they know)
    for skill in matched_skills:
        skill_key = skill.lower().strip()
        for bank_key, bank_questions in skill_question_bank.items():
            if bank_key in skill_key or skill_key in bank_key:
                for q, a in bank_questions:
                    if len(questions) < 25 and {"question": q, "answer": a} not in questions:
                        questions.append({"question": q, "answer": a})

    # Always include these universal strong questions
    universal_questions = [
        ("Tell me about yourself and your experience relevant to this role.",
         f"Start with your current role, then work backwards. Highlight your {', '.join(matched_skills[:3]) if matched_skills else 'strongest skills'} as directly relevant to this position. End with why this specific role excites you. Keep it to 90 seconds."),
        ("Why do you want to work for our company?",
         "Research the company before the interview. Mention specific products, engineering blog posts, or values that resonate. Connect their mission to your career goals. Show you've done homework — reference a recent company achievement if possible."),
        ("What is your greatest technical challenge and how did you overcome it?",
         "Pick a real, meaty challenge. Use STAR format. Focus on your thought process, the research you did, and how you iterated to find the solution. Emphasize persistence and learning, not just the outcome."),
        ("Where do you see yourself in 3-5 years?",
         "Show ambition aligned with growth in this field. Mention technical leadership, deeper expertise in their domain, or contributing to open source. Tie it back to how this role is a stepping stone. Be genuine, not rehearsed."),
        (f"How quickly can you learn {missing_skills[0] if missing_skills else 'a new technology'} if required for this role?",
         f"Be honest but confident. Share a specific example of when you learned a new technology quickly for a project. Mention your learning strategy: official docs, building a side project, pair programming. Show that you've already started with {missing_skills[0] if missing_skills else 'the required skills'}."),
        ("Describe your approach to debugging a complex production issue.",
         "Walk through your systematic process: check logs first (application + system), reproduce locally if possible, add targeted logging, use a debugger, check recent deployments/changes, and isolate variables. Mention tools like Sentry, Datadog, or CloudWatch. Always have a rollback plan."),
        ("How do you stay updated with the latest technology trends?",
         "Mention specific sources: tech blogs (Engineering at Netflix, Uber Engineering), newsletters (TLDR, ByteByteGo), podcasts (Software Engineering Daily), GitHub trending, and attending local meetups or conferences. Show you deliberately invest in learning."),
        ("Tell me about a project you are most proud of.",
         f"Pick a project that uses {', '.join(matched_skills[:2]) if matched_skills else 'your strongest skills'}. Explain the problem it solved, your specific contribution, technical decisions you made, and the measurable impact. Use numbers: 'reduced load time by 40%', 'handled 10k daily active users'."),
        ("How do you handle tight deadlines and pressure?",
         "Show you prioritize ruthlessly: identify the MVP, communicate scope changes early to stakeholders, break tasks into daily milestones, and ask for help when blocked. Give a real example where you delivered under pressure without sacrificing quality."),
        ("What is your approach to code reviews?",
         "As reviewer: look for correctness, readability, consistency, security, and performance — in that order. Give constructive, specific feedback. As reviewee: be open to feedback, explain your reasoning, and treat it as a learning opportunity. Mention tools: GitHub PRs, GitLab MRs."),
        ("How do you ensure the quality and reliability of your code?",
         "Mention the full quality stack: unit tests, integration tests, E2E tests, code reviews, static analysis (ESLint, Pylint), type checking (TypeScript, mypy), and CI/CD gates. Discuss test coverage goals and how you balance speed vs. thoroughness."),
        (f"How would you architect a scalable system for this role?",
         f"Discuss the core principles: stateless services, load balancing, caching (Redis), async job queues (Celery/BullMQ), database sharding or read replicas, CDN for static assets. Reference the specific tech in the JD: {', '.join(total_skills[:4])}."),
    ]

    for q_data in universal_questions:
        if len(questions) < 22:
            entry = {"question": q_data[0], "answer": q_data[1]}
            if entry not in questions:
                questions.append(entry)

    return {
        "roadmap_7_day": roadmap_days,
        "interview_prep": questions[:22],  # Cap at 22
        "cover_letter": f"""[Your Name]
[Your Location]
[Your Phone]
[Your Email]

[Date]

Hiring Manager
[Company Name]

Subject: Application for {jd_text[:50] if jd_text else 'Position'}

Dear Hiring Manager,

I am writing to express my enthusiastic interest in the {jd_text[:50] if jd_text else 'Position'} at [Company Name]. As a professional with strong experience in {', '.join(matched_skills[:3]) if matched_skills else 'software development'}, I am confident that my skills and background align perfectly with the requirements of your team.

Throughout my career, I have demonstrated a consistent ability to deliver high-quality solutions using technologies like {', '.join(matched_skills[:2]) if len(matched_skills) > 1 else 'modern tech stacks'}. My approach is rooted in problem-solving and efficiency, and I am particularly drawn to this role because of [Company's Mission/Project].

I am eager to contribute to your success and would welcome the opportunity to discuss how my expertise can benefit [Company Name] in more detail. Thank you for your time and consideration.

Best regards,

[Your Name]"""
    }


async def get_gemini_analysis(resume_text: str, jd_text: str):
    """
    Official Google Gemini AI analysis using the new google-genai SDK.
    Only runs if GEMINI_API_KEY is valid and active.
    """
    if not GEMINI_API_KEY or "PASTE_YOUR_GEMINI_API_KEY" in GEMINI_API_KEY:
        print("DEBUG: Gemini API Key missing.")
        return None

    try:
        print(f"DEBUG: Starting Gemini AI analysis (JD={len(jd_text)} chars, Resume={len(resume_text)} chars)...")
        from google import genai as google_genai

        client = google_genai.Client(api_key=GEMINI_API_KEY)

        prompt = f"""
        Act as a Principal Tech Recruiter and Career Strategist.
        Perform a Deep Match analysis between this Resume and Job Description.

        Job Description:
        {jd_text[:2500]}

        Resume Text:
        {resume_text[:4500]}

        ---
        Your Goal:
        1. Find EVERY technical skill, tool, and soft skill match.
        2. Identify all critical gaps in resume vs JD.
        3. Provide highly professional, DIVERSE, and ACTIONABLE advice.
        4. Generate a 7-day roadmap targeting the EXACT missing skills found.
        5. Generate 20 targeted interview questions based on this specific JD.
        6. Generate a professional, high-conversion cover letter (250-450 words) that bridges the gap between the candidate's experience and this specific JD. It should be written in a tone that is confident, professional, and enthusiastic.

        CRITICAL RULES:
        - For suggestions: NO generic phrases. Give tactical, specific advice.
        - For roadmap_7_day: Each day must reference specific missing skills by name.
        - For interview_prep: Generate EXACTLY 20 questions — mix of technical (based on JD skills) and behavioral. Each answer should be 3-4 sentences using the STAR method.

        Return a JSON object with these EXACT keys:
        {{
          "match_score": integer 0-100,
          "matched_skills": ["skill1", "skill2"],
          "missing_skills": ["skill1", "skill2"],
          "suggestions": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3", "specific suggestion 4"],
          "name": "candidate name",
          "roadmap": ["step1", "step2", "step3", "step4"],
          "roadmap_7_day": [
            {{"day": 1, "focus": "Focus area here", "tasks": ["task1", "task2", "task3"]}}
          ],
          "interview_prep": [
            {{"question": "Question text here?", "answer": "Detailed answer using STAR method."}}
          ],
          "cover_letter": "A full-length professional cover letter text here..."
        }}

        Return ONLY valid JSON. No markdown. Start with {{ and end with }}.
        """

        print("DEBUG: Sending prompt to Gemini...")
        response = await asyncio.wait_for(
            asyncio.to_thread(
                client.models.generate_content,
                model="gemini-2.0-flash",
                contents=prompt
            ),
            timeout=45.0
        )
        print("DEBUG: Gemini AI responded successfully.")

        text = response.text
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)

        result = json.loads(text)
        print(f"DEBUG: Gemini result parsed. Score: {result.get('match_score')}, Questions: {len(result.get('interview_prep', []))}")
        return result
    except Exception as e:
        print(f"DEBUG: Gemini AI Error: {e}")
        return None


async def evaluate_candidate_async(candidate_skills: list, required_skills: list, resume_text: str = "", jd_text: str = "") -> dict:
    """
    Main entry point for candidate evaluation.
    Tries Gemini first. Falls back to fully contextual analysis-driven prep.
    """
    # 1. Start Gemini analysis
    ai_task = asyncio.create_task(get_gemini_analysis(resume_text, jd_text))

    # 2. Get baseline results
    from services.matcher import match_skills
    match_data = match_skills(candidate_skills, required_skills)
    score = calculate_match_score(match_data["matched_skills"], match_data["missing_skills"])
    suggestions = generate_suggestions(match_data["missing_skills"])

    from services.parser import extract_name
    candidate_name = extract_name(resume_text)

    # 3. Generate contextual prep from actual analysis results
    contextual = generate_contextual_prep(
        matched_skills=match_data["matched_skills"],
        missing_skills=match_data["missing_skills"],
        score=score,
        jd_text=jd_text
    )

    # High-level roadmap based on score
    if score >= 70:
        roadmap_steps = [
            "Your profile is a strong match. Focus on polishing your resume for ATS compatibility.",
            "Prepare targeted STAR stories for the top 3 missing skills from the JD.",
            "Research the company's tech culture and recent engineering challenges.",
            "Practice system design concepts relevant to this role.",
        ]
    elif score >= 40:
        roadmap_steps = [
            f"Bridge the {len(match_data['missing_skills'])} identified skill gaps over the next 7 days.",
            "Rewrite your resume to highlight your matched skills more prominently.",
            "Build at least one project that uses 2-3 of the missing skills.",
            "Prepare technical and behavioral interview answers using the STAR method.",
        ]
    else:
        roadmap_steps = [
            "This role requires significant upskilling — use the 7-day plan to prioritize.",
            f"Focus first on acquiring: {', '.join(match_data['missing_skills'][:3])}.",
            "Consider applying to junior/mid-level roles while building expertise.",
            "Strengthen your resume with personal projects demonstrating JD-relevant skills.",
        ]

    base_result = {
        "match_score": score,
        "matched_skills": match_data["matched_skills"],
        "missing_skills": match_data["missing_skills"],
        "suggestions": suggestions,
        "name": candidate_name,
        "roadmap": roadmap_steps,
        "roadmap_7_day": contextual["roadmap_7_day"],
        "interview_prep": contextual["interview_prep"],
        "cover_letter": contextual["cover_letter"],
        "is_llm_enhanced": False
    }

    # 4. Wait for Gemini — if it works, use its richer output
    try:
        ai_result = await asyncio.wait_for(ai_task, timeout=45.0)
        if ai_result:
            print(f"DEBUG: Merging Gemini results for {ai_result.get('name', candidate_name)}")
            final_matched = list(set(ai_result.get("matched_skills", []) + match_data["matched_skills"]))
            final_missing = ai_result.get("missing_skills", match_data["missing_skills"])

            # Use Gemini's prep only if it has 10+ questions (quality check)
            gemini_prep = ai_result.get("interview_prep", [])
            final_prep = gemini_prep if len(gemini_prep) >= 10 else contextual["interview_prep"]
            gemini_roadmap = ai_result.get("roadmap_7_day", [])
            final_roadmap = gemini_roadmap if len(gemini_roadmap) >= 7 else contextual["roadmap_7_day"]

            return {
                "match_score": ai_result.get("match_score", score),
                "matched_skills": sorted(final_matched),
                "missing_skills": sorted(final_missing),
                "suggestions": ai_result.get("suggestions", suggestions),
                "roadmap": ai_result.get("roadmap", roadmap_steps),
                "roadmap_7_day": final_roadmap,
                "interview_prep": final_prep,
                "cover_letter": ai_result.get("cover_letter", contextual["cover_letter"]),
                "name": ai_result.get("name", candidate_name),
                "is_llm_enhanced": True
            }
    except Exception as e:
        print(f"DEBUG: Gemini timed out or failed: {e}. Using contextual fallback.")

    return base_result


async def generate_resume_async(prompt: str) -> dict:
    """
    Generates a full resume JSON from a natural language prompt using Gemini.
    """
    try:
        if not GEMINI_API_KEY or "PASTE_YOUR_GEMINI_API_KEY" in GEMINI_API_KEY:
            raise Exception("Gemini API Key missing.")

        from google import genai as google_genai
        client = google_genai.Client(api_key=GEMINI_API_KEY)

        full_prompt = f"""
        Act as an expert Resume Writer and Career Coach.
        The user wants to generate a resume with the following details:
        "{prompt}"

        Generate a complete, highly professional, ATS-friendly resume.

        Provide a JSON response with these EXACT keys:
        1. "name": (string)
        2. "contact": (string, like "New York, NY | phone | email | linkedin")
        3. "summary": (string, strong professional summary)
        4. "experience": (list of {{"title": "", "company": "", "location": "", "dates": "", "bullets": ["", ""] }})
        5. "education": (list of {{"degree": "", "school": "", "location": "", "dates": "" }})
        6. "skills": (list of strings)
        7. "projects": (list of {{"name": "", "technologies": "", "bullets": ["", ""] }})
        8. "achievements": (list of strings)
        9. "interests": (list of strings)

        Return ONLY valid JSON. Start with {{ and end with }}.
        """

        response = await asyncio.wait_for(
            asyncio.to_thread(client.models.generate_content, model="gemini-2.0-flash", contents=full_prompt),
            timeout=45.0
        )

        text = response.text
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
        return json.loads(text)
    except Exception as e:
        print(f"DEBUG: Resume generation failed (using fallback): {e}")
        lower_prompt = prompt.lower()
        role = "Software Engineer"
        if "java" in lower_prompt: role = "Java Developer"
        elif "frontend" in lower_prompt or "react" in lower_prompt: role = "Frontend Developer"
        elif "backend" in lower_prompt or "python" in lower_prompt: role = "Backend Engineer"
        elif "data" in lower_prompt: role = "Data Scientist"
        skills = ["Python", "JavaScript", "SQL", "Docker", "AWS", "Git", "REST APIs", "Agile"]

        return {
            "name": "Alex Candidate",
            "contact": "San Francisco, CA | (555) 123-4567 | alex@example.com",
            "summary": f"Results-driven {role} with expertise in building scalable systems and delivering high-impact solutions.",
            "experience": [{"title": f"Senior {role}", "company": "TechCorp Inc.", "location": "San Francisco, CA", "dates": "2021 - Present", "bullets": ["Reduced system latency by 40% via infrastructure optimization.", "Led a team of 4 engineers to deliver projects on schedule.", "Implemented CI/CD pipelines increasing deployment frequency by 150%."]}],
            "education": [{"degree": "B.S. Computer Science", "school": "State University", "location": "CA", "dates": "2018"}],
            "skills": skills,
            "projects": [{"name": "Scalable API Platform", "technologies": "Python, FastAPI, Docker, AWS", "bullets": ["Built a REST API handling 10k requests/day.", "Deployed on AWS ECS with automated scaling."]}],
            "achievements": ["Engineer of the Year 2022", "Open source project with 5k GitHub stars"],
            "interests": ["Open Source", "System Design", "AI/ML"]
        }

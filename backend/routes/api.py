from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
import json
from typing import List, Optional
import datetime
from services.parser import parse_resume, parse_job_description
from services.scorer import evaluate_candidate_async
from services.database import get_db

router = APIRouter()

@router.post("/analyze")
async def evaluate_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    user_email: str = Form(None)
):
    if not resume.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    if len(job_description.strip()) < 2:
        raise HTTPException(status_code=400, detail="Job description is too short. Please provide at least 2 characters.")

        
    try:
        print(f"DEBUG: Starting analysis for {resume.filename} (User: {user_email})")
        file_bytes = await resume.read()
        
        # 1. Parse Resume
        resume_data = parse_resume(file_bytes)
        print(f"DEBUG: Text Extracted ({len(resume_data['raw_text'])} chars). Name: {resume_data['name']}")
        
        # 2. Parse JD Skills for baseline
        jd_data = parse_job_description(job_description)
        print(f"DEBUG: JD Skills extracted: {jd_data['skills']}")

        # 3. Comprehensive AI analysis
        results = await evaluate_candidate_async(
            resume_data["skills"], 
            jd_data["skills"],
            resume_data["raw_text"],
            job_description
        )
        print(f"DEBUG: Analysis results ready. Match Score: {results.get('match_score')}%")

        # 4. Save to MongoDB if available
        mongodb = get_db()
        if mongodb is not None:
            try:
                history_record = {
                    "user_email": user_email or "anonymous",
                    "filename": resume.filename,
                    "results": results,
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }
                await mongodb.results.insert_one(history_record)
                print(f"DEBUG: Saved analysis history for {user_email or 'anonymous'}")
            except Exception as db_err:
                print(f"DEBUG: MongoDB save error: {db_err}")

        # Add debug info for the frontend UI to display if needed
        results["_id"] = str(history_record.get("_id")) if mongodb is not None else None
        results["_debug"] = {
            "resume_text_len": len(resume_data['raw_text']),
            "jd_text_len": len(job_description),
            "parser_skills": resume_data["skills"],
            "jd_skills": jd_data["skills"]
        }

        return results
        
    except Exception as e:
        print(f"DEBUG: CRITICAL Analysis error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{email}")
async def get_history(email: str):
    mongodb = get_db()
    if mongodb is None:
        return []
        
    try:
        cursor = mongodb.results.find({"user_email": email}).sort("timestamp", -1)
        history = await cursor.to_list(length=100)
        for item in history:
            item["_id"] = str(item["_id"])
        return history
    except Exception as e:
        print(f"DEBUG: Error fetching history: {e}")
        return []


@router.get("/result/{result_id}")
async def get_result_by_id(result_id: str):
    from bson import ObjectId
    mongodb = get_db()
    if mongodb is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        result = await mongodb.results.find_one({"_id": ObjectId(result_id)})
        if not result:
            raise HTTPException(status_code=404, detail="Analysis result not found")
        
        result["_id"] = str(result["_id"])
        return result
    except Exception as e:
        print(f"DEBUG: Error fetching result {result_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")



@router.get("/dashboard-stats/{email}")
async def get_dashboard_stats(email: str):
    """
    Returns fully dynamic aggregated statistics for the user dashboard.
    All numbers are computed from real MongoDB data.
    """
    mongodb = get_db()
    empty = {
        "total_resumes": 0,
        "avg_score": 0,
        "monthly_growth": "+0%",
        "score_change": "0 pts vs last month",
        "new_candidates_week": 0,
        "pass_rate": 0,
        "pass_rate_label": "No data yet",
        "active_candidates": 0,
        "skills_distribution": [],
        "score_distribution": [],
        "trend_data": [],
        "recent_analyses": []
    }

    if mongodb is None:
        return empty
        
    try:
        cursor = mongodb.results.find({"user_email": email}).sort("timestamp", -1)
        history = await cursor.to_list(length=1000)
        
        if not history:
            return empty

        total_resumes = len(history)
        scores = [item["results"]["match_score"] for item in history]
        avg_score = round(sum(scores) / total_resumes, 1) if total_resumes > 0 else 0

        # ── Monthly growth ──
        now = datetime.datetime.utcnow()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (this_month_start - datetime.timedelta(days=1)).replace(day=1)
        
        this_month_count = 0
        last_month_count = 0
        this_week_count  = 0
        last_month_scores = []
        week_ago = now - datetime.timedelta(days=7)

        for item in history:
            try:
                ts = datetime.datetime.fromisoformat(item["timestamp"])
            except Exception:
                continue
            if ts >= this_month_start:
                this_month_count += 1
            elif ts >= last_month_start:
                last_month_count += 1
                last_month_scores.append(item["results"]["match_score"])
            if ts >= week_ago:
                this_week_count += 1

        if last_month_count > 0:
            growth_pct = round(((this_month_count - last_month_count) / last_month_count) * 100)
            monthly_growth = f"+{growth_pct}%" if growth_pct >= 0 else f"{growth_pct}%"
        elif this_month_count > 0:
            monthly_growth = "+100%"
        else:
            monthly_growth = "+0%"

        # Score change vs last month
        if last_month_scores:
            last_avg = round(sum(last_month_scores) / len(last_month_scores), 1)
            diff = round(avg_score - last_avg, 1)
            score_change = f"+{diff} pts" if diff >= 0 else f"{diff} pts"
        else:
            score_change = "Base"

        # ── Pass Rate ──
        passed = sum(1 for s in scores if s >= 60)
        pass_rate = round((passed / total_resumes) * 100) if total_resumes > 0 else 0
        pass_rate_label = f"{passed} of {total_resumes} passed" if total_resumes > 0 else "No data"

        # ── Active candidates ──
        active_candidates = len(set(item["results"].get("name", "") for item in history))

        # ── Skill distribution ──
        skill_counts = {}
        for item in history:
            for skill in item["results"].get("matched_skills", []):
                skill_counts[skill] = skill_counts.get(skill, 0) + 1
        skills_distribution = sorted(
            [{"name": k, "count": v} for k, v in skill_counts.items()],
            key=lambda x: x["count"], reverse=True
        )[:10]

        # ── Score distribution ──
        ranges = {"0–40": 0, "41–60": 0, "61–80": 0, "81–100": 0}
        for s in scores:
            if s <= 40:   ranges["0–40"] += 1
            elif s <= 60: ranges["41–60"] += 1
            elif s <= 80: ranges["61–80"] += 1
            else:         ranges["81–100"] += 1
        score_distribution = [{"name": k, "value": v} for k, v in ranges.items() if v > 0]

        # ── Trend data ──
        trend_data = []
        for item in list(reversed(history[:10])):
            try:
                ts = datetime.datetime.fromisoformat(item["timestamp"])
                label = ts.strftime("%d %b")
            except Exception: label = "—"
            trend_data.append({"name": label, "score": item["results"]["match_score"]})

        # ── Recent analyses ──
        recent_analyses = []
        for item in history[:5]:
            try:
                ts = datetime.datetime.fromisoformat(item["timestamp"])
                time_label = _time_ago(ts)
            except Exception: time_label = "recently"
            recent_analyses.append({
                "name": item["results"].get("name", "Unknown"),
                "filename": item.get("filename", "resume.pdf"),
                "score": item["results"]["match_score"],
                "matched": len(item["results"].get("matched_skills", [])),
                "time_ago": time_label
            })

        return {
            "total_resumes": total_resumes,
            "avg_score": avg_score,
            "monthly_growth": monthly_growth,
            "score_change": score_change,
            "new_candidates_week": this_week_count,
            "pass_rate": pass_rate,
            "pass_rate_label": pass_rate_label,
            "active_candidates": active_candidates,
            "skills_distribution": skills_distribution,
            "score_distribution": score_distribution,
            "trend_data": trend_data,
            "recent_analyses": recent_analyses
        }
    except Exception as e:
        print(f"DEBUG: Error calculating stats: {e}")
        return empty


def _time_ago(dt: datetime.datetime) -> str:
    now = datetime.datetime.utcnow()
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:     return "just now"
    if seconds < 3600:   return f"{seconds // 60}m ago"
    if seconds < 86400:  return f"{seconds // 3600}h ago"
    if seconds < 604800: return f"{seconds // 86400}d ago"
    return dt.strftime("%d %b")

@router.post("/resume/generate")
async def generate_resume_endpoint(prompt: str = Form(...), user_email: str = Form(None)):
    import google.generativeai as genai
    import re as _re
    import asyncio
    from functools import partial
    from services.scorer import GEMINI_API_KEY
    from services.database import get_db

    if len(prompt.strip()) < 10:
        raise HTTPException(status_code=400, detail="Prompt is too short.")

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")

    ai_prompt = (
        "You are an expert Resume Writer. Convert the user's raw input into a polished JSON resume.\n\n"
        "USER INPUT:\n"
        '"' + prompt + '"\n\n'
        "RULES:\n"
        "1. Extract and USE the actual name, companies, skills, education the user mentions.\n"
        "2. Only fill in missing details with realistic professional content.\n"
        "3. Output ONLY valid JSON, no markdown, no explanation.\n\n"
        "Return a JSON object with these keys: name, contact, summary, "
        "experience (list of objects with title/company/location/dates/bullets), "
        "education (list of objects with degree/school/location/dates), "
        "skills (list of strings), "
        "projects (list of objects with name/technologies/bullets), "
        "achievements (list of strings), "
        "interests (list of strings)."
    )

    try:
        print(f"[AI Builder] Calling Gemini 2.0 Flash. Prompt length: {len(prompt)}")
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, partial(model.generate_content, ai_prompt))
        raw_text = response.text
        print(f"[AI Builder] Got Gemini response. Length: {len(raw_text)}")

        match = _re.search(r'\{.*\}', raw_text, _re.DOTALL)
        if match:
            raw_text = match.group(0)

        resume_data = json.loads(raw_text)
        print(f"[AI Builder] Parsed JSON. Name: {resume_data.get('name', 'unknown')}")

        # Save to MongoDB
        try:
            database = get_db()
            if database is not None:
                doc = {
                    "type": "ai_generated_resume",
                    "prompt": prompt,
                    "user_email": user_email or "anonymous",
                    "resume_data": resume_data,
                    "candidate_name": resume_data.get("name", ""),
                    "created_at": datetime.datetime.utcnow().isoformat()
                }
                await database["ai_resumes"].insert_one(doc)
                print(f"[AI Builder] Saved resume to DB for: {resume_data.get('name', 'unknown')}")
        except Exception as db_err:
            print(f"[AI Builder] DB save failed (non-fatal): {db_err}")

        return {"status": "success", "data": resume_data}

    except json.JSONDecodeError as e:
        print(f"[AI Builder] JSON parse error: {e}")
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {str(e)}")
@router.post("/templates/save")
async def save_template_endpoint(request: Request):
    from services.database import get_db
    try:
        data = await request.json()
        user_email = data.get("user_email", "anonymous")
        template_name = data.get("template_name", "Untitled")
        fields = data.get("fields", {})

        database = get_db()
        if database is not None:
            doc = {
                "type": "edited_template",
                "user_email": user_email,
                "template_name": template_name,
                "fields": fields,
                "created_at": datetime.datetime.utcnow().isoformat()
            }
            await database["user_templates"].insert_one(doc)
            return {"status": "success", "message": "Template saved to database"}
        else:
            return {"status": "error", "message": "Database not connected"}
    except Exception as e:
        print(f"[Templates] Save error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

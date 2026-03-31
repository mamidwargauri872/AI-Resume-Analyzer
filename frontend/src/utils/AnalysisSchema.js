import { z } from "zod";

/**
 * Zod Schema for AI Resume Analysis Results.
 * This ensures that every result—whether from AI or fallback—is 
 * perfectly structured before reaching the React UI.
 */

// Schema for individual 7-day roadmap items
const RoadmapItemSchema = z.object({
  day: z.number(),
  focus: z.string(),
  tasks: z.array(z.string()),
});

// Schema for individual interview preparation items
const InterviewPrepSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

// Main Analysis Results Schema
export const analysisSchema = z.object({
  match_score: z.number().min(0).max(100),
  matched_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  suggestions: z.array(z.string()),
  name: z.string().optional().default("Candidate"),
  roadmap: z.array(z.string()).optional().default([]),
  roadmap_7_day: z.array(RoadmapItemSchema).length(7, "A full 7-day roadmap is required."),
  interview_prep: z.array(InterviewPrepSchema).min(10, "At least 10 interview questions are required for a quality prep."),
  cover_letter: z.string().min(50, "Cover letter must be detailed (at least 50 chars)."),
  is_llm_enhanced: z.boolean().optional().default(false),
});

/**
 * Safe parser that handles validation and returns 
 * a usable object with optional errors.
 */
export const safeParseAnalysis = (data) => {
  try {
    const validated = analysisSchema.parse(data);
    return { data: validated, error: null };
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("Zod Validation Error:", err.format());
      return { data: null, error: err.format() };
    }
    return { data: null, error: "Unknown validation error" };
  }
};

def match_skills(candidate_skills: list, required_skills: list) -> dict:
    """
    Compare candidate skills against job description required skills.
    Returns matched skills and missing skills.
    """
    candidate_set = set(candidate_skills)
    required_set = set(required_skills)
    
    matched = list(candidate_set.intersection(required_set))
    missing = list(required_set.difference(candidate_set))
    
    return {
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing),
        "candidate_only_skills": sorted(list(candidate_set.difference(required_set)))
    }

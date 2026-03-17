#!/usr/bin/env python3
"""Analyze Grade 3 Olympiad packs: duplicates, explanations, answer distribution, etc."""

import json
import os
from pathlib import Path
from collections import defaultdict

BASE = Path(__file__).parent / "public" / "starter-packs"
EXAMS = ["nso", "imo", "ieo", "ics", "igko", "isso"]
PACKS = [f"practice-{i}" for i in range(1, 5)] + [f"mock-{i}" for i in range(1, 3)]

# Patterns for weak explanations
WEAK_PATTERNS = ["correct", "right answer", "yes", "no", "true", "false"]
ADVANCED_PATTERNS = [
    "fraction", "decimal", "percentage", "%", "ratio", "algebra", "equation",
    "subjunctive", "gerund", "participle", "clause", "conjunction",
    "binary", "algorithm", "programming", "variable", "function"
]

def load_all_questions():
    """Load all questions from practice and mock packs."""
    all_questions = []
    for exam in EXAMS:
        for pack in PACKS:
            path = BASE / exam / "grade3" / f"{pack}.json"
            if not path.exists():
                continue
            with open(path) as f:
                data = json.load(f)
            for i, q in enumerate(data.get("questions", [])):
                q["_file"] = f"public/starter-packs/{exam}/grade3/{pack}.json"
                q["_line_approx"] = 9 + i * 10  # rough line estimate
                q["_exam"] = exam
                q["_pack"] = pack
                all_questions.append(q)
    return all_questions

def main():
    questions = load_all_questions()
    
    # 1. GLOBAL DUPLICATES (questionText)
    text_to_locs = defaultdict(list)
    for q in questions:
        text = (q.get("questionText") or "").strip()
        if text:
            text_to_locs[text].append((q["_file"], q["_pack"], q.get("id", "")))
    
    duplicates = {t: locs for t, locs in text_to_locs.items() if len(locs) > 1}
    
    # 2. Weak explanations & repetitive patterns
    weak_explanations = []
    repetitive = []
    for q in questions:
        exp = (q.get("explanation") or "").strip()
        if len(exp) < 10:
            weak_explanations.append((q["_file"], q.get("id"), exp, q.get("questionText", "")[:50]))
        exp_lower = exp.lower()
        if any(p in exp_lower for p in WEAK_PATTERNS) and len(exp) < 30:
            weak_explanations.append((q["_file"], q.get("id"), exp, q.get("questionText", "")[:50]))
    
    # Repetitive: same explanation text across many questions
    exp_counts = defaultdict(list)
    for q in questions:
        exp = (q.get("explanation") or "").strip()
        if exp:
            exp_counts[exp].append((q["_file"], q.get("id")))
    repetitive = [(exp, locs) for exp, locs in exp_counts.items() if len(locs) >= 3]
    
    # 3. correctAnswer distribution per exam
    answer_dist = {exam: defaultdict(int) for exam in EXAMS}
    for q in questions:
        ans = q.get("correctAnswer", -1)
        if 0 <= ans <= 3:
            answer_dist[q["_exam"]][ans] += 1
    
    # 4. Too advanced for Grade 3
    advanced = []
    for q in questions:
        text = (q.get("questionText") or "").lower()
        exp = (q.get("explanation") or "").lower()
        combined = text + " " + exp
        for p in ADVANCED_PATTERNS:
            if p in combined:
                advanced.append((q["_file"], q.get("id"), q.get("questionText", "")[:80]))
                break
    
    # 5. Ambiguous wording (heuristics: vague pronouns, double negatives, unclear refs)
    ambiguous = []
    ambiguous_phrases = ["which of these", "which one", "what do we call", "what is often", "what of these"]
    for q in questions:
        text = (q.get("questionText") or "").strip()
        text_lower = text.lower()
        # Typo: "What of these" instead of "Which of these"
        if "what of these" in text_lower or "what of the" in text_lower:
            ambiguous.append((q["_file"], q.get("id"), text[:80], "Possible typo: 'what of' vs 'which of'"))
        # Grammar error in question
        if "what is the rules" in text_lower or "what is the first president" in text_lower:
            ambiguous.append((q["_file"], q.get("id"), text[:80], "Grammar: 'is' with plural / article mismatch"))
    
    # Build report
    lines = []
    lines.append("# Grade 3 Olympiad Packs Analysis Report")
    lines.append("")
    lines.append("## 1. GLOBAL DUPLICATES (questionText across ALL exams)")
    if duplicates:
        for text, locs in sorted(duplicates.items(), key=lambda x: -len(x[1]))[:30]:
            lines.append(f"- **{len(locs)}x** duplicate: \"{text[:80]}...\"")
            for f, p, id_ in locs[:5]:
                lines.append(f"  - `{f}` ({p}) id={id_}")
            if len(locs) > 5:
                lines.append(f"  - ... and {len(locs)-5} more")
    else:
        lines.append("- No global duplicates found.")
    lines.append("")
    
    lines.append("## 2. Weak explanations (<10 chars or generic)")
    for f, id_, exp, qtext in weak_explanations[:20]:
        lines.append(f"- `{f}` id={id_}: explanation=\"{exp}\" | Q: \"{qtext}...\"")
    if len(weak_explanations) > 20:
        lines.append(f"- ... and {len(weak_explanations)-20} more")
    lines.append("")
    
    lines.append("## 2b. Repetitive explanation patterns (same text 3+ times)")
    for exp, locs in sorted(repetitive, key=lambda x: -len(x[1]))[:15]:
        lines.append(f"- **{len(locs)}x** \"{exp[:60]}...\"")
        for f, id_ in locs[:3]:
            lines.append(f"  - `{f}` id={id_}")
    lines.append("")
    
    lines.append("## 3. correctAnswer distribution (0,1,2,3)")
    for exam in EXAMS:
        d = answer_dist[exam]
        total = sum(d.values())
        pcts = {i: (d[i]/total*100) if total else 0 for i in range(4)}
        balanced = all(15 < pcts[i] < 45 for i in range(4))
        lines.append(f"- **{exam.upper()}**: 0={d[0]} ({pcts[0]:.0f}%), 1={d[1]} ({pcts[1]:.0f}%), 2={d[2]} ({pcts[2]:.0f}%), 3={d[3]} ({pcts[3]:.0f}%) | Balanced: {balanced}")
    lines.append("")
    
    lines.append("## 4. Possibly too advanced for Grade 3")
    for f, id_, qtext in advanced[:20]:
        lines.append(f"- `{f}` id={id_}: \"{qtext}...\"")
    if not advanced:
        lines.append("- None detected by keyword scan.")
    lines.append("")
    
    lines.append("## 5. Ambiguous wording / grammar issues")
    for f, id_, qtext, note in ambiguous:
        lines.append(f"- `{f}` id={id_}: \"{qtext}...\" | {note}")
    if not ambiguous:
        lines.append("- None detected.")
    
    # Also sample 5-10 questions per exam for manual review
    lines.append("")
    lines.append("---")
    lines.append("## Sample questions per exam (for manual review)")
    for exam in EXAMS:
        exam_qs = [q for q in questions if q["_exam"] == exam]
        sample = exam_qs[::max(1, len(exam_qs)//8)][:8]
        lines.append(f"\n### {exam.upper()}")
        for q in sample:
            exp = (q.get("explanation") or "")
            exp_note = " [WEAK]" if len(exp) < 15 else ""
            lines.append(f"- Q: \"{q.get('questionText','')[:60]}...\" | Exp: \"{exp[:50]}...\"{exp_note} | ans={q.get('correctAnswer')}")

    report = "\n".join(lines)
    out_path = Path(__file__).parent / "grade3_analysis_report.md"
    with open(out_path, "w") as f:
        f.write(report)
    print(report)

if __name__ == "__main__":
    main()

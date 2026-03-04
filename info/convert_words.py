"""
Convert slovarnye_slova_1-11_klass.docx → grade3.json … grade11.json
Each entry: { id, text, hint, sentence, difficulty }
Grades 1-2 already exist; we generate 3-11 only.
"""
import json, re, pathlib
from docx import Document

DOCX = pathlib.Path(r"d:\Sites\Словарь\slovo-platform\info\slovarnye_slova_1-11_klass.docx")
OUT  = pathlib.Path(r"d:\Sites\Словарь\slovo-platform\src\data\words")

# ── difficulty by grade ────────────────────────────────────────────────────
def difficulty(grade: int, word: str) -> int:
    base = 1 if grade <= 2 else 2 if grade <= 4 else 3 if grade <= 6 else 4
    if len(word) >= 12:
        base = min(base + 1, 4)
    return base

# ── generic hint + sentence templates ────────────────────────────────────
SENTENCE_TEMPLATES = [
    "Напиши правильно: ____.",
    "Составь предложение со словом ____.",
    "Объясни значение слова ____.",
    "Вставь пропущенную букву в слове ____.",
    "Запомни написание слова ____.",
]

def make_sentence(word: str, idx: int) -> str:
    tpl = SENTENCE_TEMPLATES[idx % len(SENTENCE_TEMPLATES)]
    return tpl.replace("____", f"«{word}»")

def guess_hint(word: str) -> str:
    """Very basic category guessing from common Russian roots."""
    w = word.lower()
    animals = {"воробей","ворона","сорока","лошадь","петух","журавль","лебедь","попугай"}
    if w in animals:                        return "птица / животное"
    if re.search(r"(ция|ство|ость|ение|ание)$", w): return "отвлечённое понятие"
    if re.search(r"(тель|щик|ник|ор|ер)$", w):      return "профессия / человек"
    if re.search(r"(нный|тный|льный|зный)$", w):     return "прилагательное"
    return "словарное слово"

# ── parse DOCX ────────────────────────────────────────────────────────────
doc = Document(DOCX)

grades: dict[int, list[str]] = {}
current_grade = None

for para in doc.paragraphs:
    text = para.text.strip()
    if not text:
        continue
    # detect grade header  "1класс", "3 класс", " 10 класс" etc.
    m = re.match(r"^\s*(\d{1,2})\s*класс\s*$", text, re.IGNORECASE)
    if m:
        current_grade = int(m.group(1))
        grades[current_grade] = []
        continue
    if current_grade is not None:
        # split by comma or semicolon, clean up
        words = [w.strip().lower() for w in re.split(r"[,;]", text) if w.strip()]
        grades[current_grade].extend(words)

print("Grades found:", sorted(grades.keys()))
for g, ws in sorted(grades.items()):
    print(f"  Grade {g}: {len(ws)} words  (first 5: {ws[:5]})")

# ── write JSON for grades 3-11 ────────────────────────────────────────────
for grade in range(3, 12):
    if grade not in grades:
        print(f"  !! Grade {grade} not found in DOCX, skipping")
        continue

    words = grades[grade]
    # deduplicate preserving order
    seen = set()
    unique_words = []
    for w in words:
        w_clean = re.sub(r"\s+", " ", w).strip()
        if w_clean and w_clean not in seen:
            seen.add(w_clean)
            unique_words.append(w_clean)

    entries = []
    for i, word in enumerate(unique_words, start=1):
        entries.append({
            "id":         f"g{grade}_{i:02d}",
            "text":       word,
            "hint":       guess_hint(word),
            "sentence":   make_sentence(word, i),
            "difficulty": difficulty(grade, word),
        })

    out_file = OUT / f"grade{grade}.json"
    out_file.write_text(
        json.dumps(entries, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"  ✓ Wrote {out_file.name}  ({len(entries)} words)")

print("Done.")

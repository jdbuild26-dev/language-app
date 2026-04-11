"""
Converts "fill-in-the-blanks.csv" into the flat practice CSV format
used by FillBlanksPage (fill_blanks slug).

Each exercise has 10 blanks. The passage text contains [1] __________ markers.
We parse these into passageSegments JSON and blanksData JSON.

Each blank gets: 1 correct answer + 3 wrong answers (shuffled per blank).
Correct answers and wrong answers are '+' separated in the source CSV.

Run from workspace root:
  python language-app/generate_fill_blanks_csv.py
"""
import csv, os, json, re, random

INPUT  = os.path.join(os.path.dirname(__file__), '..', 'fill-in-the-blanks.csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'public', 'mock-data', 'practice', 'reading', 'fill_blanks.csv')

OUT_HEADER = [
    'ExerciseID', 'Instruction_EN', 'Instruction_FR', 'Level', 'LearningLang', 'KnownLang',
    'exercise_tag',
    'passage_fr',       # full passage FR (for reference)
    'passage_en',       # full passage EN (for reference)
    'passageSegments',  # JSON: [{type:"text",text:...},{type:"blank",id:1},...]
    'blanksData',       # JSON: {"1":{"correct":"médecin","correct_en":"doctor","options":["médecin","professeur","serveur","policier"]},...}
    'timeLimitSeconds', 'difficulty',
]

BLANK_RE = re.compile(r'\[(\d+)\]\s*_{2,}')

def parse_plus_list(s):
    """Split 'a + b + c' into ['a','b','c']"""
    if not s:
        return []
    return [x.strip() for x in s.split('+') if x.strip()]

def build_segments(passage_text):
    """Parse passage with [1] __________ markers into segments list."""
    segments = []
    last_end = 0
    for m in BLANK_RE.finditer(passage_text):
        # text before this blank
        text_before = passage_text[last_end:m.start()]
        if text_before:
            segments.append({"type": "text", "text": text_before})
        segments.append({"type": "blank", "id": int(m.group(1))})
        last_end = m.end()
    # remaining text
    tail = passage_text[last_end:]
    if tail:
        segments.append({"type": "text", "text": tail})
    return segments

def find_header_row(path):
    with open(path, encoding='utf-8-sig') as f:
        for i, line in enumerate(f):
            low = line.lower()
            if 'exerciseid' in low or 'correct answer_fr' in low:
                return i
    return 0

def main():
    header_idx = find_header_row(INPUT)
    rows_out = []

    with open(INPUT, encoding='utf-8-sig') as f:
        for _ in range(header_idx):
            next(f)
        reader = csv.DictReader(f)
        # Strip spaces from column names
        reader.fieldnames = [c.strip() for c in reader.fieldnames]

        for row in reader:
            row = {k.strip(): v.strip() if isinstance(v, str) else v for k, v in row.items()}
            eid = row.get('ExerciseID', '').strip()
            if not eid:
                continue

            level      = row.get('Level', 'A1').strip()
            difficulty = row.get('Difficulty', '').strip()
            ex_tag     = row.get('Exercise Tag', '').strip()
            passage_fr = row.get('Fill Paragraph_FR', '').strip()
            passage_en = row.get('Complete Paragraph_ENG', '').strip()

            # Parse correct answers (10 values, '+' separated)
            correct_fr_list = parse_plus_list(row.get('Correct Answer_FR', ''))
            correct_en_list = parse_plus_list(row.get('Correct Answer_EN', ''))

            # Parse wrong answers (10 sets, each '+' separated, columns Wrong Answer_1_FR ... Wrong Answer_10_FR)
            wrong_fr = []
            wrong_en = []
            for i in range(1, 11):
                wfr = parse_plus_list(row.get(f'Wrong Answer_{i}_FR', ''))
                wen = parse_plus_list(row.get(f'Wrong Answer_{i}_EN', ''))
                wrong_fr.append(wfr)
                wrong_en.append(wen)

            if not passage_fr or not correct_fr_list:
                continue

            # Build passageSegments from FR passage
            segments = build_segments(passage_fr)

            # Build blanksData: per blank, shuffle correct + 3 wrong options
            blanks_data = {}
            for idx, correct_fr in enumerate(correct_fr_list):
                blank_id = str(idx + 1)
                correct_en = correct_en_list[idx] if idx < len(correct_en_list) else correct_fr
                wrongs_fr = wrong_fr[idx] if idx < len(wrong_fr) else []
                wrongs_en = wrong_en[idx] if idx < len(wrong_en) else []

                # Build paired options and shuffle
                pairs = [(correct_fr, correct_en)] + list(zip(wrongs_fr[:3], wrongs_en[:3]))
                # Pad if fewer than 4
                while len(pairs) < 4:
                    pairs.append(('', ''))
                pairs = [(f, e) for f, e in pairs if f]
                random.shuffle(pairs)

                blanks_data[blank_id] = {
                    'correct':    correct_fr,
                    'correct_en': correct_en,
                    'options':    [p[0] for p in pairs],
                    'options_en': [p[1] for p in pairs],
                }

            rows_out.append({
                'ExerciseID':      eid,
                'Instruction_EN':  'Select the best option for each missing word',
                'Instruction_FR':  'Choisissez le meilleur mot pour chaque espace',
                'Level':           level,
                'LearningLang':    'fr',
                'KnownLang':       'en',
                'exercise_tag':    ex_tag,
                'passage_fr':      passage_fr,
                'passage_en':      passage_en,
                'passageSegments': json.dumps(segments, ensure_ascii=False),
                'blanksData':      json.dumps(blanks_data, ensure_ascii=False),
                'timeLimitSeconds': '480',
                'difficulty':      difficulty,
            })

    with open(OUTPUT, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=OUT_HEADER)
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"Written {len(rows_out)} rows to {OUTPUT}")

if __name__ == '__main__':
    main()

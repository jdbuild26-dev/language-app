"""
Converts "image to description.csv" into the flat practice CSV format
used by ImageMCQPage (image_mcq slug).

Options are shuffled per row; correctIndex is tracked after shuffle.

Run from workspace root:
  python language-app/generate_image_mcq_csv.py
"""
import csv, os, random

INPUT  = os.path.join(os.path.dirname(__file__), '..', 'image to description.csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'public', 'mock-data', 'practice', 'reading', 'image_mcq.csv')

OUT_HEADER = [
    'ExerciseID', 'Instruction_EN', 'Instruction_FR', 'Level', 'LearningLang', 'KnownLang',
    'question_en', 'question_fr',
    'options_fr', 'options_en',
    'correctIndex',
    'imageUrl', 'imageAlt',
    'timeLimitSeconds', 'difficulty', 'exercise_tag',
]

def find_header_row(path):
    with open(path, encoding='utf-8-sig') as f:
        for i, line in enumerate(f):
            low = line.lower()
            if 'exerciseid' in low or 'heading_en' in low or 'heading_fr' in low:
                return i
    return 0

def main():
    header_idx = find_header_row(INPUT)
    rows_out = []
    seen_ids = {}  # track duplicate IDs → auto-increment suffix

    with open(INPUT, encoding='utf-8-sig') as f:
        for _ in range(header_idx):
            next(f)
        reader = csv.DictReader(f)
        for row in reader:
            eid = (row.get('ExerciseID') or '').strip()
            if not eid:
                continue

            # Deduplicate IDs
            if eid in seen_ids:
                seen_ids[eid] += 1
                eid = f"{eid}_{seen_ids[eid]:02d}"
            else:
                seen_ids[eid] = 0

            heading_en = (row.get('Heading_EN') or '').strip()
            heading_fr = (row.get('Heading_FR') or '').strip()
            question_en = (row.get('Question_EN') or '').strip()
            question_fr = (row.get('Question_FR') or '').strip()
            correct_en  = (row.get('Correct answer_EN') or '').strip()
            correct_fr  = (row.get('Correct answer_FR') or '').strip()
            wrong1_en   = (row.get('Wrong answer_1_EN') or '').strip()
            wrong1_fr   = (row.get('Wrong answer_1_FR') or '').strip()
            wrong2_en   = (row.get('Wrong answer_2_EN') or '').strip()
            wrong2_fr   = (row.get('Wrong answer_2_FR') or '').strip()
            wrong3_en   = (row.get('Wrong answer_3_EN') or '').strip()
            wrong3_fr   = (row.get('Wrong answer_3_FR') or '').strip()
            image_url   = (row.get('Image link from Cloudinary') or '').strip()
            time_lim    = (row.get('Time') or '120').strip()
            difficulty  = (row.get('Difficulty') or '').strip()
            ex_tag      = (row.get('Exercise Tag') or '').strip()
            level       = (row.get('Level') or 'B1').strip()
            shuffle     = (row.get('Shuffle Options') or 'Yes').strip().lower() == 'yes'

            if not correct_en and not correct_fr:
                continue

            # Build paired options list: [(fr, en), ...]
            pairs = [
                (correct_fr, correct_en),
                (wrong1_fr, wrong1_en),
                (wrong2_fr, wrong2_en),
                (wrong3_fr, wrong3_en),
            ]
            # Filter out empty pairs
            pairs = [(f, e) for f, e in pairs if f or e]

            if shuffle:
                random.shuffle(pairs)

            # Find correct index after shuffle
            correct_idx = next(
                (i for i, (f, e) in enumerate(pairs) if f == correct_fr and e == correct_en),
                0
            )

            import json
            options_fr = json.dumps([f for f, e in pairs], ensure_ascii=False)
            options_en = json.dumps([e for f, e in pairs], ensure_ascii=False)

            rows_out.append({
                'ExerciseID':      eid,
                'Instruction_EN':  heading_en,
                'Instruction_FR':  heading_fr,
                'Level':           level,
                'LearningLang':    'fr',
                'KnownLang':       'en',
                'question_en':     question_en,
                'question_fr':     question_fr,
                'options_fr':      options_fr,
                'options_en':      options_en,
                'correctIndex':    correct_idx,
                'imageUrl':        image_url,
                'imageAlt':        heading_en,
                'timeLimitSeconds': time_lim,
                'difficulty':      difficulty,
                'exercise_tag':    ex_tag,
            })

    with open(OUTPUT, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=OUT_HEADER)
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"Written {len(rows_out)} rows to {OUTPUT}")

if __name__ == '__main__':
    main()

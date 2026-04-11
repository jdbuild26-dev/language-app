"""
Converts "Reading-comprehension.csv" into the flat practice CSV format
used by ComprehensionPage (passage_mcq slug).

Each exercise has 5 questions → expands to 5 rows (RCN001_Q1 ... RCN001_Q5).
Each row: passage (FR+EN), question (FR+EN), 4 options (FR+EN), correctIndex=0
Options are shuffled so correct answer is not always first.

Run from workspace root:
  python language-app/generate_reading_comprehension_csv.py
"""
import csv, os, json, random

INPUT  = os.path.join(os.path.dirname(__file__), '..', 'Reading-comprehension.csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'public', 'mock-data', 'practice', 'reading', 'comprehension.csv')

OUT_HEADER = [
    'ExerciseID', 'Instruction_EN', 'Instruction_FR', 'Level', 'LearningLang', 'KnownLang',
    'passage_title_en', 'passage_title_fr',
    'passage_en', 'passage_fr',
    'question_en', 'question_fr',
    'options_en',   # JSON array of 4 options in EN
    'options_fr',   # JSON array of 4 options in FR
    'correctIndex', # 0-based index of correct answer after shuffle
    'timeLimitSeconds', 'difficulty', 'exercise_tag',
]

def find_header_row(path):
    with open(path, encoding='utf-8-sig') as f:
        for i, line in enumerate(f):
            low = line.lower()
            if 'exerciseid' in low or 'heading_en' in low:
                return i
    return 0

def main():
    header_idx = find_header_row(INPUT)
    rows_out = []

    with open(INPUT, encoding='utf-8-sig') as f:
        for _ in range(header_idx):
            next(f)
        reader = csv.DictReader(f)
        for row in reader:
            eid = (row.get('ExerciseID') or '').strip()
            if not eid:
                continue

            heading_en    = (row.get('Heading_EN') or '').strip()
            heading_fr    = (row.get('Heading_FR') or '').strip()
            title_en      = (row.get('Passage Title_EN') or '').strip()
            title_fr      = (row.get('Passage Title_FR') or '').strip()
            passage_en    = (row.get('Complete Paragraph_EN') or '').strip()
            passage_fr    = (row.get('Complete Paragraph_FR') or '').strip()
            level         = (row.get('Level') or 'B1').strip()
            time_lim      = (row.get('Time') or '600').strip()
            difficulty    = (row.get('Difficulty') or '').strip()
            ex_tag        = (row.get('Exercise Tag') or '').strip()

            for q_num in range(1, 6):
                q_fr      = (row.get(f'Question {q_num}_FR') or '').strip()
                q_en      = (row.get(f'Question {q_num}_EN') or '').strip()
                correct_fr = (row.get(f'Question {q_num}_Correct Answer_1_FR') or '').strip()
                correct_en = (row.get(f'Question {q_num}_Correct Answer_1_EN') or '').strip()
                dist1_fr  = (row.get(f'Question {q_num}_Distractor_1_FR') or '').strip()
                dist2_fr  = (row.get(f'Question {q_num}_Distractor_2_FR') or '').strip()
                dist3_fr  = (row.get(f'Question {q_num}_Distractor_3_FR') or '').strip()
                dist1_en  = (row.get(f'Question {q_num}_Distractor_1_EN') or '').strip()
                dist2_en  = (row.get(f'Question {q_num}_Distractor_2_EN') or '').strip()
                dist3_en  = (row.get(f'Question {q_num}_Distractor_3_EN') or '').strip()

                if not q_en and not q_fr:
                    continue
                if not correct_en and not correct_fr:
                    continue

                # Build paired options and shuffle together
                pairs = [
                    (correct_fr, correct_en),
                    (dist1_fr, dist1_en),
                    (dist2_fr, dist2_en),
                    (dist3_fr, dist3_en),
                ]
                pairs = [(f, e) for f, e in pairs if f or e]
                random.shuffle(pairs)

                correct_idx = next(
                    (i for i, (f, e) in enumerate(pairs)
                     if f == correct_fr and e == correct_en), 0
                )

                opts_fr = [p[0] for p in pairs]
                opts_en = [p[1] for p in pairs]

                rows_out.append({
                    'ExerciseID':       f'{eid}_Q{q_num}',
                    'Instruction_EN':   heading_en,
                    'Instruction_FR':   heading_fr,
                    'Level':            level,
                    'LearningLang':     'fr',
                    'KnownLang':        'en',
                    'passage_title_en': title_en,
                    'passage_title_fr': title_fr,
                    'passage_en':       passage_en,
                    'passage_fr':       passage_fr,
                    'question_en':      q_en,
                    'question_fr':      q_fr,
                    'options_en':       json.dumps(opts_en, ensure_ascii=False),
                    'options_fr':       json.dumps(opts_fr, ensure_ascii=False),
                    'correctIndex':     correct_idx,
                    'timeLimitSeconds': time_lim,
                    'difficulty':       difficulty,
                    'exercise_tag':     ex_tag,
                })

    with open(OUTPUT, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=OUT_HEADER)
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"Written {len(rows_out)} rows to {OUTPUT}")

if __name__ == '__main__':
    main()

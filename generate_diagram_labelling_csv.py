"""
Converts "diagram-labelling.csv" into the flat practice CSV format
used by DiagramLabellingPage (diagram_mapping slug).

Structure per exercise:
  - passage_fr / passage_en  : full paragraph text
  - title_fr / title_en      : passage title
  - question_fr / question_en: instruction text
  - answers_fr / answers_en  : JSON array of 6 correct answers (in order = positions 1-6)
  - distractors_fr / distractors_en: JSON array of 2 distractor words
  - questions_json           : JSON array [{id:1,correct_fr:...,correct_en:...}, ...]

Run from workspace root:
  python language-app/generate_diagram_labelling_csv.py
"""
import csv, os, json

INPUT  = os.path.join(os.path.dirname(__file__), '..', 'diagram-labelling.csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'public', 'mock-data', 'practice', 'reading', 'diagram_labelling.csv')

OUT_HEADER = [
    'ExerciseID', 'Instruction_EN', 'Instruction_FR', 'Level', 'LearningLang', 'KnownLang',
    'title_en', 'title_fr',
    'passage_en', 'passage_fr',
    'question_en', 'question_fr',
    'answers_fr', 'answers_en',
    'distractors_fr', 'distractors_en',
    'questions_json',
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

            heading_en   = (row.get('Heading_EN') or '').strip()
            heading_fr   = (row.get('Heading_FR') or '').strip()
            title_en     = (row.get('Passage Title_EN') or '').strip()
            title_fr     = (row.get('Passage Title_FR') or '').strip()
            passage_en   = (row.get('Complete Paragraph_EN') or '').strip()
            passage_fr   = (row.get('Complete Paragraph_FR') or '').strip()
            question_en  = (row.get('Question_EN') or '').strip()
            question_fr  = (row.get('Question_FR') or '').strip()
            level        = (row.get('Level') or 'B1').strip()
            time_lim     = (row.get('Time') or '120').strip()
            difficulty   = (row.get('Difficulty') or '').strip()
            ex_tag       = (row.get('Exercise Tag') or '').strip()

            # 6 correct answers
            answers_fr = [
                (row.get(f'Answer {i}_FR') or '').strip()
                for i in range(1, 7)
            ]
            answers_en = [
                (row.get(f'Answer {i}_EN') or '').strip()
                for i in range(1, 7)
            ]
            # 2 distractors
            distractors_fr = [
                (row.get('Distractor 1_FR') or '').strip(),
                (row.get('Distractor 2_FR') or '').strip(),
            ]
            distractors_en = [
                (row.get('Distractor 1_EN') or '').strip(),
                (row.get('Distractor 2_EN') or '').strip(),
            ]

            # Build questions array: [{id, correct_fr, correct_en}, ...]
            questions = [
                {'id': i + 1, 'correct_fr': answers_fr[i], 'correct_en': answers_en[i]}
                for i in range(6)
                if answers_fr[i] or answers_en[i]
            ]

            if not questions:
                continue

            rows_out.append({
                'ExerciseID':      eid,
                'Instruction_EN':  heading_en,
                'Instruction_FR':  heading_fr,
                'Level':           level,
                'LearningLang':    'fr',
                'KnownLang':       'en',
                'title_en':        title_en,
                'title_fr':        title_fr,
                'passage_en':      passage_en,
                'passage_fr':      passage_fr,
                'question_en':     question_en,
                'question_fr':     question_fr,
                'answers_fr':      json.dumps(answers_fr, ensure_ascii=False),
                'answers_en':      json.dumps(answers_en, ensure_ascii=False),
                'distractors_fr':  json.dumps(distractors_fr, ensure_ascii=False),
                'distractors_en':  json.dumps(distractors_en, ensure_ascii=False),
                'questions_json':  json.dumps(questions, ensure_ascii=False),
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

"""
Converts "Sentence-completion.csv" into the flat practice CSV format
used by CompletePassagePage (sentence_completion slug).

Each row = one exercise: passage split into before/after with a missing sentence.
Options are shuffled; correctIndex tracked after shuffle.

Run from workspace root:
  python language-app/generate_sentence_completion_csv.py
"""
import csv, os, json, random

INPUT  = os.path.join(os.path.dirname(__file__), '..', 'Sentence-completion.csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'public', 'mock-data', 'practice', 'reading', 'sentence_completion.csv')

OUT_HEADER = [
    'ExerciseID', 'Instruction_EN', 'Instruction_FR', 'Level', 'LearningLang', 'KnownLang',
    'passage_title_en', 'passage_title_fr',
    'passage_before_en', 'passage_before_fr',
    'passage_after_en', 'passage_after_fr',
    'options_en',    # JSON array of 4 shuffled options in EN
    'options_fr',    # JSON array of 4 shuffled options in FR
    'correctIndex',  # 0-based after shuffle
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
            before_en     = (row.get('Paragraph_Before_EN') or '').strip()
            before_fr     = (row.get('Paragraph_Before_FR') or '').strip()
            after_en      = (row.get('Paragraph_After_EN') or '').strip()
            after_fr      = (row.get('Paragraph_After_FR') or '').strip()
            correct_en    = (row.get('Correct_Missing sentence_EN') or '').strip()
            correct_fr    = (row.get('Correct_Missing sentence_FR') or '').strip()
            d1_en         = (row.get('Distractor_1_EN') or '').strip()
            d2_en         = (row.get('Distractor_2_EN') or '').strip()
            d3_en         = (row.get('Distractor_3_EN') or '').strip()
            d1_fr         = (row.get('Distractor_1_FR') or '').strip()
            d2_fr         = (row.get('Distractor_2_FR') or '').strip()
            d3_fr         = (row.get('Distractor_3_FR') or '').strip()
            level         = (row.get('Level') or 'B1').strip()
            time_lim      = (row.get('Time') or '360').strip()
            difficulty    = (row.get('Difficulty') or '').strip()
            ex_tag        = (row.get('Exercise Tag') or '').strip()

            if not correct_en and not correct_fr:
                continue
            if not before_en and not before_fr:
                continue

            # Shuffle options together (keep FR/EN aligned)
            pairs = [
                (correct_fr, correct_en),
                (d1_fr, d1_en),
                (d2_fr, d2_en),
                (d3_fr, d3_en),
            ]
            pairs = [(f, e) for f, e in pairs if f or e]
            random.shuffle(pairs)

            correct_idx = next(
                (i for i, (f, e) in enumerate(pairs)
                 if f == correct_fr and e == correct_en), 0
            )

            rows_out.append({
                'ExerciseID':       eid,
                'Instruction_EN':   heading_en,
                'Instruction_FR':   heading_fr,
                'Level':            level,
                'LearningLang':     'fr',
                'KnownLang':        'en',
                'passage_title_en': title_en,
                'passage_title_fr': title_fr,
                'passage_before_en': before_en,
                'passage_before_fr': before_fr,
                'passage_after_en':  after_en,
                'passage_after_fr':  after_fr,
                'options_en':       json.dumps([p[1] for p in pairs], ensure_ascii=False),
                'options_fr':       json.dumps([p[0] for p in pairs], ensure_ascii=False),
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

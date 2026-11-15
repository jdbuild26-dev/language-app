"""
Converts "image to description.csv" into the flat practice CSV format
used by ImageMCQPage (image_mcq slug).

Options are shuffled per row; correctIndex is tracked after shuffle.

Run from workspace root:
  python language-app/generate_image_mcq_csv.py
"""
import csv, json, os, random, re

INPUT  = os.path.join(os.path.dirname(__file__), '..', 'image to description.csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'public', 'mock-data', 'practice', 'reading', 'image_mcq.csv')

OUT_HEADER = [
    'ExerciseID', 'Instruction_EN', 'Instruction_FR', 'Level', 'LearningLang', 'KnownLang',
    'heading_en', 'heading_fr', 'question_en', 'question_fr',
    'options_fr', 'options_en',
    'localized',
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
            learning_lang = (row.get('LearningLang') or 'fr').strip().lower()
            known_lang = (row.get('KnownLang') or 'en').strip().lower()
            languages = {learning_lang, known_lang}
            pattern = re.compile(r'^(?:Heading|Question|Correct answer|Wrong answer_\d+)_([a-z]{2,3})$', re.IGNORECASE)
            for column in row:
                match = pattern.match(column.strip())
                if match:
                    languages.add(match.group(1).lower())
            image_url   = (row.get('Image link from Cloudinary') or '').strip()
            time_lim    = (row.get('Time') or '120').strip()
            difficulty  = (row.get('Difficulty') or '').strip()
            ex_tag      = (row.get('Exercise Tag') or '').strip()
            level       = (row.get('Level') or 'B1').strip()
            shuffle     = (row.get('Shuffle Options') or 'Yes').strip().lower() == 'yes'

            correct = {
                code: (row.get(f'Correct answer_{code.upper()}') or '').strip()
                for code in languages
            }
            if not correct.get(learning_lang):
                continue

            # Shuffle option positions together so the correct index stays aligned.
            pairs = [(True, correct)]
            for number in range(1, 11):
                wrong = {
                    code: (row.get(f'Wrong answer_{number}_{code.upper()}') or '').strip()
                    for code in languages
                }
                if wrong.get(learning_lang):
                    pairs.append((False, wrong))

            if shuffle:
                random.shuffle(pairs)

            correct_idx = next(i for i, (is_correct, _) in enumerate(pairs) if is_correct)
            localized = {
                code: {
                    'heading': (row.get(f'Heading_{code.upper()}') or row.get(f'Instruction_{code.upper()}') or '').strip(),
                    'question': (row.get(f'Question_{code.upper()}') or '').strip(),
                    'options': [values.get(code, '') for _, values in pairs],
                }
                for code in languages
            }
            options_fr = json.dumps(localized.get('fr', {}).get('options', []), ensure_ascii=False)
            options_en = json.dumps(localized.get('en', {}).get('options', []), ensure_ascii=False)

            rows_out.append({
                'ExerciseID':      eid,
                'Instruction_EN':  heading_en,
                'Instruction_FR':  heading_fr,
                'Level':           level,
                'LearningLang':    learning_lang,
                'KnownLang':       known_lang,
                'heading_en':      heading_en,
                'heading_fr':      heading_fr,
                'question_en':     question_en,
                'question_fr':     question_fr,
                'options_fr':      options_fr,
                'options_en':      options_en,
                'localized':       json.dumps(localized, ensure_ascii=False),
                'correctIndex':    correct_idx,
                'imageUrl':        image_url,
                'imageAlt':        localized.get(known_lang, {}).get('heading', ''),
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

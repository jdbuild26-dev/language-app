"""
Converts "image-labelling.csv" into the flat practice CSV format
used by ImageLabellingPage (image_labelling slug).

Each exercise has:
  - 8 correct answers (labelled items on the image)
  - 2 distractors
  - Image URL (empty until Cloudinary URLs are added)

Items are stored with evenly-distributed placeholder x/y coordinates
arranged in a 2x4 grid. These will be replaced when real images + marker
positions are provided.

Run from workspace root:
  python language-app/generate_image_labelling_csv.py
"""
import csv, os, json, re

INPUT  = os.path.join(os.path.dirname(__file__), '..', 'image-labelling.csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'public', 'mock-data', 'practice', 'reading', 'image_labelling.csv')

OUT_HEADER = [
    'ExerciseID', 'Instruction_EN', 'Instruction_FR', 'Level', 'LearningLang', 'KnownLang',
    'heading_en', 'heading_fr', 'title_en', 'title_fr',
    'question_en', 'question_fr',
    'image',
    'items', 'localized',
    'items_fr',   # JSON: [{id,name_fr,name_en,x,y}, ...]
    'items_en',   # same but name_en as primary
    'word_bank_fr',  # JSON: all 8 correct_fr + 2 distractors_fr (shuffled)
    'word_bank_en',  # JSON: all 8 correct_en + 2 distractors_en
    'timeLimitSeconds', 'difficulty', 'exercise_tag',
]

# Placeholder 2×4 grid coordinates (x, y as fractions of image size)
PLACEHOLDER_COORDS = [
    (0.15, 0.25), (0.40, 0.25), (0.65, 0.25), (0.88, 0.25),
    (0.15, 0.65), (0.40, 0.65), (0.65, 0.65), (0.88, 0.65),
]

def find_header_row(path):
    with open(path, encoding='utf-8-sig') as f:
        for i, line in enumerate(f):
            low = line.lower()
            if 'exerciseid' in low or 'heading_en' in low:
                return i
    return 0

def main():
    import random
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

            heading_en  = (row.get('Heading_EN') or '').strip()
            heading_fr  = (row.get('Heading_FR') or '').strip()
            title_en    = (row.get('Passage Title_EN') or '').strip()
            title_fr    = (row.get('Passage Title_FR') or '').strip()
            question_en = (row.get('Question_EN') or '').strip()
            question_fr = (row.get('Question_FR') or '').strip()
            image_url   = (row.get('Image link from Cloudinary') or '').strip()
            level       = (row.get('Level') or 'B1').strip()
            time_lim    = (row.get('Time') or '120').strip()
            difficulty  = (row.get('Difficulty') or '').strip()
            ex_tag      = (row.get('Exercise Tag') or '').strip()

            learning_lang = (row.get('LearningLang') or 'fr').strip().lower()
            known_lang = (row.get('KnownLang') or 'en').strip().lower()
            languages = {learning_lang, known_lang}
            pattern = re.compile(r'^(?:Heading|Passage Title|Question|Correct Answer \d+|Distractor \d+)_([a-z]{2,3})$', re.IGNORECASE)
            for column in row:
                match = pattern.match(column.strip())
                if match:
                    languages.add(match.group(1).lower())
            localized = {}
            for code in languages:
                suffix = code.upper()
                answers = [(row.get(f'Correct Answer {i}_{suffix}') or '').strip() for i in range(1, 9)]
                distractors = [(row.get(f'Distractor {i}_{suffix}') or '').strip() for i in range(1, 3)]
                localized[code] = {
                    'heading': (row.get(f'Heading_{suffix}') or '').strip(),
                    'title': (row.get(f'Passage Title_{suffix}') or '').strip(),
                    'question': (row.get(f'Question_{suffix}') or '').strip(),
                    'answers': answers,
                    'word_bank': [value for value in [*answers, *distractors] if value],
                }

            # 8 correct answers
            answers_fr = [(row.get(f'Correct Answer {i}_FR') or '').strip() for i in range(1, 9)]
            answers_en = [(row.get(f'Correct Answer {i}_EN') or '').strip() for i in range(1, 9)]
            answers_fr = [a for a in answers_fr if a]
            answers_en = [a for a in answers_en if a]

            # 2 distractors
            dist_fr = [(row.get(f'Distractor {i}_FR') or '').strip() for i in range(1, 3)]
            dist_en = [(row.get(f'Distractor {i}_EN') or '').strip() for i in range(1, 3)]
            dist_fr = [d for d in dist_fr if d]
            dist_en = [d for d in dist_en if d]

            learning_answers = localized[learning_lang]['answers']
            if not any(learning_answers):
                continue

            n = min(len(learning_answers), len(PLACEHOLDER_COORDS))

            # Build items array with placeholder coordinates
            items = []
            for i in range(n):
                if not learning_answers[i]:
                    continue
                x, y = PLACEHOLDER_COORDS[i]
                names = {code: values['answers'][i] for code, values in localized.items()}
                items.append({
                    'id':      i + 1,
                    'name_fr': names.get('fr', ''),
                    'name_en': names.get('en', ''),
                    'name_by_lang': names,
                    'x':       x,
                    'y':       y,
                })

            # Word bank = all correct answers + distractors, shuffled
            wb_fr = answers_fr + dist_fr
            wb_en = answers_en + dist_en
            random.shuffle(wb_fr)
            # Keep en aligned with fr after shuffle — shuffle together
            paired = list(zip(answers_fr + dist_fr, answers_en + dist_en))
            random.shuffle(paired)
            wb_fr = [p[0] for p in paired]
            wb_en = [p[1] for p in paired]

            rows_out.append({
                'ExerciseID':      eid,
                'Instruction_EN':  heading_en,
                'Instruction_FR':  heading_fr,
                'Level':           level,
                'LearningLang':    learning_lang,
                'KnownLang':       known_lang,
                'heading_en':      heading_en,
                'heading_fr':      heading_fr,
                'title_en':        title_en,
                'title_fr':        title_fr,
                'question_en':     question_en,
                'question_fr':     question_fr,
                'image':           image_url,
                'items':           json.dumps(items, ensure_ascii=False),
                'localized':       json.dumps(localized, ensure_ascii=False),
                'items_fr':        json.dumps(items, ensure_ascii=False),
                'items_en':        json.dumps(items, ensure_ascii=False),
                'word_bank_fr':    json.dumps(wb_fr, ensure_ascii=False),
                'word_bank_en':    json.dumps(wb_en, ensure_ascii=False),
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

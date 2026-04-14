"""
Converts "translate-the-sentence.csv" into the flat practice CSV format
used by BubbleSelectionPage (translate_bubbles slug).

Each exercise:
  - SourceSentence: Complete Sentence_EN (shown to learner)
  - TargetSentence: Complete Sentence_FR (correct answer)
  - BubbleTokens: FR tokens + distractor tokens, shuffled
  - CorrectAnswer: Complete Sentence_FR (for feedback)

Run from workspace root:
  python language-app/generate_translate_sentence_csv.py
"""
import csv, os, json, random, io

INPUT  = os.path.join(os.path.dirname(__file__), '..', 'translate-the-sentence.csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'public', 'mock-data', 'practice', 'reading', 'translate_bubbles.csv')

OUT_HEADER = [
    'ExerciseID', 'Instruction_EN', 'Instruction_FR', 'Level', 'LearningLang', 'KnownLang',
    'SourceSentence',   # EN sentence shown to learner
    'TargetSentence',   # FR correct answer
    'BubbleTokens',     # JSON array: correct FR tokens + distractors, shuffled
    'CorrectAnswer',    # FR complete sentence
    'timeLimitSeconds', 'difficulty', 'exercise_tag',
]

def find_header_row(path):
    with open(path, encoding='utf-8-sig') as f:
        for i, line in enumerate(f):
            if 'ExerciseID' in line:
                return i
    return 0

def main():
    header_idx = find_header_row(INPUT)
    rows_out = []

    with open(INPUT, encoding='utf-8-sig') as f:
        lines = f.readlines()

    reader = csv.DictReader(io.StringIO(''.join(lines[header_idx:])))
    for row in reader:
        row = {k.strip(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}
        eid = row.get('ExerciseID', '').strip()
        if not eid or not eid.startswith('TTS'):
            continue

        heading_en    = row.get('Heading_EN', '').strip()
        heading_fr    = row.get('Heading_FR', '').strip()
        source_en     = row.get('Complete Sentence _EN', '').strip()
        target_fr     = row.get('Complete Sentence _FR', '').strip()
        bubble_raw    = row.get('BubbleTokens', '').strip()
        distract_raw  = row.get('Distractor Tokens', '').strip()
        level         = row.get('Level', 'B2').strip()
        time_lim      = row.get('Time Limit', '360').strip() or '360'
        difficulty    = row.get('Difficulty', '').strip()
        ex_tag        = row.get('Exercise Tag', '').strip()

        if not source_en or not target_fr or not bubble_raw:
            continue

        # Parse tokens ('+' separated, filter out lone commas)
        correct_tokens = [t.strip() for t in bubble_raw.split('+') if t.strip() and t.strip() != ',']
        distract_tokens = [t.strip() for t in distract_raw.split('+') if t.strip() and t.strip() != ','] if distract_raw else []

        # Combine and shuffle
        all_tokens = correct_tokens + distract_tokens
        random.shuffle(all_tokens)

        rows_out.append({
            'ExerciseID':      eid,
            'Instruction_EN':  heading_en,
            'Instruction_FR':  heading_fr,
            'Level':           level,
            'LearningLang':    'fr',
            'KnownLang':       'en',
            'SourceSentence':  source_en,
            'TargetSentence':  target_fr,
            'BubbleTokens':    json.dumps(all_tokens, ensure_ascii=False),
            'CorrectAnswer':   target_fr,
            'timeLimitSeconds': time_lim,
            'difficulty':      difficulty,
            'exercise_tag':    ex_tag,
        })

    with open(OUTPUT, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=OUT_HEADER)
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"Written {len(rows_out)} rows to {OUTPUT}")
    if rows_out:
        r = rows_out[0]
        print('Sample:', r['ExerciseID'], '|', r['SourceSentence'])
        print('Tokens:', json.loads(r['BubbleTokens']))

if __name__ == '__main__':
    main()

"""
Merges Running-conversation.csv (scenarios) with Running-conversation(2).csv (questions)
into the flat practice CSV format used by ConversationPage (conversation_dialogue slug).

Each exercise row contains:
  - Scenario metadata (title, context, objectives FR+EN)
  - exchanges: JSON array of {speakerText, questionText, correctOptionId, options}
    where speakerText = context (shown once), questionText = the question,
    options = shuffled [correct + 3 distractors]

Run from workspace root:
  python language-app/generate_running_conversation_csv.py
"""
import csv, os, json, random, io

SCENARIOS_FILE = os.path.join(os.path.dirname(__file__), '..', 'Running-conversation.csv')
QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), '..', 'Running-conversation(2).csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'public', 'mock-data', 'practice', 'reading', 'reading_conversation.csv')

OUT_HEADER = [
    'ExerciseID', 'Level', 'LearningLang', 'KnownLang',
    'title_en', 'title_fr',
    'context_en', 'context_fr',
    'objectives_en', 'objectives_fr',
    'exchanges',        # JSON array of exchange objects
    'timeLimitSeconds', 'difficulty', 'exercise_tag',
]

def find_header_row(path):
    with open(path, encoding='utf-8-sig') as f:
        for i, line in enumerate(f):
            if 'ExerciseID' in line:
                return i
    return 0

def read_csv(path):
    header_idx = find_header_row(path)
    with open(path, encoding='utf-8-sig') as f:
        lines = f.readlines()
    reader = csv.DictReader(io.StringIO(''.join(lines[header_idx:])))
    return [{k.strip(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()} for row in reader]

def main():
    scenarios = {r['ExerciseID']: r for r in read_csv(SCENARIOS_FILE) if r.get('ExerciseID')}
    questions_raw = [r for r in read_csv(QUESTIONS_FILE) if r.get('ExerciseID') and r.get('Question 1_FR')]

    # Group questions by ExerciseID, sorted by Question #
    from collections import defaultdict
    questions_by_ex = defaultdict(list)
    for row in questions_raw:
        eid = row.get('ExerciseID', '').strip()
        if eid:
            questions_by_ex[eid].append(row)

    rows_out = []

    for eid, scenario in scenarios.items():
        eid = eid.strip()
        if not eid:
            continue

        title_en   = scenario.get('Scenario Title_EN', '').strip()
        title_fr   = scenario.get('Scenario Title_FR', '').strip()
        context_en = scenario.get('Context_EN', '').strip()
        context_fr = scenario.get('Context_FR', '').strip()
        obj_en     = scenario.get('Objectives_EN', '').strip()
        obj_fr     = scenario.get('Objectives_FR', '').strip()
        level      = scenario.get('Level', 'B1').strip()
        time_lim   = scenario.get('Time', '360').strip() or '360'
        difficulty = scenario.get('Difficulty', '').strip()
        ex_tag     = scenario.get('Exercise Tag', '').strip()

        q_rows = questions_by_ex.get(eid, [])
        if not q_rows:
            continue

        exchanges = []
        for q_row in q_rows:
            q_fr      = q_row.get('Question 1_FR', '').strip()
            q_en      = q_row.get('Question 1_EN', '').strip()
            correct_fr = q_row.get('Correct 1_FR', '').strip()
            correct_en = q_row.get('Correct 1_EN', '').strip()
            d1_fr = q_row.get('Distractor 1_FR', '').strip()
            d2_fr = q_row.get('Distractor 2_FR', '').strip()
            d3_fr = q_row.get('Distractor 3_FR', '').strip()
            d1_en = q_row.get('Distractor 1_EN', '').strip()
            d2_en = q_row.get('Distractor 2_EN', '').strip()
            d3_en = q_row.get('Distractor 3_EN', '').strip()

            if not q_fr and not q_en:
                continue

            # Build paired options and shuffle
            pairs = [
                (correct_fr, correct_en, True),
                (d1_fr, d1_en, False),
                (d2_fr, d2_en, False),
                (d3_fr, d3_en, False),
            ]
            pairs = [(f, e, c) for f, e, c in pairs if f or e]
            random.shuffle(pairs)

            correct_idx = next((i for i, (f, e, c) in enumerate(pairs) if c), 0)

            options = [
                {'id': i, 'text_fr': f, 'text_en': e}
                for i, (f, e, c) in enumerate(pairs)
            ]

            exchanges.append({
                'speakerText':    context_fr,   # FR context shown in conversation bubble
                'speakerText_en': context_en,   # EN version
                'questionText':   q_fr,         # FR question (level-based display)
                'questionText_en': q_en,        # EN question
                'correctOptionId': correct_idx,
                'options': options,
            })

        if not exchanges:
            continue

        rows_out.append({
            'ExerciseID':      eid,
            'Level':           level,
            'LearningLang':    'fr',
            'KnownLang':       'en',
            'title_en':        title_en,
            'title_fr':        title_fr,
            'context_en':      context_en,
            'context_fr':      context_fr,
            'objectives_en':   obj_en,
            'objectives_fr':   obj_fr,
            'exchanges':       json.dumps(exchanges, ensure_ascii=False),
            'timeLimitSeconds': time_lim,
            'difficulty':      difficulty,
            'exercise_tag':    ex_tag,
        })

    with open(OUTPUT, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=OUT_HEADER)
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"Written {len(rows_out)} exercises to {OUTPUT}")
    if rows_out:
        r = rows_out[0]
        exs = json.loads(r['exchanges'])
        print(f"  {r['ExerciseID']}: {len(exs)} exchanges, title: {r['title_en']}")
        print(f"  First exchange question: {exs[0]['questionText_en']}")
        print(f"  Options: {[o['text_en'] for o in exs[0]['options']]}")

if __name__ == '__main__':
    main()

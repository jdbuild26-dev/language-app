"""
Converts "reorder-sentence.csv" into the flat practice CSV format
used by ReorderPage (reorder_sentences slug).

Each exercise has 6 or 7 idea nodes (sentences) to reorder.
CorrectOrder is always "1+2+3+4+5+6" or "1+2+3+4+5+6+7" — sequential.
Sentences are stored as correctOrder_fr and correctOrder_en JSON arrays.

Run from workspace root:
  python language-app/generate_reorder_csv.py
"""
import csv, os, json, io

INPUT  = os.path.join(os.path.dirname(__file__), '..', 'reorder-sentence.csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'public', 'mock-data', 'practice', 'reading', 'reorder.csv')

OUT_HEADER = [
    'ExerciseID', 'Level', 'LearningLang', 'KnownLang',
    'title_en', 'title_fr',
    'correctOrder_fr',  # JSON array of FR sentences in correct order
    'correctOrder_en',  # JSON array of EN sentences in correct order
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

    # Read raw to handle duplicate column names
    raw_reader = csv.reader(io.StringIO(''.join(lines[header_idx:])))
    headers = [h.strip() for h in next(raw_reader)]

    # Find column positions
    # FR nodes: first occurrence of IdeaNodes_X_FR
    # EN nodes: second occurrence of IdeaNodes_X_FR (after Passage Title_EN)
    title_fr_idx  = headers.index('Passage Title_FR')
    title_en_idx  = headers.index('Passage Title_EN')

    # FR node positions: IdeaNodes_1_FR...7_FR before Passage Title_EN
    fr_node_cols = [i for i, h in enumerate(headers) if h.startswith('IdeaNodes_') and i < title_en_idx]
    # EN node positions: IdeaNodes_1_FR...7_FR after Passage Title_EN
    en_node_cols = [i for i, h in enumerate(headers) if h.startswith('IdeaNodes_') and i > title_en_idx]

    for raw_row in raw_reader:
        if not raw_row or not raw_row[0].strip():
            continue
        eid = raw_row[0].strip()
        if not eid or eid.startswith(','):
            continue

        def get(idx, default=''):
            return raw_row[idx].strip() if idx < len(raw_row) else default

        level      = get(1) or 'B2'
        difficulty = get(2)
        ex_tag     = get(3)
        time_lim   = get(5) or '360'
        n_nodes    = int(get(6) or '6')
        title_fr   = get(title_fr_idx)
        title_en   = get(title_en_idx)

        sentences_fr = [get(i) for i in fr_node_cols[:n_nodes] if get(i)]
        sentences_en = [get(i) for i in en_node_cols[:n_nodes] if get(i)]

        if not sentences_fr:
            continue

        rows_out.append({
            'ExerciseID':      eid,
            'Level':           level,
            'LearningLang':    'fr',
            'KnownLang':       'en',
            'title_en':        title_en,
            'title_fr':        title_fr,
            'correctOrder_fr': json.dumps(sentences_fr, ensure_ascii=False),
            'correctOrder_en': json.dumps(sentences_en, ensure_ascii=False),
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
        import json as _j
        r = rows_out[0]
        print('Sample FR:', _j.loads(r['correctOrder_fr'])[:2])
        print('Sample EN:', _j.loads(r['correctOrder_en'])[:2])

if __name__ == '__main__':
    main()

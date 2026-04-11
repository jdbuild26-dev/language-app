"""
Converts the new highlight-text.csv format (multi-question per exercise)
into the flat one-row-per-question format used by the practice CSV loader.
Run from the workspace root:
  python language-app/generate_highlight_text_csv.py
"""
import csv, os

INPUT  = os.path.join(os.path.dirname(__file__), '..', 'highlight-text.csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'public', 'mock-data', 'practice', 'reading', 'highlight_text.csv')

OUT_HEADER = [
    'ExerciseID','Instruction_EN','Instruction_FR','Level',
    'title_en','title_fr','passage_en','passage_fr',
    'question_en','question_fr','question_number',
    'correct_answer_en','correct_answer_fr','acceptable_answer_texts',
    'timeLimitSeconds','minHighlightChars','maxHighlightChars','caseSensitive',
]

def find_header_row(path):
    with open(path, encoding='utf-8-sig') as f:
        for i, line in enumerate(f):
            low = line.lower()
            if 'exerciseid' in low or 'acceptableanswertexts' in low or 'minhighlightchars' in low:
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
            inst_en    = (row.get('Instructions_EN') or '').strip()
            inst_fr    = (row.get('Heading_FR') or '').strip()
            level      = (row.get('Level') or 'B1').strip()
            title_en   = (row.get('Passage Title_EN') or row.get('Heading_EN') or '').strip()
            title_fr   = (row.get('Passage Title_FR') or row.get('Heading_FR') or '').strip()
            passage_en = (row.get('Complete Paragraph_EN') or '').strip()
            passage_fr = (row.get('Complete Paragraph_FR') or '').strip()
            time_lim   = (row.get('TimeLimitSeconds') or '360').strip()
            min_ch     = (row.get('MinHighlightChars') or '20').strip()
            max_ch     = (row.get('MaxHighlightChars') or '160').strip()
            case_s     = (row.get('CaseSensitive') or 'FALSE').strip()
            acceptable = (row.get('AcceptableAnswerTexts') or '').strip()

            for q_num in range(1, 4):
                q_en  = (row.get(f'Question_{q_num}_EN') or '').strip()
                q_fr  = (row.get(f'Question_{q_num}_FR') or '').strip()
                ca_en = (row.get(f'Correct Answer_{q_num}_EN') or '').strip()
                ca_fr = (row.get(f'Correct Answer_{q_num}_FR') or '').strip()
                if not q_en and not q_fr:
                    continue
                rows_out.append({
                    'ExerciseID':             f'{eid}_Q{q_num}',
                    'Instruction_EN':         inst_en,
                    'Instruction_FR':         inst_fr,
                    'Level':                  level,
                    'title_en':               title_en,
                    'title_fr':               title_fr,
                    'passage_en':             passage_en,
                    'passage_fr':             passage_fr,
                    'question_en':            q_en,
                    'question_fr':            q_fr,
                    'question_number':        q_num,
                    'correct_answer_en':      ca_en,
                    'correct_answer_fr':      ca_fr,
                    'acceptable_answer_texts': acceptable or passage_en,
                    'timeLimitSeconds':       time_lim,
                    'minHighlightChars':      min_ch,
                    'maxHighlightChars':      max_ch,
                    'caseSensitive':          case_s,
                })

    with open(OUTPUT, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=OUT_HEADER)
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"Written {len(rows_out)} rows to {OUTPUT}")

if __name__ == '__main__':
    main()

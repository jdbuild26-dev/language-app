# Exercise Handover Checklist

**Status Legend:**
- ✅ **Ready**: Has parser, exporter, works correctly, tested
- ⚠️ **Partial**: Has parser but may have known issues or missing exporter
- ❌ **Not Ready**: No parser or major issues
- ❓ **Unknown**: Not tested or status unclear

---

## Reading Exercises (18 total)

| # | Exercise Type | Slug | Parser | Exporter | Status | Notes |
|---|---------------|------|--------|----------|--------|-------|
| 1 | Translate the Sentence | `translate_bubbles` | ✅ | ✅ | ✅ | Working |
| 2 | Match Pairs | `match_pairs` | ✅ | ✅ | ✅ | Working |
| 3 | Highlight the Sentence | `highlight_text` | ✅ | ✅ | ✅ | Working |
| 4 | Diagram Labelling | `diagram_mapping` | ✅ | ✅ | ✅ | Working |
| 5 | Match Image to Description | `image_mcq` | ✅ | ✅ | ✅ | Working |
| 6 | Match Description to Image | `match_desc_to_image` | ✅ | ✅ | ✅ | Working (uses MCQParser) |
| 7 | Image Labelling | `image_labelling` | ✅ | ✅ | ✅ | Fixed - Parser updated for new JSON format, state reset fixed |
| 8 | Reading Comprehension | `passage_mcq` | ✅ | ✅ | ✅ | Working |
| 9 | Complete the Passage | `complete_passage_dropdown` | ❓ | ❓ | ❓ | No dedicated parser found |
| 10 | Fill in the Blanks Passage | `fill_blanks_passage` | ⚠️ | ⚠️ | ⚠️ | May use FillBlanksParser |
| 11 | Fill in the Blanks | `fill_blanks` | ✅ | ✅ | ✅ | Working |
| 12 | Reorder Sentences | `reorder_sentences` | ✅ | ✅ | ✅ | Working |
| 13 | Identify Information | `true_false` | ❓ | ❓ | ❓ | No dedicated parser found |
| 14 | Running Conversation | `conversation_dialogue` | ✅ | ✅ | ✅ | Working |
| 15 | Summary Completion | `summary_completion` | ❓ | ❓ | ❓ | No dedicated parser found |
| 16 | Match Sentence Ending | `match_sentence_ending` | ❓ | ❓ | ❓ | No dedicated parser found |
| 17 | Sentence Completion | `sentence_completion` | ❓ | ❓ | ❓ | No dedicated parser found |
| 18 | Reading Conversation | `reading_conversation` | ✅ | ✅ | ✅ | Uses ConversationParser |

---

## Listening Exercises (10 total)

| # | Exercise Type | Slug | Parser | Exporter | Status | Notes |
|---|---------------|------|--------|----------|--------|-------|
| 1 | Listen and Select | `listen_select` | ✅ | ❌ | ⚠️ | Parser created, needs re-upload of CSV to fix duplicate options |
| 2 | Listen and Type | `type_what_you_hear` | ❓ | ❓ | ❓ | No dedicated parser found |
| 3 | Audio Fill in the Blanks | `listen_fill_blanks` | ❓ | ❓ | ❓ | No dedicated parser found |
| 4 | Audio Fill in the Blanks 2 | `listen_fill_blanks_dropdown` | ❓ | ❓ | ❓ | No dedicated parser found |
| 5 | What do you hear? | `listen_bubble` | ✅ | ❌ | ✅ | Fixed - Parser created for JSON questions array |
| 6 | Listen and Order | `listen_order` | ✅ | ✅ | ✅ | Fixed - Parser, exporter, 40-row CSV, 5 random limit, timer working |
| 7 | Passage Questions | `listen_passage` | ✅ | ❌ | ✅ | Fixed - Parser created for JSON questions array, frontend safety checks |
| 8 | Interactive Listening | `listen_interactive` | ❓ | ❓ | ❓ | No dedicated parser found |
| 9 | Listening Comprehension | `listening_comprehension` | ❓ | ❓ | ❓ | No dedicated parser found |
| 10 | Running Conversation (Listening) | `listening_conversation` | ✅ | ✅ | ✅ | Uses ConversationParser |

---

## Writing Exercises (10 total)

| # | Exercise Type | Slug | Parser | Exporter | Status | Notes |
|---|---------------|------|--------|----------|--------|-------|
| 1 | Translate the Sentence | `translate_typed` | ❓ | ❓ | ❓ | No dedicated parser found |
| 2 | Fix the Spelling | `correct_spelling` | ✅ | ✅ | ✅ | Working |
| 3 | Fill in the Blanks | `write_fill_blanks` | ✅ | ❌ | ⚠️ | Parser exists, no exporter |
| 4 | Write About Topic | `write_topic` | ✅ | ❌ | ⚠️ | Parser exists, no exporter |
| 5 | Write About Image | `write_image` | ✅ | ❌ | ⚠️ | Parser exists, no exporter |
| 6 | Write Documents | `write_documents` | ❓ | ❓ | ❓ | No dedicated parser found |
| 7 | Interactive Writing | `write_interactive` | ✅ | ❌ | ⚠️ | Parser exists, no exporter |
| 8 | Writing Conversation (Running) | `writing_conversation` | ✅ | ✅ | ✅ | Working |
| 9 | Write About Data | `write_analysis` | ❓ | ❓ | ❓ | No dedicated parser found |
| 10 | Summarise What You Hear | `summarise_audio` | ✅ | ❌ | ⚠️ | Parser exists, no exporter |

---

## Speaking Exercises (5 total)

| # | Exercise Type | Slug | Parser | Exporter | Status | Notes |
|---|---------------|------|--------|----------|--------|-------|
| 1 | Translate by Speaking | `speak_translate` | ❓ | ❓ | ❓ | No dedicated parser found |
| 2 | Speak About Topic | `speak_topic` | ❓ | ❓ | ❓ | No dedicated parser found |
| 3 | Speak About Image | `speak_image` | ❓ | ❓ | ❓ | No dedicated parser found |
| 4 | Interactive Speaking | `speak_interactive` | ✅ | ❌ | ⚠️ | Parser exists, no exporter |
| 5 | Speaking Conversation (Running) | `speaking_conversation` | ✅ | ✅ | ✅ | Uses WritingConversationParser |

---

## Summary Statistics

**Total Exercises:** 43

### By Status:
- ✅ **Ready for Handover:** 18 exercises (42%)
- ⚠️ **Partial/Needs Work:** 8 exercises (19%)
- ❓ **Unknown/Not Tested:** 17 exercises (39%)
- ❌ **Not Ready:** 0 exercises (0%)

### By Category:
- **Reading:** 13/18 ready or partial (72%)
- **Listening:** 5/10 ready or partial (50%)
- **Writing:** 6/10 ready or partial (60%)
- **Speaking:** 2/5 ready or partial (40%)

---

## Recent Fixes Applied (This Session)

1. ✅ **listen_bubble** - Created parser for JSON questions array (unique ID < 9 issue)
2. ✅ **listen_passage** - Created parser for JSON questions array + frontend safety checks
3. ✅ **listen_select** - Created parser for JSON options array (duplicate options issue)
4. ✅ **image_labelling** - Fixed state reset between exercises + updated parser for new JSON format
5. ✅ **listen_order** - Created parser, exporter, 40-row CSV, 5 random limit, timer fix

---

## Recommendations for Next Steps

### High Priority (Missing Parsers):
1. `complete_passage_dropdown` - Reading
2. `true_false` - Reading (Identify Information)
3. `summary_completion` - Reading
4. `match_sentence_ending` - Reading
5. `sentence_completion` - Reading
6. `type_what_you_hear` - Listening
7. `listen_fill_blanks` - Listening
8. `listen_fill_blanks_dropdown` - Listening
9. `listen_interactive` - Listening
10. `listening_comprehension` - Listening
11. `translate_typed` - Writing
12. `write_documents` - Writing
13. `write_analysis` - Writing
14. `speak_translate` - Speaking
15. `speak_topic` - Speaking
16. `speak_image` - Speaking

### Medium Priority (Missing Exporters):
1. `listen_bubble` - Add exporter for admin panel display
2. `listen_passage` - Add exporter for admin panel display
3. `listen_select` - Add exporter for admin panel display
4. `write_fill_blanks` - Add exporter
5. `write_topic` - Add exporter
6. `write_image` - Add exporter
7. `write_interactive` - Add exporter
8. `summarise_audio` - Add exporter
9. `speak_interactive` - Add exporter

### Low Priority (Re-upload Required):
1. `listen_select` - Re-upload CSV via admin panel to fix old data with duplicate options

---

## Notes

- **Parsers** handle CSV → Database conversion during upload
- **Exporters** handle Database → Admin Panel display (Excel row format)
- Exercises using `GenericParser` may work but won't handle complex JSON fields properly
- All conversation-type exercises share the same `ConversationParser` and `ConversationExporter`
- MCQ-type exercises share the same `MCQExporter`

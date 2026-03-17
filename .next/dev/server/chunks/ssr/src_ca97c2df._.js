module.exports = [
"[project]/src/services/vocabularyApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkApiHealth",
    ()=>checkApiHealth,
    "createClass",
    ()=>createClass,
    "createClassAssignment",
    ()=>createClassAssignment,
    "deleteClass",
    ()=>deleteClass,
    "deleteRelationship",
    ()=>deleteRelationship,
    "fetchAllTopics",
    ()=>fetchAllTopics,
    "fetchAvailableCategories",
    ()=>fetchAvailableCategories,
    "fetchAvailableLevels",
    ()=>fetchAvailableLevels,
    "fetchAvailableQuestionTypes",
    ()=>fetchAvailableQuestionTypes,
    "fetchCategoriesByLevel",
    ()=>fetchCategoriesByLevel,
    "fetchClassDetails",
    ()=>fetchClassDetails,
    "fetchClasses",
    ()=>fetchClasses,
    "fetchCompletePassageData",
    ()=>fetchCompletePassageData,
    "fetchDictationImageData",
    ()=>fetchDictationImageData,
    "fetchFriends",
    ()=>fetchFriends,
    "fetchLearningQueue",
    ()=>fetchLearningQueue,
    "fetchLessonWords",
    ()=>fetchLessonWords,
    "fetchMatchPairsData",
    ()=>fetchMatchPairsData,
    "fetchPracticeQuestions",
    ()=>fetchPracticeQuestions,
    "fetchRepeatSentenceData",
    ()=>fetchRepeatSentenceData,
    "fetchSrsDue",
    ()=>fetchSrsDue,
    "fetchStudentClasses",
    ()=>fetchStudentClasses,
    "fetchStudentTeachers",
    ()=>fetchStudentTeachers,
    "fetchSummaryCompletionData",
    ()=>fetchSummaryCompletionData,
    "fetchTeacherStudents",
    ()=>fetchTeacherStudents,
    "fetchTeachers",
    ()=>fetchTeachers,
    "fetchVocabulary",
    ()=>fetchVocabulary,
    "fetchWhatDoYouSeeData",
    ()=>fetchWhatDoYouSeeData,
    "fetchWriteAnalysisData",
    ()=>fetchWriteAnalysisData,
    "fetchWritingDocuments",
    ()=>fetchWritingDocuments,
    "linkStudentToTeacher",
    ()=>linkStudentToTeacher,
    "rateSrsCard",
    ()=>rateSrsCard,
    "requestConnection",
    ()=>requestConnection,
    "saveUserProgress",
    ()=>saveUserProgress,
    "searchProfiles",
    ()=>searchProfiles,
    "updateClass",
    ()=>updateClass,
    "updateRelationshipStatus",
    ()=>updateRelationshipStatus
]);
const API_BASE_URL = ("TURBOPACK compile-time value", "https://language-backend-v8sy.onrender.com") || "https://language-api-mine.onrender.com";
// Toggle to force CSV mock data instead of API calls
const USE_MOCK_CSV_DATA = process.env.NEXT_PUBLIC_USE_MOCK_CSV_DATA === "true" || ("TURBOPACK compile-time value", "undefined") !== "undefined" && localStorage.getItem("USE_MOCK_CSV_DATA") === "true";
/**
 * Fetch vocabulary with optional filtering
 */ const CSV_TRANSFORMERS = {
    audio_to_audio: (row)=>({
            external_id: row.ExerciseID || `audio_to_audio_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Audio: row["Audio"] ? row["Audio"].startsWith("[") || row["Audio"].startsWith("{") ? JSON.parse(row["Audio"]) : row["Audio"] : "",
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option1_EN: row["Option1_EN"] ? row["Option1_EN"].startsWith("[") || row["Option1_EN"].startsWith("{") ? JSON.parse(row["Option1_EN"]) : row["Option1_EN"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option2_EN: row["Option2_EN"] ? row["Option2_EN"].startsWith("[") || row["Option2_EN"].startsWith("{") ? JSON.parse(row["Option2_EN"]) : row["Option2_EN"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option3_EN: row["Option3_EN"] ? row["Option3_EN"].startsWith("[") || row["Option3_EN"].startsWith("{") ? JSON.parse(row["Option3_EN"]) : row["Option3_EN"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                Option4_EN: row["Option4_EN"] ? row["Option4_EN"].startsWith("[") || row["Option4_EN"].startsWith("{") ? JSON.parse(row["Option4_EN"]) : row["Option4_EN"] : "",
                CorrectAnswer: row["CorrectAnswer"] ? row["CorrectAnswer"].startsWith("[") || row["CorrectAnswer"].startsWith("{") ? JSON.parse(row["CorrectAnswer"]) : row["CorrectAnswer"] : "",
                CompleteSentence: row["CompleteSentence"] ? row["CompleteSentence"].startsWith("[") || row["CompleteSentence"].startsWith("{") ? JSON.parse(row["CompleteSentence"]) : row["CompleteSentence"] : "",
                SentenceWithBlank: row["SentenceWithBlank"] ? row["SentenceWithBlank"].startsWith("[") || row["SentenceWithBlank"].startsWith("{") ? JSON.parse(row["SentenceWithBlank"]) : row["SentenceWithBlank"] : ""
            },
            evaluation: {
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    "B5_Fill blanks_Audio": (row)=>({
            external_id: row.ExerciseID || `B5_Fill blanks_Audio_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Audio: row["Audio"] ? row["Audio"].startsWith("[") || row["Audio"].startsWith("{") ? JSON.parse(row["Audio"]) : row["Audio"] : "",
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                CorrectAnswer: row["CorrectAnswer"] ? row["CorrectAnswer"].startsWith("[") || row["CorrectAnswer"].startsWith("{") ? JSON.parse(row["CorrectAnswer"]) : row["CorrectAnswer"] : "",
                CompleteSentence: row["CompleteSentence"] ? row["CompleteSentence"].startsWith("[") || row["CompleteSentence"].startsWith("{") ? JSON.parse(row["CompleteSentence"]) : row["CompleteSentence"] : "",
                SentenceWithBlank: row["SentenceWithBlank"] ? row["SentenceWithBlank"].startsWith("[") || row["SentenceWithBlank"].startsWith("{") ? JSON.parse(row["SentenceWithBlank"]) : row["SentenceWithBlank"] : ""
            },
            evaluation: {
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    b5_fill_blanks_audio: (row)=>({
            external_id: row.ExerciseID || `b5_fill_blanks_audio_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Audio: row["Audio"] ? row["Audio"].startsWith("[") || row["Audio"].startsWith("{") ? JSON.parse(row["Audio"]) : row["Audio"] : "",
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                CorrectAnswer: row["CorrectAnswer"] ? row["CorrectAnswer"].startsWith("[") || row["CorrectAnswer"].startsWith("{") ? JSON.parse(row["CorrectAnswer"]) : row["CorrectAnswer"] : "",
                CompleteSentence: row["CompleteSentence"] ? row["CompleteSentence"].startsWith("[") || row["CompleteSentence"].startsWith("{") ? JSON.parse(row["CompleteSentence"]) : row["CompleteSentence"] : "",
                SentenceWithBlank: row["SentenceWithBlank"] ? row["SentenceWithBlank"].startsWith("[") || row["SentenceWithBlank"].startsWith("{") ? JSON.parse(row["SentenceWithBlank"]) : row["SentenceWithBlank"] : ""
            },
            evaluation: {
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    choose_options: (row)=>({
            external_id: row.ExerciseID || `choose_options_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option1_EN: row["Option1_EN"] ? row["Option1_EN"].startsWith("[") || row["Option1_EN"].startsWith("{") ? JSON.parse(row["Option1_EN"]) : row["Option1_EN"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option2_EN: row["Option2_EN"] ? row["Option2_EN"].startsWith("[") || row["Option2_EN"].startsWith("{") ? JSON.parse(row["Option2_EN"]) : row["Option2_EN"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option3_EN: row["Option3_EN"] ? row["Option3_EN"].startsWith("[") || row["Option3_EN"].startsWith("{") ? JSON.parse(row["Option3_EN"]) : row["Option3_EN"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                Option4_EN: row["Option4_EN"] ? row["Option4_EN"].startsWith("[") || row["Option4_EN"].startsWith("{") ? JSON.parse(row["Option4_EN"]) : row["Option4_EN"] : "",
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                Question: row["Question"] ? row["Question"].startsWith("[") || row["Question"].startsWith("{") ? JSON.parse(row["Question"]) : row["Question"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                correctAnswer: row["correctAnswer"] ? row["correctAnswer"].startsWith("[") || row["correctAnswer"].startsWith("{") ? JSON.parse(row["correctAnswer"]) : row["correctAnswer"] : "",
                ShuffleOptions: row["ShuffleOptions"] ? row["ShuffleOptions"].startsWith("[") || row["ShuffleOptions"].startsWith("{") ? JSON.parse(row["ShuffleOptions"]) : row["ShuffleOptions"] : "",
                "Complete sentence": row["Complete sentence"] ? row["Complete sentence"].startsWith("[") || row["Complete sentence"].startsWith("{") ? JSON.parse(row["Complete sentence"]) : row["Complete sentence"] : "",
                CorrectOptionIndex: row["CorrectOptionIndex"] ? row["CorrectOptionIndex"].startsWith("[") || row["CorrectOptionIndex"].startsWith("{") ? JSON.parse(row["CorrectOptionIndex"]) : row["CorrectOptionIndex"] : ""
            },
            evaluation: {
                BlankIndex: row["eval_BlankIndex"] ? row["eval_BlankIndex"].startsWith("[") || row["eval_BlankIndex"].startsWith("{") ? JSON.parse(row["eval_BlankIndex"]) : row["eval_BlankIndex"] : "",
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : "",
                "Correct Explanation_EN": row["eval_Correct Explanation_EN"] ? row["eval_Correct Explanation_EN"].startsWith("[") || row["eval_Correct Explanation_EN"].startsWith("{") ? JSON.parse(row["eval_Correct Explanation_EN"]) : row["eval_Correct Explanation_EN"] : ""
            }
        }),
    complete_passage_dropdown: (row)=>({
            external_id: row.ExerciseID || `complete_passage_dropdown_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                fullText: row["fullText"] ? row["fullText"].startsWith("[") || row["fullText"].startsWith("{") ? JSON.parse(row["fullText"]) : row["fullText"] : "",
                passageSegments: row["passageSegments"] ? row["passageSegments"].startsWith("[") || row["passageSegments"].startsWith("{") ? JSON.parse(row["passageSegments"]) : row["passageSegments"] : ""
            },
            evaluation: {
                blanksData: row["eval_blanksData"] ? row["eval_blanksData"].startsWith("[") || row["eval_blanksData"].startsWith("{") ? JSON.parse(row["eval_blanksData"]) : row["eval_blanksData"] : ""
            }
        }),
    correct_spelling: (row)=>({
            external_id: row.ExerciseID || `correct_spelling_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                hint: row["hint"] ? row["hint"].startsWith("[") || row["hint"].startsWith("{") ? JSON.parse(row["hint"]) : row["hint"] : "",
                correctText: row["correctText"] ? row["correctText"].startsWith("[") || row["correctText"].startsWith("{") ? JSON.parse(row["correctText"]) : row["correctText"] : "",
                incorrectText: row["incorrectText"] ? row["incorrectText"].startsWith("[") || row["incorrectText"].startsWith("{") ? JSON.parse(row["incorrectText"]) : row["incorrectText"] : "",
                englishTranslation: row["englishTranslation"] ? row["englishTranslation"].startsWith("[") || row["englishTranslation"].startsWith("{") ? JSON.parse(row["englishTranslation"]) : row["englishTranslation"] : ""
            },
            evaluation: {
                errorCount: row["eval_errorCount"] ? row["eval_errorCount"].startsWith("[") || row["eval_errorCount"].startsWith("{") ? JSON.parse(row["eval_errorCount"]) : row["eval_errorCount"] : "",
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    diagram_mapping: (row)=>({
            external_id: row.ExerciseID || `diagram_mapping_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : "",
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                imagePath: row["imagePath"] ? row["imagePath"].startsWith("[") || row["imagePath"].startsWith("{") ? JSON.parse(row["imagePath"]) : row["imagePath"] : "",
                questions: row["questions"] ? row["questions"].startsWith("[") || row["questions"].startsWith("{") ? JSON.parse(row["questions"]) : row["questions"] : "",
                paragraphs: row["paragraphs"] ? row["paragraphs"].startsWith("[") || row["paragraphs"].startsWith("{") ? JSON.parse(row["paragraphs"]) : row["paragraphs"] : ""
            }
        }),
    dictation_image: (row)=>({
            external_id: row.ExerciseID || `dictation_image_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Image: row["Image"] ? row["Image"].startsWith("[") || row["Image"].startsWith("{") ? JSON.parse(row["Image"]) : row["Image"] : "",
                Question_EN: row["Question_EN"] ? row["Question_EN"].startsWith("[") || row["Question_EN"].startsWith("{") ? JSON.parse(row["Question_EN"]) : row["Question_EN"] : "",
                Question_FR: row["Question_FR"] ? row["Question_FR"].startsWith("[") || row["Question_FR"].startsWith("{") ? JSON.parse(row["Question_FR"]) : row["Question_FR"] : "",
                CaseSensitive: row["CaseSensitive"] ? row["CaseSensitive"].startsWith("[") || row["CaseSensitive"].startsWith("{") ? JSON.parse(row["CaseSensitive"]) : row["CaseSensitive"] : "",
                MaxCharacters: row["MaxCharacters"] ? row["MaxCharacters"].startsWith("[") || row["MaxCharacters"].startsWith("{") ? JSON.parse(row["MaxCharacters"]) : row["MaxCharacters"] : "",
                MinCharacters: row["MinCharacters"] ? row["MinCharacters"].startsWith("[") || row["MinCharacters"].startsWith("{") ? JSON.parse(row["MinCharacters"]) : row["MinCharacters"] : ""
            },
            evaluation: {
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : ""
            }
        }),
    fill_blanks: (row)=>({
            external_id: row.ExerciseID || `fill_blanks_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                wordBank: row["wordBank"] ? row["wordBank"].startsWith("[") || row["wordBank"].startsWith("{") ? JSON.parse(row["wordBank"]) : row["wordBank"] : "",
                sentenceWithBlank: row["sentenceWithBlank"] ? row["sentenceWithBlank"].startsWith("[") || row["sentenceWithBlank"].startsWith("{") ? JSON.parse(row["sentenceWithBlank"]) : row["sentenceWithBlank"] : "",
                englishTranslation: row["englishTranslation"] ? row["englishTranslation"].startsWith("[") || row["englishTranslation"].startsWith("{") ? JSON.parse(row["englishTranslation"]) : row["englishTranslation"] : ""
            },
            evaluation: {
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    fill_blanks_options: (row)=>({
            external_id: row.ExerciseID || `fill_blanks_options_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : "",
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    fill_blank_typed: (row)=>({
            external_id: row.ExerciseID || `fill_blank_typed_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Question: row["Question"] ? row["Question"].startsWith("[") || row["Question"].startsWith("{") ? JSON.parse(row["Question"]) : row["Question"] : "",
                ShuffleOptions: row["ShuffleOptions"] ? row["ShuffleOptions"].startsWith("[") || row["ShuffleOptions"].startsWith("{") ? JSON.parse(row["ShuffleOptions"]) : row["ShuffleOptions"] : "",
                sentenceWithBlank: row["sentenceWithBlank"] ? row["sentenceWithBlank"].startsWith("[") || row["sentenceWithBlank"].startsWith("{") ? JSON.parse(row["sentenceWithBlank"]) : row["sentenceWithBlank"] : ""
            },
            evaluation: {
                BlankIndex: row["eval_BlankIndex"] ? row["eval_BlankIndex"].startsWith("[") || row["eval_BlankIndex"].startsWith("{") ? JSON.parse(row["eval_BlankIndex"]) : row["eval_BlankIndex"] : "",
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : "",
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : "",
                CorrectExplanation_EN: row["eval_CorrectExplanation_EN"] ? row["eval_CorrectExplanation_EN"].startsWith("[") || row["eval_CorrectExplanation_EN"].startsWith("{") ? JSON.parse(row["eval_CorrectExplanation_EN"]) : row["eval_CorrectExplanation_EN"] : ""
            }
        }),
    four_options: (row)=>({
            external_id: row.ExerciseID || `four_options_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : "",
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    grammar_find_error: (row)=>({
            external_id: row.ExerciseID || `grammar_find_error_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                correct_text: row["correct_text"] ? row["correct_text"].startsWith("[") || row["correct_text"].startsWith("{") ? JSON.parse(row["correct_text"]) : row["correct_text"] : "",
                sentence_parts: row["sentence_parts"] ? row["sentence_parts"].startsWith("[") || row["sentence_parts"].startsWith("{") ? JSON.parse(row["sentence_parts"]) : row["sentence_parts"] : ""
            },
            evaluation: {
                error_index: row["eval_error_index"] ? row["eval_error_index"].startsWith("[") || row["eval_error_index"].startsWith("{") ? JSON.parse(row["eval_error_index"]) : row["eval_error_index"] : ""
            }
        }),
    grammar_reorder: (row)=>({
            external_id: row.ExerciseID || `grammar_reorder_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : ""
            }
        }),
    grammar_rewrite: (row)=>({
            external_id: row.ExerciseID || `grammar_rewrite_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                answer: row["eval_answer"] ? row["eval_answer"].startsWith("[") || row["eval_answer"].startsWith("{") ? JSON.parse(row["eval_answer"]) : row["eval_answer"] : ""
            }
        }),
    grammar_transformation: (row)=>({
            external_id: row.ExerciseID || `grammar_transformation_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                answer: row["eval_answer"] ? row["eval_answer"].startsWith("[") || row["eval_answer"].startsWith("{") ? JSON.parse(row["eval_answer"]) : row["eval_answer"] : "",
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : ""
            }
        }),
    group_words: (row)=>({
            external_id: row.ExerciseID || `group_words_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                theme: row["theme"] ? row["theme"].startsWith("[") || row["theme"].startsWith("{") ? JSON.parse(row["theme"]) : row["theme"] : "",
                otherWords: row["otherWords"] ? row["otherWords"].startsWith("[") || row["otherWords"].startsWith("{") ? JSON.parse(row["otherWords"]) : row["otherWords"] : "",
                explanation: row["explanation"] ? row["explanation"].startsWith("[") || row["explanation"].startsWith("{") ? JSON.parse(row["explanation"]) : row["explanation"] : "",
                correctGroup: row["correctGroup"] ? row["correctGroup"].startsWith("[") || row["correctGroup"].startsWith("{") ? JSON.parse(row["correctGroup"]) : row["correctGroup"] : "",
                correctGroup_EN: row["correctGroup_EN"] ? row["correctGroup_EN"].startsWith("[") || row["correctGroup_EN"].startsWith("{") ? JSON.parse(row["correctGroup_EN"]) : row["correctGroup_EN"] : "",
                otherWords_EN: row["otherWords_EN"] ? row["otherWords_EN"].startsWith("[") || row["otherWords_EN"].startsWith("{") ? JSON.parse(row["otherWords_EN"]) : row["otherWords_EN"] : ""
            },
            evaluation: {
                correctGroup: row["eval_correctGroup"] ? row["eval_correctGroup"].startsWith("[") || row["eval_correctGroup"].startsWith("{") ? JSON.parse(row["eval_correctGroup"]) : row["eval_correctGroup"] : ""
            }
        }),
    highlight_text: (row)=>({
            external_id: row.ExerciseID || `highlight_text_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : "",
                passage: row["passage"] ? row["passage"].startsWith("[") || row["passage"].startsWith("{") ? JSON.parse(row["passage"]) : row["passage"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                questionTitle: row["questionTitle"] ? row["questionTitle"].startsWith("[") || row["questionTitle"].startsWith("{") ? JSON.parse(row["questionTitle"]) : row["questionTitle"] : ""
            },
            evaluation: {
                requiredCore: row["eval_requiredCore"] ? row["eval_requiredCore"].startsWith("[") || row["eval_requiredCore"].startsWith("{") ? JSON.parse(row["eval_requiredCore"]) : row["eval_requiredCore"] : "",
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : "",
                acceptableBoundary: row["eval_acceptableBoundary"] ? row["eval_acceptableBoundary"].startsWith("[") || row["eval_acceptableBoundary"].startsWith("{") ? JSON.parse(row["eval_acceptableBoundary"]) : row["eval_acceptableBoundary"] : ""
            }
        }),
    highlight_word: (row)=>({
            external_id: row.ExerciseID || `highlight_word_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                passage: row["passage"] ? row["passage"].startsWith("[") || row["passage"].startsWith("{") ? JSON.parse(row["passage"]) : row["passage"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : ""
            },
            evaluation: {
                correctWord: row["eval_correctWord"] ? row["eval_correctWord"].startsWith("[") || row["eval_correctWord"].startsWith("{") ? JSON.parse(row["eval_correctWord"]) : row["eval_correctWord"] : ""
            }
        }),
    image_labelling: (row)=>({
            external_id: row.ExerciseID || `image_labelling_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                image: row["image"] ? row["image"].startsWith("[") || row["image"].startsWith("{") ? JSON.parse(row["image"]) : row["image"] : "",
                items: row["items"] ? row["items"].startsWith("[") || row["items"].startsWith("{") ? JSON.parse(row["items"]) : row["items"] : "",
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : ""
            }
        }),
    image_mcq: (row)=>({
            external_id: row.ExerciseID || `image_mcq_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                imageAlt: row["imageAlt"] ? row["imageAlt"].startsWith("[") || row["imageAlt"].startsWith("{") ? JSON.parse(row["imageAlt"]) : row["imageAlt"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                imageEmoji: row["imageEmoji"] ? row["imageEmoji"].startsWith("[") || row["imageEmoji"].startsWith("{") ? JSON.parse(row["imageEmoji"]) : row["imageEmoji"] : "",
                englishOptions: row["englishOptions"] ? row["englishOptions"].startsWith("[") || row["englishOptions"].startsWith("{") ? JSON.parse(row["englishOptions"]) : row["englishOptions"] : ""
            },
            evaluation: {
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    is_french_word: (row)=>({
            external_id: row.ExerciseID || `is_french_word_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                word: row["word"] ? row["word"].startsWith("[") || row["word"].startsWith("{") ? JSON.parse(row["word"]) : row["word"] : "",
                isFrench: row["isFrench"] ? row["isFrench"].startsWith("[") || row["isFrench"].startsWith("{") ? JSON.parse(row["isFrench"]) : row["isFrench"] : "",
                correctAnswer: row["correctAnswer"] ? row["correctAnswer"].startsWith("[") || row["correctAnswer"].startsWith("{") ? JSON.parse(row["correctAnswer"]) : row["correctAnswer"] : ""
            },
            evaluation: {
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    listening_conversation: (row)=>({
            external_id: row.ExerciseID || `listening_conversation_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : "",
                scenario: row["scenario"] ? row["scenario"].startsWith("[") || row["scenario"].startsWith("{") ? JSON.parse(row["scenario"]) : row["scenario"] : "",
                exchanges: row["exchanges"] ? row["exchanges"].startsWith("[") || row["exchanges"].startsWith("{") ? JSON.parse(row["exchanges"]) : row["exchanges"] : ""
            }
        }),
    listen_bubble: (row)=>({
            external_id: row.ExerciseID || `listen_bubble_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : "",
                audioText: row["audioText"] ? row["audioText"].startsWith("[") || row["audioText"].startsWith("{") ? JSON.parse(row["audioText"]) : row["audioText"] : "",
                translation: row["translation"] ? row["translation"].startsWith("[") || row["translation"].startsWith("{") ? JSON.parse(row["translation"]) : row["translation"] : ""
            }
        }),
    listen_fill_blanks: (row)=>({
            external_id: row.ExerciseID || `listen_fill_blanks_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                blanks: row["blanks"] ? row["blanks"].startsWith("[") || row["blanks"].startsWith("{") ? JSON.parse(row["blanks"]) : row["blanks"] : "",
                audioText: row["audioText"] ? row["audioText"].startsWith("[") || row["audioText"].startsWith("{") ? JSON.parse(row["audioText"]) : row["audioText"] : "",
                displayParts: row["displayParts"] ? row["displayParts"].startsWith("[") || row["displayParts"].startsWith("{") ? JSON.parse(row["displayParts"]) : row["displayParts"] : ""
            }
        }),
    listen_interactive: (row)=>({
            external_id: row.ExerciseID || `listen_interactive_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                context: row["context"] ? row["context"].startsWith("[") || row["context"].startsWith("{") ? JSON.parse(row["context"]) : row["context"] : "",
                exchanges: row["exchanges"] ? row["exchanges"].startsWith("[") || row["exchanges"].startsWith("{") ? JSON.parse(row["exchanges"]) : row["exchanges"] : "",
                timeLimitSeconds: row["timeLimitSeconds"] ? row["timeLimitSeconds"].startsWith("[") || row["timeLimitSeconds"].startsWith("{") ? JSON.parse(row["timeLimitSeconds"]) : row["timeLimitSeconds"] : ""
            }
        }),
    listen_order: (row)=>({
            external_id: row.ExerciseID || `listen_order_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                correctOrder: row["correctOrder"] ? row["correctOrder"].startsWith("[") || row["correctOrder"].startsWith("{") ? JSON.parse(row["correctOrder"]) : row["correctOrder"] : ""
            }
        }),
    listen_passage: (row)=>({
            external_id: row.ExerciseID || `listen_passage_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                questions: row["questions"] ? row["questions"].startsWith("[") || row["questions"].startsWith("{") ? JSON.parse(row["questions"]) : row["questions"] : "",
                passageText: row["passageText"] ? row["passageText"].startsWith("[") || row["passageText"].startsWith("{") ? JSON.parse(row["passageText"]) : row["passageText"] : ""
            }
        }),
    listen_phonetics: (row)=>({
            external_id: row.ExerciseID || `listen_phonetics_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Audio: row["Audio"] ? row["Audio"].startsWith("[") || row["Audio"].startsWith("{") ? JSON.parse(row["Audio"]) : row["Audio"] : "",
                audio: row["audio"] ? row["audio"].startsWith("[") || row["audio"].startsWith("{") ? JSON.parse(row["audio"]) : row["audio"] : "",
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                ShuffleOptions: row["ShuffleOptions"] ? row["ShuffleOptions"].startsWith("[") || row["ShuffleOptions"].startsWith("{") ? JSON.parse(row["ShuffleOptions"]) : row["ShuffleOptions"] : "",
                CorrectOptionIndex: row["CorrectOptionIndex"] ? row["CorrectOptionIndex"].startsWith("[") || row["CorrectOptionIndex"].startsWith("{") ? JSON.parse(row["CorrectOptionIndex"]) : row["CorrectOptionIndex"] : ""
            },
            evaluation: {
                BlankIndex: row["eval_BlankIndex"] ? row["eval_BlankIndex"].startsWith("[") || row["eval_BlankIndex"].startsWith("{") ? JSON.parse(row["eval_BlankIndex"]) : row["eval_BlankIndex"] : "",
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : "",
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : "",
                "Correct Explanation_EN": row["eval_Correct Explanation_EN"] ? row["eval_Correct Explanation_EN"].startsWith("[") || row["eval_Correct Explanation_EN"].startsWith("{") ? JSON.parse(row["eval_Correct Explanation_EN"]) : row["eval_Correct Explanation_EN"] : ""
            }
        }),
    listen_select: (row)=>({
            external_id: row.ExerciseID || `listen_select_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || ""
        }),
    listen_type: (row)=>({
            external_id: row.ExerciseID || `listen_type_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                hint: row["hint"] ? row["hint"].startsWith("[") || row["hint"].startsWith("{") ? JSON.parse(row["hint"]) : row["hint"] : "",
                audioText: row["audioText"] ? row["audioText"].startsWith("[") || row["audioText"].startsWith("{") ? JSON.parse(row["audioText"]) : row["audioText"] : "",
                englishText: row["englishText"] ? row["englishText"].startsWith("[") || row["englishText"].startsWith("{") ? JSON.parse(row["englishText"]) : row["englishText"] : ""
            }
        }),
    match_desc_game: (row)=>({
            external_id: row.ExerciseID || `match_desc_game_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                images: row["images"] ? row["images"].startsWith("[") || row["images"].startsWith("{") ? JSON.parse(row["images"]) : row["images"] : "",
                description: row["description"] ? row["description"].startsWith("[") || row["description"].startsWith("{") ? JSON.parse(row["description"]) : row["description"] : ""
            }
        }),
    match_pairs: (row)=>({
            external_id: row.ExerciseID || `match_pairs_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                pairs: row["pairs"] ? row["pairs"].startsWith("[") || row["pairs"].startsWith("{") ? JSON.parse(row["pairs"]) : row["pairs"] : "",
                pairMode: row["pairMode"] ? row["pairMode"].startsWith("[") || row["pairMode"].startsWith("{") ? JSON.parse(row["pairMode"]) : row["pairMode"] : ""
            }
        }),
    match_sentence_ending: (row)=>({
            external_id: row.ExerciseID || `match_sentence_ending_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                questions: row["questions"] ? row["questions"].startsWith("[") || row["questions"].startsWith("{") ? JSON.parse(row["questions"]) : row["questions"] : "",
                passageTitle: row["passageTitle"] ? row["passageTitle"].startsWith("[") || row["passageTitle"].startsWith("{") ? JSON.parse(row["passageTitle"]) : row["passageTitle"] : "",
                passageContent: row["passageContent"] ? row["passageContent"].startsWith("[") || row["passageContent"].startsWith("{") ? JSON.parse(row["passageContent"]) : row["passageContent"] : "",
                passageSubtitle: row["passageSubtitle"] ? row["passageSubtitle"].startsWith("[") || row["passageSubtitle"].startsWith("{") ? JSON.parse(row["passageSubtitle"]) : row["passageSubtitle"] : ""
            }
        }),
    odd_one_out: (row)=>({
            external_id: row.ExerciseID || `odd_one_out_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                words: row["words"] ? row["words"].startsWith("[") || row["words"].startsWith("{") ? JSON.parse(row["words"]) : row["words"] : "",
                Option1_EN: row["Option1_EN"] ? row["Option1_EN"].startsWith("[") || row["Option1_EN"].startsWith("{") ? JSON.parse(row["Option1_EN"]) : row["Option1_EN"] : "",
                Option2_EN: row["Option2_EN"] ? row["Option2_EN"].startsWith("[") || row["Option2_EN"].startsWith("{") ? JSON.parse(row["Option2_EN"]) : row["Option2_EN"] : "",
                Option3_EN: row["Option3_EN"] ? row["Option3_EN"].startsWith("[") || row["Option3_EN"].startsWith("{") ? JSON.parse(row["Option3_EN"]) : row["Option3_EN"] : "",
                Option4_EN: row["Option4_EN"] ? row["Option4_EN"].startsWith("[") || row["Option4_EN"].startsWith("{") ? JSON.parse(row["Option4_EN"]) : row["Option4_EN"] : "",
                reason: row["reason"] ? row["reason"].startsWith("[") || row["reason"].startsWith("{") ? JSON.parse(row["reason"]) : row["reason"] : "",
                correctAnswer: row["correctAnswer"] ? row["correctAnswer"].startsWith("[") || row["correctAnswer"].startsWith("{") ? JSON.parse(row["correctAnswer"]) : row["correctAnswer"] : ""
            },
            evaluation: {
                reason: row["eval_reason"] ? row["eval_reason"].startsWith("[") || row["eval_reason"].startsWith("{") ? JSON.parse(row["eval_reason"]) : row["eval_reason"] : "",
                correctAnswer: row["eval_correctAnswer"] ? row["eval_correctAnswer"].startsWith("[") || row["eval_correctAnswer"].startsWith("{") ? JSON.parse(row["eval_correctAnswer"]) : row["eval_correctAnswer"] : ""
            }
        }),
    odd_one_out_fr: (row)=>({
            external_id: row.ExerciseID || `odd_one_out_fr_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                id: row["id"] ? row["id"].startsWith("[") || row["id"].startsWith("{") ? JSON.parse(row["id"]) : row["id"] : "",
                words: row["words"] ? row["words"].startsWith("[") || row["words"].startsWith("{") ? JSON.parse(row["words"]) : row["words"] : "",
                correctAnswer: row["correctAnswer"] ? row["correctAnswer"].startsWith("[") || row["correctAnswer"].startsWith("{") ? JSON.parse(row["correctAnswer"]) : row["correctAnswer"] : "",
                reason: row["reason"] ? row["reason"].startsWith("[") || row["reason"].startsWith("{") ? JSON.parse(row["reason"]) : row["reason"] : "",
                instructionFr: row["instructionFr"] ? row["instructionFr"].startsWith("[") || row["instructionFr"].startsWith("{") ? JSON.parse(row["instructionFr"]) : row["instructionFr"] : "",
                instructionEn: row["instructionEn"] ? row["instructionEn"].startsWith("[") || row["instructionEn"].startsWith("{") ? JSON.parse(row["instructionEn"]) : row["instructionEn"] : "",
                words_EN: row["words_EN"] ? row["words_EN"].startsWith("[") || row["words_EN"].startsWith("{") ? JSON.parse(row["words_EN"]) : row["words_EN"] : ""
            }
        }),
    passage_mcq: (row)=>({
            external_id: row.ExerciseID || `passage_mcq_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                passage: row["passage"] ? row["passage"].startsWith("[") || row["passage"].startsWith("{") ? JSON.parse(row["passage"]) : row["passage"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : ""
            },
            evaluation: {
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    phonetics__what_do_you_hear: (row)=>({
            external_id: row.ExerciseID || `phonetics__what_do_you_hear_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                AudioID: row["AudioID"] ? row["AudioID"].startsWith("[") || row["AudioID"].startsWith("{") ? JSON.parse(row["AudioID"]) : row["AudioID"] : "",
                Option1: row["Option1"] ? row["Option1"].startsWith("[") || row["Option1"].startsWith("{") ? JSON.parse(row["Option1"]) : row["Option1"] : "",
                Option1_EN: row["Option1_EN"] ? row["Option1_EN"].startsWith("[") || row["Option1_EN"].startsWith("{") ? JSON.parse(row["Option1_EN"]) : row["Option1_EN"] : "",
                Option2: row["Option2"] ? row["Option2"].startsWith("[") || row["Option2"].startsWith("{") ? JSON.parse(row["Option2"]) : row["Option2"] : "",
                Option2_EN: row["Option2_EN"] ? row["Option2_EN"].startsWith("[") || row["Option2_EN"].startsWith("{") ? JSON.parse(row["Option2_EN"]) : row["Option2_EN"] : "",
                Option3: row["Option3"] ? row["Option3"].startsWith("[") || row["Option3"].startsWith("{") ? JSON.parse(row["Option3"]) : row["Option3"] : "",
                Option3_EN: row["Option3_EN"] ? row["Option3_EN"].startsWith("[") || row["Option3_EN"].startsWith("{") ? JSON.parse(row["Option3_EN"]) : row["Option3_EN"] : "",
                Option4: row["Option4"] ? row["Option4"].startsWith("[") || row["Option4"].startsWith("{") ? JSON.parse(row["Option4"]) : row["Option4"] : "",
                Option4_EN: row["Option4_EN"] ? row["Option4_EN"].startsWith("[") || row["Option4_EN"].startsWith("{") ? JSON.parse(row["Option4_EN"]) : row["Option4_EN"] : "",
                Option5: row["Option5"] ? row["Option5"].startsWith("[") || row["Option5"].startsWith("{") ? JSON.parse(row["Option5"]) : row["Option5"] : "",
                Option6: row["Option6"] ? row["Option6"].startsWith("[") || row["Option6"].startsWith("{") ? JSON.parse(row["Option6"]) : row["Option6"] : "",
                Question: row["Question"] ? row["Question"].startsWith("[") || row["Question"].startsWith("{") ? JSON.parse(row["Question"]) : row["Question"] : "",
                CorrectAnswers: row["CorrectAnswers"] ? row["CorrectAnswers"].startsWith("[") || row["CorrectAnswers"].startsWith("{") ? JSON.parse(row["CorrectAnswers"]) : row["CorrectAnswers"] : "",
                CorrectOptionIndexes: row["CorrectOptionIndexes"] ? row["CorrectOptionIndexes"].startsWith("[") || row["CorrectOptionIndexes"].startsWith("{") ? JSON.parse(row["CorrectOptionIndexes"]) : row["CorrectOptionIndexes"] : ""
            },
            evaluation: {
                correctAnswers: row["eval_correctAnswers"] ? row["eval_correctAnswers"].startsWith("[") || row["eval_correctAnswers"].startsWith("{") ? JSON.parse(row["eval_correctAnswers"]) : row["eval_correctAnswers"] : "",
                correctOptionIndexes: row["eval_correctOptionIndexes"] ? row["eval_correctOptionIndexes"].startsWith("[") || row["eval_correctOptionIndexes"].startsWith("{") ? JSON.parse(row["eval_correctOptionIndexes"]) : row["eval_correctOptionIndexes"] : ""
            }
        }),
    reading_conversation: (row)=>({
            external_id: row.ExerciseID || `reading_conversation_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                context: row["context"] ? row["context"].startsWith("[") || row["context"].startsWith("{") ? JSON.parse(row["context"]) : row["context"] : "",
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                messages: row["messages"] ? row["messages"].startsWith("[") || row["messages"].startsWith("{") ? JSON.parse(row["messages"]) : row["messages"] : "",
                nextMessage: row["nextMessage"] ? row["nextMessage"].startsWith("[") || row["nextMessage"].startsWith("{") ? JSON.parse(row["nextMessage"]) : row["nextMessage"] : "",
                currentPrompt: row["currentPrompt"] ? row["currentPrompt"].startsWith("[") || row["currentPrompt"].startsWith("{") ? JSON.parse(row["currentPrompt"]) : row["currentPrompt"] : ""
            },
            evaluation: {
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    reorder_sentences: (row)=>({
            external_id: row.ExerciseID || `reorder_sentences_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            evaluation: {
                correctOrder: row["eval_correctOrder"] ? row["eval_correctOrder"].startsWith("[") || row["eval_correctOrder"].startsWith("{") ? JSON.parse(row["eval_correctOrder"]) : row["eval_correctOrder"] : ""
            }
        }),
    repeat_sentence: (row)=>({
            external_id: row.ExerciseID || `repeat_sentence_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Question: row["Question"] ? row["Question"].startsWith("[") || row["Question"].startsWith("{") ? JSON.parse(row["Question"]) : row["Question"] : "",
                BlankIndex: row["BlankIndex"] ? row["BlankIndex"].startsWith("[") || row["BlankIndex"].startsWith("{") ? JSON.parse(row["BlankIndex"]) : row["BlankIndex"] : "",
                "Complete Sentence": row["Complete Sentence"] ? row["Complete Sentence"].startsWith("[") || row["Complete Sentence"].startsWith("{") ? JSON.parse(row["Complete Sentence"]) : row["Complete Sentence"] : "",
                "Sentence With Blank": row["Sentence With Blank"] ? row["Sentence With Blank"].startsWith("[") || row["Sentence With Blank"].startsWith("{") ? JSON.parse(row["Sentence With Blank"]) : row["Sentence With Blank"] : ""
            },
            evaluation: {
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : "",
                CorrectExplanation_EN: row["eval_CorrectExplanation_EN"] ? row["eval_CorrectExplanation_EN"].startsWith("[") || row["eval_CorrectExplanation_EN"].startsWith("{") ? JSON.parse(row["eval_CorrectExplanation_EN"]) : row["eval_CorrectExplanation_EN"] : ""
            }
        }),
    sentence_completion: (row)=>({
            external_id: row.ExerciseID || `sentence_completion_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                passageAfter: row["passageAfter"] ? row["passageAfter"].startsWith("[") || row["passageAfter"].startsWith("{") ? JSON.parse(row["passageAfter"]) : row["passageAfter"] : "",
                passageBefore: row["passageBefore"] ? row["passageBefore"].startsWith("[") || row["passageBefore"].startsWith("{") ? JSON.parse(row["passageBefore"]) : row["passageBefore"] : ""
            },
            evaluation: {
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    speak_image: (row)=>({
            external_id: row.ExerciseID || `speak_image_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Image: row["Image"] ? row["Image"].startsWith("[") || row["Image"].startsWith("{") ? JSON.parse(row["Image"]) : row["Image"] : "",
                Prompt: row["Prompt"] ? row["Prompt"].startsWith("[") || row["Prompt"].startsWith("{") ? JSON.parse(row["Prompt"]) : row["Prompt"] : "",
                Description: row["Description"] ? row["Description"].startsWith("[") || row["Description"].startsWith("{") ? JSON.parse(row["Description"]) : row["Description"] : ""
            }
        }),
    speak_interactive: (row)=>({
            external_id: row.ExerciseID || `speak_interactive_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Prompt: row["Prompt"] ? row["Prompt"].startsWith("[") || row["Prompt"].startsWith("{") ? JSON.parse(row["Prompt"]) : row["Prompt"] : "",
                Context: row["Context"] ? row["Context"].startsWith("[") || row["Context"].startsWith("{") ? JSON.parse(row["Context"]) : row["Context"] : "",
                Description: row["Description"] ? row["Description"].startsWith("[") || row["Description"].startsWith("{") ? JSON.parse(row["Description"]) : row["Description"] : ""
            }
        }),
    speak_topic: (row)=>({
            external_id: row.ExerciseID || `speak_topic_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Topic: row["Topic"] ? row["Topic"].startsWith("[") || row["Topic"].startsWith("{") ? JSON.parse(row["Topic"]) : row["Topic"] : "",
                Prompt: row["Prompt"] ? row["Prompt"].startsWith("[") || row["Prompt"].startsWith("{") ? JSON.parse(row["Prompt"]) : row["Prompt"] : ""
            }
        }),
    speak_translate: (row)=>({
            external_id: row.ExerciseID || `speak_translate_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                Question: row["Question"] ? row["Question"].startsWith("[") || row["Question"].startsWith("{") ? JSON.parse(row["Question"]) : row["Question"] : ""
            },
            evaluation: {
                Answer: row["eval_Answer"] ? row["eval_Answer"].startsWith("[") || row["eval_Answer"].startsWith("{") ? JSON.parse(row["eval_Answer"]) : row["eval_Answer"] : ""
            }
        }),
    summary_completion: (row)=>({
            external_id: row.ExerciseID || `summary_completion_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                fullText: row["fullText"] ? row["fullText"].startsWith("[") || row["fullText"].startsWith("{") ? JSON.parse(row["fullText"]) : row["fullText"] : "",
                passageSegments: row["passageSegments"] ? row["passageSegments"].startsWith("[") || row["passageSegments"].startsWith("{") ? JSON.parse(row["passageSegments"]) : row["passageSegments"] : ""
            },
            evaluation: {
                blanksData: row["eval_blanksData"] ? row["eval_blanksData"].startsWith("[") || row["eval_blanksData"].startsWith("{") ? JSON.parse(row["eval_blanksData"]) : row["eval_blanksData"] : ""
            }
        }),
    three_options: (row)=>({
            external_id: row.ExerciseID || `three_options_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : "",
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    translate_bubbles: (row)=>({
            external_id: row.ExerciseID || `translate_bubbles_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                BubbleTokens: row["BubbleTokens"] ? row["BubbleTokens"].startsWith("[") || row["BubbleTokens"].startsWith("{") ? JSON.parse(row["BubbleTokens"]) : row["BubbleTokens"] : "",
                SourceAudioID: row["SourceAudioID"] ? row["SourceAudioID"].startsWith("[") || row["SourceAudioID"].startsWith("{") ? JSON.parse(row["SourceAudioID"]) : row["SourceAudioID"] : "",
                ShuffleBubbles: row["ShuffleBubbles"] ? row["ShuffleBubbles"].startsWith("[") || row["ShuffleBubbles"].startsWith("{") ? JSON.parse(row["ShuffleBubbles"]) : row["ShuffleBubbles"] : "",
                SourceLanguage: row["SourceLanguage"] ? row["SourceLanguage"].startsWith("[") || row["SourceLanguage"].startsWith("{") ? JSON.parse(row["SourceLanguage"]) : row["SourceLanguage"] : "",
                SourceSentence: row["SourceSentence"] ? row["SourceSentence"].startsWith("[") || row["SourceSentence"].startsWith("{") ? JSON.parse(row["SourceSentence"]) : row["SourceSentence"] : "",
                TargetLanguage: row["TargetLanguage"] ? row["TargetLanguage"].startsWith("[") || row["TargetLanguage"].startsWith("{") ? JSON.parse(row["TargetLanguage"]) : row["TargetLanguage"] : "",
                TargetSentence: row["TargetSentence"] ? row["TargetSentence"].startsWith("[") || row["TargetSentence"].startsWith("{") ? JSON.parse(row["TargetSentence"]) : row["TargetSentence"] : ""
            },
            evaluation: {
                CorrectTokenOrder: row["eval_CorrectTokenOrder"] ? row["eval_CorrectTokenOrder"].startsWith("[") || row["eval_CorrectTokenOrder"].startsWith("{") ? JSON.parse(row["eval_CorrectTokenOrder"]) : row["eval_CorrectTokenOrder"] : "",
                AcceptableTranslations: row["eval_AcceptableTranslations"] ? row["eval_AcceptableTranslations"].startsWith("[") || row["eval_AcceptableTranslations"].startsWith("{") ? JSON.parse(row["eval_AcceptableTranslations"]) : row["eval_AcceptableTranslations"] : "",
                AllowMultipleSolutions: row["eval_AllowMultipleSolutions"] ? row["eval_AllowMultipleSolutions"].startsWith("[") || row["eval_AllowMultipleSolutions"].startsWith("{") ? JSON.parse(row["eval_AllowMultipleSolutions"]) : row["eval_AllowMultipleSolutions"] : ""
            }
        }),
    translate_typed: (row)=>({
            external_id: row.ExerciseID || `translate_typed_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                sourceText: row["sourceText"] ? row["sourceText"].startsWith("[") || row["sourceText"].startsWith("{") ? JSON.parse(row["sourceText"]) : row["sourceText"] : "",
                correctAnswer: row["correctAnswer"] ? row["correctAnswer"].startsWith("[") || row["correctAnswer"].startsWith("{") ? JSON.parse(row["correctAnswer"]) : row["correctAnswer"] : ""
            },
            evaluation: {
                acceptableAnswers: row["eval_acceptableAnswers"] ? row["eval_acceptableAnswers"].startsWith("[") || row["eval_acceptableAnswers"].startsWith("{") ? JSON.parse(row["eval_acceptableAnswers"]) : row["eval_acceptableAnswers"] : ""
            }
        }),
    true_false: (row)=>({
            external_id: row.ExerciseID || `true_false_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                passage: row["passage"] ? row["passage"].startsWith("[") || row["passage"].startsWith("{") ? JSON.parse(row["passage"]) : row["passage"] : "",
                statement: row["statement"] ? row["statement"].startsWith("[") || row["statement"].startsWith("{") ? JSON.parse(row["statement"]) : row["statement"] : ""
            },
            evaluation: {
                answer: row["eval_answer"] ? row["eval_answer"].startsWith("[") || row["eval_answer"].startsWith("{") ? JSON.parse(row["eval_answer"]) : row["eval_answer"] : ""
            }
        }),
    two_options: (row)=>({
            external_id: row.ExerciseID || `two_options_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                options: row["options"] ? row["options"].startsWith("[") || row["options"].startsWith("{") ? JSON.parse(row["options"]) : row["options"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : "",
                sentence: row["sentence"] ? row["sentence"].startsWith("[") || row["sentence"].startsWith("{") ? JSON.parse(row["sentence"]) : row["sentence"] : ""
            },
            evaluation: {
                translation: row["eval_translation"] ? row["eval_translation"].startsWith("[") || row["eval_translation"].startsWith("{") ? JSON.parse(row["eval_translation"]) : row["eval_translation"] : "",
                correctIndex: row["eval_correctIndex"] ? row["eval_correctIndex"].startsWith("[") || row["eval_correctIndex"].startsWith("{") ? JSON.parse(row["eval_correctIndex"]) : row["eval_correctIndex"] : ""
            }
        }),
    vocab_typing_blanks: (row)=>({
            external_id: row.ExerciseID || `vocab_typing_blanks_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                hints: row["hints"] ? row["hints"].startsWith("[") || row["hints"].startsWith("{") ? JSON.parse(row["hints"]) : row["hints"] : "",
                blanks: row["blanks"] ? row["blanks"].startsWith("[") || row["blanks"].startsWith("{") ? JSON.parse(row["blanks"]) : row["blanks"] : "",
                fullText: row["fullText"] ? row["fullText"].startsWith("[") || row["fullText"].startsWith("{") ? JSON.parse(row["fullText"]) : row["fullText"] : "",
                displayParts: row["displayParts"] ? row["displayParts"].startsWith("[") || row["displayParts"].startsWith("{") ? JSON.parse(row["displayParts"]) : row["displayParts"] : "",
                SentenceWithBlank: row["SentenceWithBlank"] ? row["SentenceWithBlank"].startsWith("[") || row["SentenceWithBlank"].startsWith("{") ? JSON.parse(row["SentenceWithBlank"]) : row["SentenceWithBlank"] : ""
            },
            evaluation: {
                CorrectAnswer: row["eval_CorrectAnswer"] ? row["eval_CorrectAnswer"].startsWith("[") || row["eval_CorrectAnswer"].startsWith("{") ? JSON.parse(row["eval_CorrectAnswer"]) : row["eval_CorrectAnswer"] : ""
            }
        }),
    write_documents: (row)=>({
            external_id: row.ExerciseID || `write_documents_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                subject: row["subject"] ? row["subject"].startsWith("[") || row["subject"].startsWith("{") ? JSON.parse(row["subject"]) : row["subject"] : "",
                minWords: row["minWords"] ? row["minWords"].startsWith("[") || row["minWords"].startsWith("{") ? JSON.parse(row["minWords"]) : row["minWords"] : "",
                scenario: row["scenario"] ? row["scenario"].startsWith("[") || row["scenario"].startsWith("{") ? JSON.parse(row["scenario"]) : row["scenario"] : "",
                template: row["template"] ? row["template"].startsWith("[") || row["template"].startsWith("{") ? JSON.parse(row["template"]) : row["template"] : "",
                recipient: row["recipient"] ? row["recipient"].startsWith("[") || row["recipient"].startsWith("{") ? JSON.parse(row["recipient"]) : row["recipient"] : "",
                documentType: row["documentType"] ? row["documentType"].startsWith("[") || row["documentType"].startsWith("{") ? JSON.parse(row["documentType"]) : row["documentType"] : ""
            },
            evaluation: {
                sampleAnswer: row["eval_sampleAnswer"] ? row["eval_sampleAnswer"].startsWith("[") || row["eval_sampleAnswer"].startsWith("{") ? JSON.parse(row["eval_sampleAnswer"]) : row["eval_sampleAnswer"] : ""
            }
        }),
    write_fill_blanks: (row)=>({
            external_id: row.ExerciseID || `write_fill_blanks_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : "",
                passage: row["passage"] ? row["passage"].startsWith("[") || row["passage"].startsWith("{") ? JSON.parse(row["passage"]) : row["passage"] : "",
                targetWords: row["targetWords"] ? row["targetWords"].startsWith("[") || row["targetWords"].startsWith("{") ? JSON.parse(row["targetWords"]) : row["targetWords"] : "",
                englishTranslation: row["englishTranslation"] ? row["englishTranslation"].startsWith("[") || row["englishTranslation"].startsWith("{") ? JSON.parse(row["englishTranslation"]) : row["englishTranslation"] : ""
            }
        }),
    write_image: (row)=>({
            external_id: row.ExerciseID || `write_image_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                hint: row["hint"] ? row["hint"].startsWith("[") || row["hint"].startsWith("{") ? JSON.parse(row["hint"]) : row["hint"] : "",
                imageUrl: row["imageUrl"] ? row["imageUrl"].startsWith("[") || row["imageUrl"].startsWith("{") ? JSON.parse(row["imageUrl"]) : row["imageUrl"] : "",
                question: row["question"] ? row["question"].startsWith("[") || row["question"].startsWith("{") ? JSON.parse(row["question"]) : row["question"] : ""
            },
            evaluation: {
                sampleAnswer: row["eval_sampleAnswer"] ? row["eval_sampleAnswer"].startsWith("[") || row["eval_sampleAnswer"].startsWith("{") ? JSON.parse(row["eval_sampleAnswer"]) : row["eval_sampleAnswer"] : ""
            }
        }),
    write_topic: (row)=>({
            external_id: row.ExerciseID || `write_topic_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                hints: row["hints"] ? row["hints"].startsWith("[") || row["hints"].startsWith("{") ? JSON.parse(row["hints"]) : row["hints"] : "",
                topic: row["topic"] ? row["topic"].startsWith("[") || row["topic"].startsWith("{") ? JSON.parse(row["topic"]) : row["topic"] : "",
                prompt: row["prompt"] ? row["prompt"].startsWith("[") || row["prompt"].startsWith("{") ? JSON.parse(row["prompt"]) : row["prompt"] : "",
                minWords: row["minWords"] ? row["minWords"].startsWith("[") || row["minWords"].startsWith("{") ? JSON.parse(row["minWords"]) : row["minWords"] : "",
                englishTopic: row["englishTopic"] ? row["englishTopic"].startsWith("[") || row["englishTopic"].startsWith("{") ? JSON.parse(row["englishTopic"]) : row["englishTopic"] : "",
                sampleAnswer: row["sampleAnswer"] ? row["sampleAnswer"].startsWith("[") || row["sampleAnswer"].startsWith("{") ? JSON.parse(row["sampleAnswer"]) : row["sampleAnswer"] : "",
                timeLimitSeconds: row["timeLimitSeconds"] ? row["timeLimitSeconds"].startsWith("[") || row["timeLimitSeconds"].startsWith("{") ? JSON.parse(row["timeLimitSeconds"]) : row["timeLimitSeconds"] : ""
            }
        }),
    writing_conversation: (row)=>({
            external_id: row.ExerciseID || `writing_conversation_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                title: row["title"] ? row["title"].startsWith("[") || row["title"].startsWith("{") ? JSON.parse(row["title"]) : row["title"] : "",
                scenario: row["scenario"] ? row["scenario"].startsWith("[") || row["scenario"].startsWith("{") ? JSON.parse(row["scenario"]) : row["scenario"] : "",
                exchanges: row["exchanges"] ? row["exchanges"].startsWith("[") || row["exchanges"].startsWith("{") ? JSON.parse(row["exchanges"]) : row["exchanges"] : ""
            }
        }),
    highlight_word: (row)=>({
            external_id: row.ExerciseID || `highlight_word_${Math.random()}`,
            instruction_en: row.Instruction_EN || "",
            instruction_fr: row.Instruction_FR || "",
            level: row.Level || "",
            content: {
                passage: row["passage"] || row["sentence"] || "",
                question: row["question"] || "",
                eval_correctWord: row["eval_correctWord"] || ""
            }
        })
};
async function fetchVocabulary({ level, category, subCategory, limit, learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    if (level) params.append("level", level);
    if (category) params.append("category", category);
    if (limit) params.append("limit", limit);
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    // Handle subCategory array
    if (subCategory && Array.isArray(subCategory)) {
        subCategory.forEach((sc)=>params.append("sub_category", sc));
    } else if (subCategory) {
        params.append("sub_category", subCategory);
    }
    const url = `${API_BASE_URL}/api/vocabulary${params.toString() ? "?" + params : ""}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch vocabulary");
    }
    return response.json();
}
async function fetchLessonWords(lessonId, { level, wordsPerLesson = 10, learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    params.append("words_per_lesson", wordsPerLesson);
    if (level) params.append("level", level);
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/lesson/${lessonId}?${params}`);
    if (!response.ok) {
        throw new Error("Failed to fetch lesson");
    }
    return response.json();
}
async function fetchAvailableLevels() {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/levels`);
    if (!response.ok) {
        throw new Error("Failed to fetch levels");
    }
    return response.json();
}
async function fetchAvailableCategories() {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/categories`);
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    return response.json();
}
async function fetchCategoriesByLevel(level) {
    const params = new URLSearchParams();
    if (level) params.append("level", level);
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/categories-by-level?${params}`);
    if (!response.ok) {
        throw new Error("Failed to fetch categories by level");
    }
    return response.json();
}
async function fetchAllTopics() {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/topics`);
    if (!response.ok) {
        throw new Error("Failed to fetch topics");
    }
    return response.json();
}
async function checkApiHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch  {
        return false;
    }
}
async function saveUserProgress(progressData, token) {
    const response = await fetch(`${API_BASE_URL}/api/progress/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(progressData)
    });
    if (!response.ok) {
        throw new Error("Failed to save progress");
    }
    return response.json();
}
async function fetchTeachers({ limit = 20, skip = 0 } = {}) {
    const response = await fetch(`${API_BASE_URL}/api/teachers?limit=${limit}&skip=${skip}`);
    if (!response.ok) {
        throw new Error("Failed to fetch teachers");
    }
    return response.json();
}
async function requestConnection(data, token) {
    const response = await fetch(`${API_BASE_URL}/api/relationships/link`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to send connection request");
    }
    return response.json();
}
async function searchProfiles(query, token) {
    const response = await fetch(`${API_BASE_URL}/api/profiles/search?q=${encodeURIComponent(query)}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Search failed");
    }
    return response.json();
}
async function fetchFriends(token) {
    const response = await fetch(`${API_BASE_URL}/api/relationships/friends`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch friends");
    }
    return response.json();
}
async function linkStudentToTeacher(studentId, teacherId, token) {
    return requestConnection({
        studentId,
        teacherId,
        type: "teacher"
    }, token);
}
async function fetchTeacherStudents(teacherId, status, token) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const response = await fetch(`${API_BASE_URL}/api/relationships/teacher/${teacherId}/students?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch students");
    }
    return response.json();
}
async function updateRelationshipStatus(relationshipId, status, token) {
    const response = await fetch(`${API_BASE_URL}/api/relationships/${relationshipId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            status
        })
    });
    if (!response.ok) {
        throw new Error("Failed to update status");
    }
    return response.json();
}
async function fetchStudentTeachers(studentId, status, token) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const response = await fetch(`${API_BASE_URL}/api/relationships/student/${studentId}/teachers?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch teachers");
    }
    return response.json();
}
async function deleteRelationship(relationshipId, token) {
    const response = await fetch(`${API_BASE_URL}/api/relationships/${relationshipId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to delete relationship");
    }
    return true;
}
async function fetchPracticeQuestions(sheetName, { limit, learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit);
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    const normalizedSheetName = sheetName.toLowerCase().replace(/ /g, "_");
    const transformer = CSV_TRANSFORMERS[normalizedSheetName];
    // If CSV override is enabled, try loading from CSV straight away
    if (USE_MOCK_CSV_DATA && transformer) {
        console.log(`[vocabularyApi] 🧪 Mock CSV Mode active. Bypassing API for ${sheetName}`);
        try {
            const Papa = await __turbopack_context__.A("[project]/node_modules/papaparse/papaparse.js [app-ssr] (ecmascript, async loader)");
            const csvResponse = await fetch(`/mock-data/csv/${normalizedSheetName}.csv`);
            if (!csvResponse.ok) {
                throw new Error(`Fallback CSV not found for ${sheetName}`);
            }
            const csvText = await csvResponse.text();
            return new Promise((resolve, reject)=>{
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results)=>{
                        try {
                            const transformedData = results.data.map((row)=>{
                                const newRow = {
                                    ...row
                                };
                                for(const key in newRow){
                                    if (typeof newRow[key] === "string" && (newRow[key].startsWith("[") || newRow[key].startsWith("{"))) {
                                        try {
                                            newRow[key] = JSON.parse(newRow[key]);
                                        } catch (e) {}
                                    }
                                }
                                return newRow;
                            });
                            // Mock structure expects flat data array from this endpoint usually internally mapped to { data: [] }
                            resolve({
                                data: transformedData
                            });
                        } catch (err) {
                            reject(err);
                        }
                    },
                    error: (err)=>reject(err)
                });
            });
        } catch (err) {
            console.error(`[vocabularyApi] Mock CSV failed for ${sheetName}:`, err);
        // Fallback to API if CSV fails despite override
        }
    }
    const url = `${API_BASE_URL}/api/practice/${encodeURIComponent(sheetName)}?${params}`;
    console.log(`[vocabularyApi] Fetching Practice Questions:`, {
        sheetName,
        url,
        base: API_BASE_URL,
        params: params.toString()
    });
    const response = await fetch(url);
    if (response.status === 404) {
        if (transformer) {
            console.warn(`[vocabularyApi] API 404 for ${sheetName}, falling back to CSV: ${normalizedSheetName}.csv`);
            try {
                const Papa = await __turbopack_context__.A("[project]/node_modules/papaparse/papaparse.js [app-ssr] (ecmascript, async loader)");
                const csvResponse = await fetch(`/mock-data/csv/${normalizedSheetName}.csv`);
                if (!csvResponse.ok) {
                    throw new Error(`Failed to fetch fallback CSV: ${normalizedSheetName}.csv`);
                }
                const csvText = await csvResponse.text();
                return new Promise((resolve, reject)=>{
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results)=>{
                            try {
                                const transformedData = results.data.map((row)=>{
                                    const newRow = {
                                        ...row
                                    };
                                    for(const key in newRow){
                                        if (typeof newRow[key] === "string" && (newRow[key].startsWith("[") || newRow[key].startsWith("{"))) {
                                            try {
                                                newRow[key] = JSON.parse(newRow[key]);
                                            } catch (e) {}
                                        }
                                    }
                                    return newRow;
                                });
                                resolve({
                                    data: transformedData
                                });
                            } catch (err) {
                                reject(err);
                            }
                        },
                        error: (err)=>reject(err)
                    });
                });
            } catch (err) {
                console.error(`[vocabularyApi] Fallback failed for ${sheetName}:`, err);
                throw new Error(`Failed to fetch practice questions for ${sheetName}`);
            }
        }
    }
    if (!response.ok) {
        console.error(`[vocabularyApi] API Error for ${sheetName}: Status ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch practice questions for ${sheetName}`);
    }
    return response.json();
}
async function fetchMatchPairsData(level) {
    const url = `${API_BASE_URL}/api/practice/match-pairs${level ? `?level=${level}` : ""}`;
    const response = await fetch(url);
    if (response.status === 404) {
        console.warn(`[vocabularyApi] API 404 for match-pairs, falling back to CSV: match_pairs.csv`);
        try {
            const Papa = await __turbopack_context__.A("[project]/node_modules/papaparse/papaparse.js [app-ssr] (ecmascript, async loader)");
            const csvResponse = await fetch(`/mock-data/csv/match_pairs.csv`);
            if (!csvResponse.ok) {
                throw new Error(`Failed to fetch fallback CSV: match_pairs.csv`);
            }
            const csvText = await csvResponse.text();
            return new Promise((resolve, reject)=>{
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results)=>{
                        try {
                            // Transform CSV data to expected format
                            const transformedData = results.data.map((row)=>({
                                    id: Math.random().toString(36).substr(2, 9),
                                    french: row["Word - French"],
                                    english: row["English word"],
                                    image: row["Image"] ? `/mock-data/images/${row["Image"]}` : null,
                                    instructionFr: "Associez les paires",
                                    instructionEn: "Match the pairs",
                                    level: row["Level"]
                                }))// Filter by level if requested and level column exists
                            .filter((item)=>!level || !item.level || item.level === level);
                            resolve(transformedData);
                        } catch (err) {
                            reject(err);
                        }
                    },
                    error: (err)=>reject(err)
                });
            });
        } catch (err) {
            console.error(`[vocabularyApi] Fallback failed for match-pairs:`, err);
            throw new Error("Failed to fetch match pairs");
        }
    }
    if (!response.ok) throw new Error("Failed to fetch match pairs");
    return response.json();
}
async function fetchRepeatSentenceData(level) {
    const url = `${API_BASE_URL}/api/practice/repeat-sentence${level ? `?level=${level}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch repeat sentence");
    return response.json();
}
async function fetchWhatDoYouSeeData() {
    const response = await fetch(`${API_BASE_URL}/api/practice/what-do-you-see`);
    if (!response.ok) throw new Error("Failed to fetch what do you see");
    return response.json();
}
async function fetchDictationImageData() {
    const response = await fetch(`${API_BASE_URL}/api/practice/dictation-image`);
    if (!response.ok) throw new Error("Failed to fetch dictation image");
    return response.json();
}
async function fetchLearningQueue({ userId, dailyLimitReviews, dailyLimitNew, level, category, learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", userId);
    if (dailyLimitReviews) params.append("daily_limit_reviews", dailyLimitReviews);
    if (dailyLimitNew) params.append("daily_limit_new", dailyLimitNew);
    if (level) params.append("level", level);
    if (category) params.append("category", category);
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    console.log(`[vocabularyApi] Fetching queue with params: ${params.toString()}`);
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/learn?${params}`);
    if (!response.ok) {
        throw new Error("Failed to fetch learning queue");
    }
    return response.json();
}
async function fetchCompletePassageData({ learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    const response = await fetch(`${API_BASE_URL}/api/practice/complete_passage_dropdown?${params}`);
    if (!response.ok) throw new Error("Failed to fetch complete passage data");
    const result = await response.json();
    return result.data || result;
}
async function fetchSummaryCompletionData({ learningLang, knownLang } = {}) {
    const params = new URLSearchParams();
    if (learningLang) params.append("learning_lang", learningLang);
    if (knownLang) params.append("known_lang", knownLang);
    const response = await fetch(`${API_BASE_URL}/api/practice/summary_completion?${params}`);
    if (!response.ok) throw new Error("Failed to fetch summary completion data");
    const result = await response.json();
    return result.data || result;
}
async function fetchWritingDocuments(level) {
    const url = `${API_BASE_URL}/api/practice/write_documents${level ? `?level=${level}` : ""}`;
    console.log(`[vocabularyApi] Fetching writing documents from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch writing documents");
    const result = await response.json();
    return result.data || result;
}
async function fetchWriteAnalysisData() {
    const response = await fetch(`${API_BASE_URL}/api/practice/write_analysis`);
    if (!response.ok) throw new Error("Failed to fetch writing analysis data");
    const result = await response.json();
    return result.data || result;
}
async function fetchClasses(token) {
    const response = await fetch(`${API_BASE_URL}/api/teachers/classes`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch classes");
    }
    return response.json();
}
async function fetchStudentClasses(studentId, token) {
    const response = await fetch(`${API_BASE_URL}/api/students/classes?student_id=${studentId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch student classes");
    }
    return response.json();
}
async function createClass(classData, token) {
    const response = await fetch(`${API_BASE_URL}/api/teachers/classes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(classData)
    });
    if (!response.ok) {
        throw new Error("Failed to create class");
    }
    return response.json();
}
async function fetchClassDetails(classId, token) {
    const response = await fetch(`${API_BASE_URL}/api/teachers/classes/${classId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch class details");
    }
    return response.json();
}
async function updateClass(classId, updateData, token) {
    const response = await fetch(`${API_BASE_URL}/api/teachers/classes/${classId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
    });
    if (!response.ok) {
        throw new Error("Failed to update class");
    }
    return response.json();
}
async function deleteClass(classId, token) {
    const response = await fetch(`${API_BASE_URL}/api/teachers/classes/${classId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to delete class");
    }
    return response.json();
}
async function createClassAssignment(assignmentData, classId, token) {
    const url = `${API_BASE_URL}/api/teachers/assign${classId ? `?class_id=${classId}` : ""}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(assignmentData)
    });
    if (!response.ok) {
        throw new Error("Failed to create class assignment");
    }
    return response.json();
}
async function fetchAvailableQuestionTypes(level, language) {
    if (!level || level === "all") return null;
    try {
        const res = await fetch(`${API_BASE_URL}/api/tag-topics/available-types?level=${level}&language=${language}`);
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data.slugs) ? data.slugs : null;
    } catch (err) {
        console.error("fetchAvailableQuestionTypes error:", err);
        return null;
    }
}
async function rateSrsCard({ vocabId, rating }, token) {
    if (!vocabId || !token) return null;
    try {
        const res = await fetch(`${API_BASE_URL}/api/srs/rate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                vocabId,
                rating
            })
        });
        if (!res.ok) return null;
        return res.json();
    } catch (err) {
        console.error("rateSrsCard error:", err);
        return null;
    }
}
async function fetchSrsDue({ category, level } = {}, token) {
    if (!token) return [];
    try {
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (level && level !== "All") params.append("level", level);
        const res = await fetch(`${API_BASE_URL}/api/srs/due${params.toString() ? "?" + params : ""}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.dueIds || [];
    } catch (err) {
        console.error("fetchSrsDue error:", err);
        return [];
    }
}
}),
"[project]/src/services/progressApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteLearnedCard",
    ()=>deleteLearnedCard,
    "getLessonProgress",
    ()=>getLessonProgress,
    "getTotalLearnedCount",
    ()=>getTotalLearnedCount,
    "getWordlist",
    ()=>getWordlist,
    "resetLessonProgress",
    ()=>resetLessonProgress,
    "saveProgress",
    ()=>saveProgress
]);
/**
 * Progress Tracking API Service
 * Handles saving/retrieving learned cards for user progress
 */ const API_BASE_URL = ("TURBOPACK compile-time value", "https://language-backend-v8sy.onrender.com") || "http://localhost:8000";
async function saveProgress(userId, langCode, level, category, cards, token) {
    const response = await fetch(`${API_BASE_URL}/api/progress/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            userId,
            langCode,
            level: level.toUpperCase(),
            category,
            cards: cards.map((card)=>({
                    cardId: card.id,
                    cardData: {
                        english: card.english,
                        forms: card.forms,
                        exampleTarget: card.exampleTarget,
                        exampleNative: card.exampleNative,
                        phonetic: card.phonetic,
                        level: card.level,
                        category: card.category,
                        subCategory: card.subCategory || "",
                        image: card.image || ""
                    }
                }))
        })
    });
    if (!response.ok) {
        throw new Error("Failed to save progress");
    }
    return response.json();
}
async function getLessonProgress(token, langCode, level, category) {
    const params = new URLSearchParams();
    params.append("langCode", langCode);
    params.append("level", level.toUpperCase());
    params.append("category", category);
    const response = await fetch(`${API_BASE_URL}/api/progress/lesson?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to get lesson progress");
    }
    return response.json();
}
async function getWordlist(token, langCode, { limit = 50, cursor = null } = {}) {
    const params = new URLSearchParams();
    params.append("langCode", langCode);
    params.append("limit", limit);
    if (cursor) params.append("cursor", cursor);
    const response = await fetch(`${API_BASE_URL}/api/progress/wordlist?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to get wordlist");
    }
    return response.json();
}
async function resetLessonProgress(token, langCode, level, category) {
    const params = new URLSearchParams();
    params.append("langCode", langCode);
    params.append("level", level.toUpperCase());
    params.append("category", category);
    const response = await fetch(`${API_BASE_URL}/api/progress/lesson?${params.toString()}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to reset progress");
    }
    return response.json();
}
async function deleteLearnedCard(token, cardId) {
    const params = new URLSearchParams();
    params.append("card_id", cardId);
    const response = await fetch(`${API_BASE_URL}/api/progress/card?${params.toString()}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to delete card");
    }
    return response.json();
}
async function getTotalLearnedCount(token, langCode) {
    const params = new URLSearchParams();
    if (langCode) params.append("langCode", langCode);
    const response = await fetch(`${API_BASE_URL}/api/progress/count?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        return 0;
    }
    const data = await response.json();
    return data.count;
}
}),
"[project]/src/services/reviewCardsApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addToReview",
    ()=>addToReview,
    "bulkAddToReview",
    ()=>bulkAddToReview,
    "bulkRemoveFromReview",
    ()=>bulkRemoveFromReview,
    "checkCategoryBookmarked",
    ()=>checkCategoryBookmarked,
    "checkIsBookmarked",
    ()=>checkIsBookmarked,
    "fetchReviewCards",
    ()=>fetchReviewCards,
    "getReviewCount",
    ()=>getReviewCount,
    "removeFromReview",
    ()=>removeFromReview,
    "updateReviewStatus",
    ()=>updateReviewStatus
]);
/**
 * Review Cards API Service
 * Handles all API calls for bookmark/review functionality
 */ const API_BASE_URL = ("TURBOPACK compile-time value", "https://language-backend-v8sy.onrender.com") || "http://localhost:8000";
async function addToReview(token, cardData) {
    const response = await fetch(`${API_BASE_URL}/api/review-cards`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            cardId: cardData.id,
            cardData: {
                english: cardData.english,
                forms: cardData.forms,
                exampleTarget: cardData.exampleTarget,
                exampleNative: cardData.exampleNative,
                phonetic: cardData.phonetic,
                level: cardData.level,
                category: cardData.category,
                subCategory: cardData.subCategory || "",
                image: cardData.image || ""
            }
        })
    });
    if (!response.ok) {
        throw new Error("Failed to add card to review");
    }
    return response.json();
}
async function removeFromReview(token, cardId) {
    const response = await fetch(`${API_BASE_URL}/api/review-cards/${cardId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to remove card from review");
    }
    return response.json();
}
async function fetchReviewCards(token, { limit = 20, cursor = null, status = null } = {}) {
    const params = new URLSearchParams();
    params.append("limit", limit);
    if (cursor) params.append("cursor", cursor);
    if (status) params.append("status", status);
    const response = await fetch(`${API_BASE_URL}/api/review-cards?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch review cards");
    }
    return response.json();
}
async function checkIsBookmarked(token, cardId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/review-cards/check/${cardId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        return data.isBookmarked;
    } catch  {
        return false;
    }
}
async function getReviewCount(token, status = null) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const response = await fetch(`${API_BASE_URL}/api/review-cards/count?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        return 0;
    }
    const data = await response.json();
    return data.count;
}
async function updateReviewStatus(token, cardId, status) {
    const response = await fetch(`${API_BASE_URL}/api/review-cards/${cardId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            status
        })
    });
    if (!response.ok) {
        throw new Error("Failed to update review status");
    }
    return response.json();
}
async function bulkAddToReview(token, level, category, cards) {
    const response = await fetch(`${API_BASE_URL}/api/review-cards/bulk`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            level,
            category,
            cards: cards.map((card)=>({
                    id: card.id || "",
                    english: card.english,
                    forms: card.forms,
                    exampleTarget: card.exampleTarget,
                    exampleNative: card.exampleNative,
                    phonetic: card.phonetic,
                    level: card.level,
                    category: card.category,
                    subCategory: card.subCategory || "",
                    image: card.image || ""
                }))
        })
    });
    if (!response.ok) {
        throw new Error("Failed to bulk add cards to review");
    }
    return response.json();
}
async function bulkRemoveFromReview(token, level, category) {
    const params = new URLSearchParams();
    params.append("level", level);
    params.append("category", category);
    const response = await fetch(`${API_BASE_URL}/api/review-cards/bulk?${params.toString()}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to bulk remove cards from review");
    }
    return response.json();
}
async function checkCategoryBookmarked(token, level, category) {
    const params = new URLSearchParams();
    params.append("level", level);
    params.append("category", category);
    try {
        const response = await fetch(`${API_BASE_URL}/api/review-cards/check-category?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (!response.ok) {
            return {
                isBookmarked: false,
                bookmarkedCount: 0
            };
        }
        return response.json();
    } catch  {
        return {
            isBookmarked: false,
            bookmarkedCount: 0
        };
    }
}
}),
"[project]/src/components/ui/ConfirmationModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ConfirmationModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
"use client";
;
;
function ConfirmationModal({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to proceed?", confirmLabel = "Confirm", cancelLabel = "Cancel", isLoading = false, variant = "primary" }) {
    if (!isOpen) return null;
    const confirmButtonStyles = {
        primary: "bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-500",
        danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/50 backdrop-blur-sm",
                onClick: onClose
            }, void 0, false, {
                fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold text-gray-900 dark:text-white",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                className: "p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition-colors",
                                disabled: isLoading,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                                    lineNumber: 47,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 dark:text-slate-400",
                            children: message
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                disabled: isLoading,
                                className: "px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50",
                                children: cancelLabel
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                                lineNumber: 58,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onConfirm,
                                disabled: isLoading,
                                className: `px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonStyles[variant]}`,
                                children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                                            lineNumber: 72,
                                            columnNumber: 17
                                        }, this),
                                        "Processing..."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                                    lineNumber: 71,
                                    columnNumber: 15
                                }, this) : confirmLabel
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/ConfirmationModal.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CEFRLevelPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/node_modules/@clerk/shared/dist/runtime/react/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/dist/chunk-XE3Y43DU.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BookmarkIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookmarkIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/BookmarkIcon.js [app-ssr] (ecmascript) <export default as BookmarkIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BookOpenIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpenIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/BookOpenIcon.js [app-ssr] (ecmascript) <export default as BookOpenIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$RectangleStackIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RectangleStackIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/RectangleStackIcon.js [app-ssr] (ecmascript) <export default as RectangleStackIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$Squares2X2Icon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Squares2X2Icon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/Squares2X2Icon.js [app-ssr] (ecmascript) <export default as Squares2X2Icon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LanguageIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LanguageIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/LanguageIcon.js [app-ssr] (ecmascript) <export default as LanguageIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$solid$2f$esm$2f$BookmarkIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookmarkIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/solid/esm/BookmarkIcon.js [app-ssr] (ecmascript) <export default as BookmarkIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/vocabularyApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$progressApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/progressApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/LanguageContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$reviewCardsApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/reviewCardsApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$ConfirmationModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/ConfirmationModal.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
// Level colors config
const levelColors = {
    a1: {
        bg: "bg-sky-500",
        text: "text-sky-500",
        progressBg: "bg-sky-100 dark:bg-sky-900/30",
        progressFill: "bg-sky-500"
    },
    a2: {
        bg: "bg-sky-400",
        text: "text-sky-400",
        progressBg: "bg-sky-100 dark:bg-sky-900/30",
        progressFill: "bg-sky-400"
    },
    b1: {
        bg: "bg-teal-500",
        text: "text-teal-500",
        progressBg: "bg-teal-100 dark:bg-teal-900/30",
        progressFill: "bg-teal-500"
    },
    b2: {
        bg: "bg-teal-400",
        text: "text-teal-400",
        progressBg: "bg-teal-100 dark:bg-teal-900/30",
        progressFill: "bg-teal-400"
    },
    c1: {
        bg: "bg-orange-500",
        text: "text-orange-500",
        progressBg: "bg-orange-100 dark:bg-orange-900/30",
        progressFill: "bg-orange-500"
    },
    c2: {
        bg: "bg-orange-400",
        text: "text-orange-400",
        progressBg: "bg-orange-100 dark:bg-orange-900/30",
        progressFill: "bg-orange-400"
    }
};
// Action button component
function ActionButton({ icon: Icon, label, onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: onClick,
        className: "flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group",
        title: label,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: "w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors"
            }, void 0, false, {
                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                lineNumber: 74,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
            lineNumber: 73,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
// Category Card component with progress
function CategoryCard({ category, levelColor, level, learnedCount = 0, isBookmarked = false, onBookmarkClick }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const totalWords = category.wordCount || 1;
    const progressPercent = Math.min(Math.round(learnedCount / totalWords * 100), 100);
    const handleBookmarkClick = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        if (onBookmarkClick) {
            onBookmarkClick(category, isBookmarked);
        }
    };
    const handleCardClick = (e)=>{
        // Prevent navigation if clicking on interactive elements
        if (e.target.closest("button") || e.target.closest("a") || e.target.getAttribute("role") === "button") {
            return;
        }
        router.push(`/vocabulary/lessons/learn/${level}/${category.slug}`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: handleCardClick,
        className: "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 flex flex-col hover:shadow-md transition-all cursor-pointer relative group",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-20 h-20 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-3xl",
                                children: "📚"
                            }, void 0, false, {
                                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                                lineNumber: 126,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleBookmarkClick,
                        className: `absolute top-2 right-2 p-1.5 rounded-lg transition-colors ${isBookmarked ? "bg-sky-500 hover:bg-sky-600" : "bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-700"}`,
                        title: isBookmarked ? "Remove from wordlist" : "Add to wordlist",
                        children: isBookmarked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$solid$2f$esm$2f$BookmarkIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookmarkIcon$3e$__["BookmarkIcon"], {
                            className: "w-4 h-4 text-white"
                        }, void 0, false, {
                            fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                            lineNumber: 139,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BookmarkIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookmarkIcon$3e$__["BookmarkIcon"], {
                            className: "w-4 h-4 text-gray-400 dark:text-slate-500"
                        }, void 0, false, {
                            fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                            lineNumber: 141,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 h-14",
                children: category.name
            }, void 0, false, {
                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                lineNumber: 147,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2 h-10",
                children: category.subcategories.length > 0 ? category.subcategories.slice(0, 3).join(", ") : "Learn vocabulary in this category"
            }, void 0, false, {
                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex-1 h-1.5 ${levelColor.progressBg} rounded-full overflow-hidden`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `h-full ${levelColor.progressFill} rounded-full transition-all duration-500`,
                                    style: {
                                        width: `${progressPercent}%`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                                    lineNumber: 165,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                                lineNumber: 162,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs text-gray-400 dark:text-slate-500 min-w-[36px] text-right",
                                children: [
                                    learnedCount,
                                    "/",
                                    totalWords
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                                lineNumber: 170,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mb-4 pb-4 border-b border-gray-100 dark:border-slate-700 whitespace-nowrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BookOpenIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpenIcon$3e$__["BookOpenIcon"], {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                                        lineNumber: 178,
                                        columnNumber: 13
                                    }, this),
                                    category.wordCount,
                                    " Words"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                                lineNumber: 177,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1",
                                children: [
                                    category.subcategories.length,
                                    " Topics"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                                lineNumber: 181,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                        lineNumber: 176,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                onClick: (e)=>e.preventDefault(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: `/vocabulary/flashcards/${level}/${category.slug}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionButton, {
                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$RectangleStackIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RectangleStackIcon$3e$__["RectangleStackIcon"],
                            label: "Flashcards"
                        }, void 0, false, {
                            fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                            lineNumber: 193,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                        lineNumber: 192,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionButton, {
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$Squares2X2Icon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Squares2X2Icon$3e$__["Squares2X2Icon"],
                        label: "Learning Card"
                    }, void 0, false, {
                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionButton, {
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LanguageIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LanguageIcon$3e$__["LanguageIcon"],
                        label: "Match the pairs"
                    }, void 0, false, {
                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                        lineNumber: 196,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionButton, {
                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BookOpenIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpenIcon$3e$__["BookOpenIcon"],
                        label: "Spelling"
                    }, void 0, false, {
                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                        lineNumber: 197,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                lineNumber: 188,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
        lineNumber: 117,
        columnNumber: 5
    }, this);
}
function CEFRLevelPage() {
    const { level } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUser"])();
    const { getToken } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useAuth"])();
    const { learningLang } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLanguage"])();
    const [categories, setCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [progressMap, setProgressMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [bookmarkMap, setBookmarkMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const colors = levelColors[level] || levelColors.a1;
    // Modal state
    const [modalOpen, setModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [modalLoading, setModalLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedCategory, setSelectedCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isRemoveAction, setIsRemoveAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadCategories() {
            try {
                setIsLoading(true);
                setError(null);
                const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchCategoriesByLevel"])(level?.toUpperCase());
                // Deduplicate by slug in case the API returns duplicates
                const seen = new Set();
                const unique = (data.categories || []).filter((c)=>{
                    if (seen.has(c.slug)) return false;
                    seen.add(c.slug);
                    return true;
                });
                setCategories(unique);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setError("Failed to load categories. Please try again.");
            } finally{
                setIsLoading(false);
            }
        }
        loadCategories();
    }, [
        level
    ]);
    // Fetch progress for each category when user is available
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadProgress() {
            if (!user || categories.length === 0) return;
            const progressPromises = categories.map(async (category)=>{
                try {
                    const token = await getToken();
                    const progress = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$progressApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLessonProgress"])(token, learningLang, level, category.slug);
                    return {
                        slug: category.slug,
                        count: progress.learnedCount
                    };
                } catch  {
                    return {
                        slug: category.slug,
                        count: 0
                    };
                }
            });
            const results = await Promise.all(progressPromises);
            const map = {};
            results.forEach((r)=>{
                map[r.slug] = r.count;
            });
            setProgressMap(map);
        }
        loadProgress();
    }, [
        user,
        categories,
        level,
        getToken
    ]);
    // Check bookmark status for each category
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadBookmarkStatus() {
            if (!user || categories.length === 0) return;
            const bookmarkPromises = categories.map(async (category)=>{
                try {
                    const token = await getToken();
                    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$reviewCardsApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["checkCategoryBookmarked"])(token, level?.toUpperCase(), category.name);
                    return {
                        slug: category.slug,
                        isBookmarked: result.isBookmarked
                    };
                } catch  {
                    return {
                        slug: category.slug,
                        isBookmarked: false
                    };
                }
            });
            const results = await Promise.all(bookmarkPromises);
            const map = {};
            results.forEach((r)=>{
                map[r.slug] = r.isBookmarked;
            });
            setBookmarkMap(map);
        }
        loadBookmarkStatus();
    }, [
        user,
        categories,
        level,
        getToken
    ]);
    // Handle bookmark click - show modal
    const handleBookmarkClick = (category, isCurrentlyBookmarked)=>{
        setSelectedCategory(category);
        setIsRemoveAction(isCurrentlyBookmarked);
        setModalOpen(true);
    };
    // Handle modal confirm
    const handleConfirm = async ()=>{
        if (!user || !selectedCategory) return;
        setModalLoading(true);
        try {
            if (isRemoveAction) {
                // Remove all cards from this category
                const token = await getToken();
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$reviewCardsApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bulkRemoveFromReview"])(token, level?.toUpperCase(), selectedCategory.name);
                setBookmarkMap((prev)=>({
                        ...prev,
                        [selectedCategory.slug]: false
                    }));
            } else {
                // Fetch all words for this category and add them
                const vocabData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchVocabulary"])({
                    level: level?.toUpperCase(),
                    category: selectedCategory.slug
                });
                if (vocabData.words && vocabData.words.length > 0) {
                    const token = await getToken();
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$reviewCardsApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bulkAddToReview"])(token, level?.toUpperCase(), selectedCategory.slug, vocabData.words);
                    setBookmarkMap((prev)=>({
                            ...prev,
                            [selectedCategory.slug]: true
                        }));
                }
            }
        } catch (err) {
            console.error("Failed to update bookmark:", err);
        } finally{
            setModalLoading(false);
            setModalOpen(false);
            setSelectedCategory(null);
        }
    };
    // Loading state
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto px-4 py-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center min-h-[40vh]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                        }, void 0, false, {
                            fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                            lineNumber: 362,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 dark:text-slate-400",
                            children: "Loading categories..."
                        }, void 0, false, {
                            fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                            lineNumber: 363,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                    lineNumber: 361,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                lineNumber: 360,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
            lineNumber: 359,
            columnNumber: 7
        }, this);
    }
    // Error state
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto px-4 py-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center min-h-[40vh]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-red-500 mb-4",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                            lineNumber: 378,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>window.location.reload(),
                            className: "px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors",
                            children: "Retry"
                        }, void 0, false, {
                            fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                            lineNumber: 379,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                    lineNumber: 377,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                lineNumber: 376,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
            lineNumber: 375,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-7xl mx-auto px-4 py-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-bold text-gray-900 dark:text-white mb-2",
                        children: [
                            level?.toUpperCase(),
                            " Level Wordlist"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                        lineNumber: 395,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500 dark:text-slate-400",
                        children: [
                            "Explore ",
                            categories.length,
                            " vocabulary categories. Each category includes flashcards and exercises to help you master new words."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                        lineNumber: 398,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                lineNumber: 394,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
                children: categories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CategoryCard, {
                        category: category,
                        levelColor: colors,
                        level: level,
                        learnedCount: progressMap[category.slug] || 0,
                        isBookmarked: bookmarkMap[category.slug] || false,
                        onBookmarkClick: handleBookmarkClick
                    }, category.slug, false, {
                        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                        lineNumber: 407,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                lineNumber: 405,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$ConfirmationModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: modalOpen,
                onClose: ()=>setModalOpen(false),
                onConfirm: handleConfirm,
                isLoading: modalLoading,
                title: isRemoveAction ? "Remove from Wordlist" : "Add to Wordlist",
                message: isRemoveAction ? `Are you sure you want to remove all ${selectedCategory?.wordCount || 0} words from "${selectedCategory?.name}" from your wordlist?` : `Add all ${selectedCategory?.wordCount || 0} words from "${selectedCategory?.name}" to your wordlist for practice?`,
                confirmLabel: isRemoveAction ? "Remove All" : "Add All",
                variant: isRemoveAction ? "danger" : "primary"
            }, void 0, false, {
                fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
                lineNumber: 420,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/features/vocabulary/pages/CEFRLevelPage.tsx",
        lineNumber: 392,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_ca97c2df._.js.map
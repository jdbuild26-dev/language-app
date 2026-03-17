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
"[project]/src/services/assignmentsApi.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "completeAssignment",
    ()=>completeAssignment,
    "createAssignments",
    ()=>createAssignments,
    "getMyAssignments",
    ()=>getMyAssignments,
    "getStudentAssignments",
    ()=>getStudentAssignments,
    "getTaskOptions",
    ()=>getTaskOptions,
    "getTeacherAssignments",
    ()=>getTeacherAssignments
]);
const API_URL = ("TURBOPACK compile-time value", "https://language-backend-v8sy.onrender.com") || "http://localhost:8000";
async function createAssignments(assignmentData, token) {
    const response = await fetch(`${API_URL}/api/teachers/assign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(assignmentData)
    });
    if (!response.ok) {
        throw new Error("Failed to create assignments");
    }
    return response.json();
}
async function getMyAssignments(token, status = null, source = null, classId = null) {
    let url = `${API_URL}/api/students/me/assignments`;
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (source) params.append("source", source);
    if (classId) params.append("class_id", classId);
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch assignments");
    }
    return response.json();
}
async function getStudentAssignments(studentId, token) {
    const response = await fetch(`${API_URL}/api/teachers/students/${studentId}/assignments`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch student assignments");
    }
    return response.json();
}
async function completeAssignment(assignmentId, score, metadata = {}, token) {
    const response = await fetch(`${API_URL}/api/assignments/${assignmentId}/complete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            score,
            metadata
        })
    });
    if (!response.ok) {
        throw new Error("Failed to complete assignment");
    }
    return response.json();
}
async function getTeacherAssignments(token) {
    const response = await fetch(`${API_URL}/api/teachers/assignments`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch teacher assignments");
    }
    return response.json();
}
async function getTaskOptions(token) {
    const response = await fetch(`${API_URL}/api/assignments/task-options`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch task options");
    }
    return response.json();
}
}),
"[project]/src/app/dashboard/teachers/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MyTeachersPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/dist/chunk-XE3Y43DU.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/ProfileContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/vocabularyApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$assignmentsApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/assignmentsApi.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$AcademicCapIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AcademicCapIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/AcademicCapIcon.js [app-ssr] (ecmascript) <export default as AcademicCapIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronRightIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ChevronRightIcon.js [app-ssr] (ecmascript) <export default as ChevronRightIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ChevronDownIcon.js [app-ssr] (ecmascript) <export default as ChevronDownIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BookOpenIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpenIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/BookOpenIcon.js [app-ssr] (ecmascript) <export default as BookOpenIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClockIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClockIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroicons/react/24/outline/esm/ClockIcon.js [app-ssr] (ecmascript) <export default as ClockIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
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
function MyTeachersPage() {
    const { getToken } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$chunk$2d$XE3Y43DU$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useAuth"])();
    const { activeProfile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$ProfileContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProfile"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [teachers, setTeachers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [classesByTeacher, setClassesByTeacher] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [assignmentsByClass, setAssignmentsByClass] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [expandedTeacher, setExpandedTeacher] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [expandedClass, setExpandedClass] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function fetchData() {
            if (!activeProfile) return;
            try {
                setIsLoading(true);
                const token = await getToken();
                // 1. Fetch teachers for the current student profile
                const teacherData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchStudentTeachers"])(activeProfile.profileId, "active", token);
                setTeachers(teacherData);
                // 2. Fetch classes for the student
                const classData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$vocabularyApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchStudentClasses"])(activeProfile.profileId, token);
                // Group classes by teacher ID (clerkUserId or teacherId)
                const grouped = {};
                for (const cls of classData){
                    const tId = cls.teacherClerkId;
                    if (!grouped[tId]) grouped[tId] = [];
                    grouped[tId].push(cls);
                }
                setClassesByTeacher(grouped);
            } catch (error) {
                console.error("Failed to fetch teachers/classes:", error);
            } finally{
                setIsLoading(false);
            }
        }
        fetchData();
    }, [
        activeProfile,
        getToken
    ]);
    const toggleTeacher = (teacherClerkId)=>{
        setExpandedTeacher(expandedTeacher === teacherClerkId ? null : teacherClerkId);
    };
    const toggleClass = async (classId)=>{
        if (expandedClass === classId) {
            setExpandedClass(null);
            return;
        }
        setExpandedClass(classId);
        // Fetch assignments for this class if not already loaded
        if (!assignmentsByClass[classId]) {
            try {
                const token = await getToken();
                const assignments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$assignmentsApi$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMyAssignments"])(token, null, null, classId);
                setAssignmentsByClass((prev)=>({
                        ...prev,
                        [classId]: assignments
                    }));
            } catch (error) {
                console.error("Failed to fetch class assignments:", error);
            }
        }
    };
    const handleStartAssignment = (assignment)=>{
        // Reusing logic from AssignmentsPage or navigating to assignments with filter
        // For now, let's navigate to the specific exercise
        const slugMap = {
            choose_options: "/vocabulary/practice/choose-options",
            highlight_word: "/vocabulary/practice/highlight-word",
            odd_one_out: "/vocabulary/practice/odd-one-out",
            group_words: "/vocabulary/practice/group-words",
            fill_blank_typed: "/vocabulary/practice/fill-in-blank",
            correct_spelling: "/vocabulary/practice/correct-spelling",
            is_french_word: "/vocabulary/practice/is-french-word",
            four_options: "/grammar/practice/four-options",
            three_options: "/grammar/practice/three-options",
            two_options: "/grammar/practice/two-options",
            fill_blanks_options: "/grammar/practice/fill-blanks-options"
        };
        let path = slugMap[assignment.slug] || `/practice/reading/${assignment.slug.replace(/_/g, "-")}`;
        const params = new URLSearchParams();
        params.set("assignmentId", assignment.id);
        router.push(`${path}?${params.toString()}`);
    };
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-96 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                className: "h-8 w-8 animate-spin text-brand-blue-1"
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                lineNumber: 116,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/dashboard/teachers/page.tsx",
            lineNumber: 115,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-black text-white tracking-tight",
                        children: "My Teachers"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                        lineNumber: 124,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-slate-400 text-sm",
                        children: "View your connected teachers, classes, and assignments."
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                        lineNumber: 125,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                lineNumber: 123,
                columnNumber: 13
            }, this),
            teachers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                className: "bg-[#0f172a] border-slate-800 border-dashed py-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$AcademicCapIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AcademicCapIcon$3e$__["AcademicCapIcon"], {
                            className: "h-12 w-12 text-slate-700 mx-auto mb-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                            lineNumber: 131,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-bold text-white",
                            children: "No teachers connected"
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                            lineNumber: 132,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-slate-500 mt-2 max-w-xs mx-auto",
                            children: "Connect with a teacher using their ID or search via the Friends section to see your classes here."
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                            lineNumber: 133,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                    lineNumber: 130,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                lineNumber: 129,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: teachers.map((teacher)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden transition-all duration-300",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>toggleTeacher(teacher.clerkUserId),
                                className: "w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-12 w-12 rounded-full bg-brand-blue-1/20 flex items-center justify-center border border-brand-blue-1/30",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$AcademicCapIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AcademicCapIcon$3e$__["AcademicCapIcon"], {
                                                    className: "h-6 w-6 text-brand-blue-1"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                    lineNumber: 149,
                                                    columnNumber: 41
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                lineNumber: 148,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-left",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "font-bold text-white text-lg",
                                                        children: teacher.name || "Teacher"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                        lineNumber: 152,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-slate-500 uppercase tracking-widest font-bold",
                                                        children: [
                                                            "ID: ",
                                                            teacher.teacherId
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                        lineNumber: 153,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                lineNumber: 151,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                        lineNumber: 147,
                                        columnNumber: 33
                                    }, this),
                                    expandedTeacher === teacher.clerkUserId ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                        className: "h-5 w-5 text-slate-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                        lineNumber: 157,
                                        columnNumber: 37
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronRightIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__["ChevronRightIcon"], {
                                        className: "h-5 w-5 text-slate-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                        lineNumber: 159,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                lineNumber: 143,
                                columnNumber: 29
                            }, this),
                            expandedTeacher === teacher.clerkUserId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 pt-0 space-y-3 bg-slate-900/30 border-t border-slate-800",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "text-xs font-black text-slate-500 uppercase tracking-widest mt-4",
                                        children: "Enrolled Classes"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                        lineNumber: 166,
                                        columnNumber: 37
                                    }, this),
                                    classesByTeacher[teacher.clerkUserId]?.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid gap-3",
                                        children: classesByTeacher[teacher.clerkUserId].map((cls)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-xl border border-slate-700 bg-slate-800/40 overflow-hidden",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>toggleClass(cls.id),
                                                        className: "w-full flex items-center justify-between p-3 hover:bg-slate-700/40 transition-colors",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$BookOpenIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpenIcon$3e$__["BookOpenIcon"], {
                                                                        className: "h-5 w-5 text-brand-blue-1"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                        lineNumber: 177,
                                                                        columnNumber: 61
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-bold text-white text-sm",
                                                                        children: cls.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                        lineNumber: 178,
                                                                        columnNumber: 61
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                lineNumber: 176,
                                                                columnNumber: 57
                                                            }, this),
                                                            expandedClass === cls.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronDownIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                                                                className: "h-4 w-4 text-slate-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                lineNumber: 181,
                                                                columnNumber: 61
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChevronRightIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__["ChevronRightIcon"], {
                                                                className: "h-4 w-4 text-slate-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                lineNumber: 183,
                                                                columnNumber: 61
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                        lineNumber: 172,
                                                        columnNumber: 53
                                                    }, this),
                                                    expandedClass === cls.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-3 pt-1 space-y-2 bg-slate-900/50 border-t border-slate-700/50",
                                                        children: assignmentsByClass[cls.id]?.length > 0 ? assignmentsByClass[cls.id].map((assign)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/30",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "space-y-1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-sm font-bold text-white",
                                                                                children: assign.title
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                                lineNumber: 194,
                                                                                columnNumber: 77
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center gap-2 text-[10px] text-slate-500 font-bold",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ClockIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClockIcon$3e$__["ClockIcon"], {
                                                                                        className: "h-3 w-3"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                                        lineNumber: 196,
                                                                                        columnNumber: 81
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        children: [
                                                                                            "DUE: ",
                                                                                            assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : 'NO DEADLINE'
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                                        lineNumber: 197,
                                                                                        columnNumber: 81
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: `px-2 py-0.5 rounded-full border ${assign.status === 'completed' ? 'text-green-500 border-green-500/30 bg-green-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'}`,
                                                                                        children: assign.status.toUpperCase()
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                                        lineNumber: 198,
                                                                                        columnNumber: 81
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                                lineNumber: 195,
                                                                                columnNumber: 77
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                        lineNumber: 193,
                                                                        columnNumber: 73
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                                        size: "sm",
                                                                        variant: "ghost",
                                                                        className: "h-8 text-[10px] font-black uppercase text-brand-blue-1 hover:text-white",
                                                                        onClick: ()=>handleStartAssignment(assign),
                                                                        children: assign.status === 'completed' ? 'Review' : 'Start'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                        lineNumber: 204,
                                                                        columnNumber: 73
                                                                    }, this)
                                                                ]
                                                            }, assign.id, true, {
                                                                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                                lineNumber: 192,
                                                                columnNumber: 69
                                                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-slate-500 text-center py-4",
                                                            children: "No assignments for this class yet."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                            lineNumber: 215,
                                                            columnNumber: 65
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                        lineNumber: 189,
                                                        columnNumber: 57
                                                    }, this)
                                                ]
                                            }, cls.id, true, {
                                                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                                lineNumber: 171,
                                                columnNumber: 49
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                        lineNumber: 169,
                                        columnNumber: 41
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-slate-500 bg-slate-800/20 rounded-xl p-4 text-center border border-dashed border-slate-700",
                                        children: "You are not enrolled in any specific classes with this teacher yet."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                        lineNumber: 223,
                                        columnNumber: 41
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                                lineNumber: 165,
                                columnNumber: 33
                            }, this)
                        ]
                    }, teacher.clerkUserId, true, {
                        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                        lineNumber: 141,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/teachers/page.tsx",
                lineNumber: 139,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/teachers/page.tsx",
        lineNumber: 122,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=src_f6600728._.js.map
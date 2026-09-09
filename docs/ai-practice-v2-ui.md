# AI Practice v2 learner interface

The conversation preview keeps the assigned scenario visible and expands its English translation beneath the original text. During a conversation, translations and corrections appear beneath their source messages without replacing them. Translation uses a pale yellow chat bubble, while corrections retain word-level highlighting without a label.

The conversation header displays both the CEFR code and learner-friendly level name. Its translation control switches the title and learner instruction between the original language and English without adding a second block. After the configured turn limit, the page places the completed transcript and its aligned header in one panel and feedback in a separate panel. The API contract is unchanged.

The full feedback report uses a focused full-screen layout without the application chrome or AI Practice tabs. A dedicated “Back to conversation” button returns the learner to the previous conversation view.

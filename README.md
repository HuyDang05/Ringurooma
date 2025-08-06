# リングローマ (Ringurooma) - A website for evaluating Japanese speaking skills

*P/s: This project is using its own custom speech service at [here](https://github.com/PhDoanh/speech-service)*

Introduction
---------------

**Ringurooma** is a web-based platform designed to help users improve their Japanese speaking skills using AI-driven scoring and personalized feedback. Powered by Azure AI, the system evaluates pronunciation, fluency, and prosody, then delivers constructive suggestions tailored to each learner.

Key Features
---------------

-   **Prompt-based Speaking Practice**: Choose a topic, speak, and receive instant feedback.

-   **Accurate Pronunciation Scoring**: Analyze accuracy, fluency, and prosody, and estimate JLPT level.

-   **AI Feedback**: Interactive AI chatbot gives scores, strength/weakness analysis, and improvement tips.

-   **Personalized Experience**: Customize chatbot tone and learning style based on user profile.

-   **Shadowing and Intent Recognition Support**: Practice native-like speech and let AI understand your learning intent.

Problems Solved
------------------

-   Most Japanese learners in Vietnam struggle with speaking due to lack of effective tools.

-   80% of existing apps (e.g., Duolingo, Memrise) focus only on vocabulary/grammar, while HelloTalk lacks personalization.

-   Ringurooma bridges this gap by combining interaction with AI-based assessment and feedback.

System Architecture
----------------------

-   **Frontend**: Appsmith (low-code)

-   **Backend**: n8n (workflow automation)

-   **AI Service**: Ringurooma Speech Service (custom proxy to Azure AI)

-   **Cloud AI**: Azure Speech & Language Services

-   **Database**: PostgreSQL

-   **Architecture**: Hybrid (Client-Server + Service-Oriented)

-   **Languages**: HTML, CSS, JavaScript, Python

Demo Video
-------------

Watch a full walkthrough of Ringurooma in action:

> Replace `your_demo_video_id` with the actual YouTube video ID once available.

Testing
----------

> Cypress is used for automated testing of UI flows including login, signup, chat interaction.

Test Coverage:

Architecture Decisions & System Decomposition
------------------------------------------------

-   Hybrid architecture enables separation of frontend/backend for scalable development

-   Low-code platforms (Appsmith, n8n) enable fast iteration with minimal technical overhead

-   Ringurooma Speech Service acts as a reusable, standalone API layer for speech assessment

References
-------------

-   Statista, JLPTSensei, Vietnam Market Research

-   Microsoft Azure AI SDK

-   Detailed Documentation (PDF)





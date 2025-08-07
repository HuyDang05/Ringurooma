# Database Design

The Ringurooma platform uses a relational database to manage users, speaking sessions, scripts, topics, and evaluation results. Below is a detailed description of the schema and relationships based on the ERD:

## Tables & Fields

### User
- **user_id** (int, PK, NOT NULL): Unique identifier for each user
- **username** (varchar(50), NOT NULL): User's login name
- **password** (varchar(50), NOT NULL): User's password (hashed)
- **bio** (text): User biography
- **chat_custom** (text): Custom chatbot settings

### Session
- **session_id** (int, PK, NOT NULL): Unique session identifier
- **user_id** (int, FK, NOT NULL): References User(user_id)
- **audio_url** (varchar(255), NOT NULL): Path to user's audio recording

### Result
- **result_id** (int, PK, NOT NULL): Unique result identifier
- **session_id** (int, FK, NOT NULL): References Session(session_id)
- **script_id** (int, FK): References Script(script_id)
- **overall_score** (double precision, NOT NULL): Overall evaluation score
- **feedback** (text, NOT NULL): AI-generated feedback
- **time** (timestamp): Evaluation time
- **accuracy_score** (double precision, NOT NULL)
- **fluency_score** (double precision, NOT NULL)
- **pronunciation_score** (double precision, NOT NULL)
- **prosody_score** (double precision, NOT NULL)
- **speed_wpm** (double precision): Words per minute
- **level** (varchar(50)): Level name

### Script
- **script_id** (int, PK, NOT NULL): Unique script identifier
- **content** (text, NOT NULL): Script text
- **topic_id** (int, FK, NOT NULL): References Topic(topic_id)
- **level** (varchar(50), FK): References Level(level)
- **popularity** (int): Popularity metric

### Topic
- **topic_id** (int, PK, NOT NULL): Unique topic identifier
- **topic** (varchar(255), NOT NULL): Topic name

### Level
- **level** (varchar(50), PK, NOT NULL): Level name (e.g., JLPT N5, N4, etc.)
- **speed** (varchar(50), NOT NULL): Recommended speaking speed

## Relationships
- A **User** can have multiple **Sessions**
- A **Session** belongs to one **User** and can have multiple **Results**
- A **Result** is linked to one **Session** and one **Script**
- A **Script** belongs to one **Topic** and one **Level**
- A **Topic** can have multiple **Scripts**
- A **Level** can have multiple **Scripts**

---

This schema supports user management, speaking session tracking, script categorization, and detailed AI-driven evaluation results.

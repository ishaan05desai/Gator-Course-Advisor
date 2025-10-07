# Gator Course Advisor - Data Scheme
The goal of the project is to help students find the best courses for them at UF.

# Sources
- **One.UF** - official course listings, code, credits, instructor, descriptions...
- **RateMyProfessor** - level of difficulty, course ratings, professor ratings.

# Dataset Overview
Each row represents one course.
Data will be combined from One.UF (official) and RateMyProfessor (Student reviews)

# Columns and Data Types
Column Name     | Data Type     | Description                 | Example
----------------|---------------|-----------------------------| --------------------------------------------------
code            | str           | indentifier of course (code)| "CDA3101"
courseId        | int           | number identifier           | 024718  
course_name     | str           | Name of Course              | "Computer Organization and Architecture"
prerequi        | str           | Prerequisites               | "COP3503"
prof_name       | str           | Name of instructor          | "Marvin Andujar"
course_descri   | str           | Description of Course       | "Organization of computing systems..."
meeting_times   | str           | Days of the week and time   | "9:30am Wednesday"
meeting_place   | str           | building                    | "Turlington hall"
credits         | int           | how many credits            | 3
department      | str           | department of course        | "Computer & Information Science & Engineering"
overall_rating  | float         | Overall rating- Ratemp      | 4.1
diff_rating     | float         | difficulty rating Ratemyp   | 4.2
professor_id    | int           | Id of prof in ratemyp       | 2384893
term_offered    | int           | 0 fall, 1 spring, 2 summer  | 0
acadStage       | int           | 0 for undergrad 1 for grad  | 0

# Cleaning Notes
- Instructor names - differentiate between TA, actual professor or head of course.
- Some courses and professor do NOT have a RateMyProfessor data.
- differet places and times.
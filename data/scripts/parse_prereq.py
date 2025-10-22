import pandas as pandas
import re
from pathlib import Path

csv_path = Path(__file__).resolve().parents[2] / 'CourseData.csv'

# Read the CSV file
course_data = pandas.read_csv(csv_path, usecols=['Prerequisites'])
print(course_data)
    
def extract_prereqs(prereq):
    # if nothing is listed as a prerequisite
    if pandas.isna(prereq):
        return []
    
    #find everything after "Prereq: "
    match = re.search(r"(?:(?<=Prereq: )|(?<=Coreq: ))(.*)", prereq, re.I)

    if not match:
        return []
    
    prereq = match.group(1)

    # Remove parentheses and periods
    prereq = re.sub(r"[().]", " ", prereq)

    # split by 'and', 'or', commas, semicolons
    parts =  re.split(r"\b(?:and|or)\b|[,;/]", prereq, flags=re.I)

    cleaned = []
    for part in parts:
        part = part.strip()
        if not part:
            continue

        codes = re.findall(r"[A-Z]{2,4}\s?\d{4}[A-Z]?", part)
        if codes:
            for code in codes:
                cleaned.append(code.replace(" ", ""))

    return cleaned

# Iterate over the 'Prerequisites' column and call the function
for prereq_string in course_data['Prerequisites']:
    extracted_prereqs = extract_prereqs(prereq_string)
    print(extracted_prereqs)
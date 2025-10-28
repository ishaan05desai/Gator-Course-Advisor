import pandas as pd
import re
from pathlib import Path

csv_path = Path(__file__).resolve().parents[2] / 'CourseData.csv'

# Read the CSV file
course_data = pd.read_csv(csv_path, usecols=['Prerequisites'])
    
def extract_prereqs(prereq):
    # If nothing is listed as a prerequisite
    if pd.isna(prereq):
        return []
    
    # Find everything after "Prereq: "
    match = re.search(r"(?:(?<=Prereq: )|(?<=Coreq: ))(.*)", prereq, re.I)

    if not match:
        return []
    
    prereq = match.group(1)

    # Remove parentheses and periods
    prereq = re.sub(r"[().]", " ", prereq)

    # Split by 'and', 'or', commas, semicolons
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

# Iterate over the 'Prerequisites' column and call the function. Printing the results
for prereq_string in course_data['Prerequisites']:
    extracted_prereqs = extract_prereqs(prereq_string)
    print(extracted_prereqs)

# Iterate over the 'Prerequisites' column and call the function. Returning a list of lists
# onlyprereqs = []
# for prereq_string in course_data['Prerequisites']:
#     onlyprereqs.append(extract_prereqs(prereq_string))
# print("List of lists of prerequisites: ")
# print(onlyprereqs)
    
# If we want to make another csv data file.
# prereqs = course_data['Prerequisites'].apply(extract_prereqs)
# output_csv_path = Path(__file__).resolve().parents[2] / 'Only_PreReqs.csv'
# prereqs.to_csv(output_csv_path, index=False)

# If we want to delete the empty rows (ex.: [])
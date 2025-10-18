import requests

URL = "https://one.uf.edu/apix/soc/schedule"
term = "2258"
dept_codes = {}

#API won't return all courses at once. Filter through starting letter.
for prefix in [chr(i) for i in range(ord('A'), ord('Z')+1)]:  
    parameters = {"term": term, "course-code": prefix}
    response = requests.get(URL, params=parameters)
    if response.ok:
        data = response.json()
        if isinstance(data, list) and data and "COURSES" in data[0]:
            for course in data[0]["COURSES"]:
                for section in course.get("sections", []):
                    dept_code = section.get("deptCode")
                    dept_name = section.get("deptName")
                    if dept_code:
                        dept_codes[dept_name] = dept_code
                            
dept_codes = dict(sorted(dept_codes.items()))
for dept in dept_codes:
    code = dept_codes[dept]
    print(f"\"{dept}\" : \"{code}\",")

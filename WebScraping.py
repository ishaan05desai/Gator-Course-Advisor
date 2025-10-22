from typing import List
import requests
import csv
from DeptCodes import dept_codes

# For term number, the first 3 digits represents year. 225 = 2025. Last digit is season. 1 = Spring, 5 = Summer, 8 = Fall. 2258 = Fall 2025
# The departments list should contain key values from the DeptCodes.py file
def writeDeptData(term: int, departments: List[str]): 

    #All data storage lists
    course_codes = []
    course_names = []
    course_descriptions = []
    course_prerequisites = []
    course_instructors = []
    course_meet_times = []
    course_credit_hours = []
    course_department = []
    course_headers = ["Code", "Name", "Description", "Prerequisites", "Instructors", "Meet Times", "Credit Hours", "Department"]
    
    for department in departments:
        #ONE.UF API URL. Normal URL does not work since website is dynamically loaded
        URL = "https://one.uf.edu/apix/soc/schedule?"
        filter_parameters = {
            "term": term, 
            "dept": dept_codes.get(department), # Department codes are stored as dictionary in DeptCodes.py
        } 

        response = requests.get(URL, params=filter_parameters, stream=True)
        data = response.json()
        
        #Retrieves courses dictionary from data. dataLayout.txt file shows how data is organized
        courses = data[0]["COURSES"]

        for course in courses:
            course_codes.append(course.get("code"))
            course_names.append(course.get("name"))
            course_descriptions.append(course.get("description"))
            course_prerequisites.append(course.get("prerequisites"))
            
            # Safety check as sometimes no instructor is listed which can cause index errors
            if course.get("sections")[0].get("instructors"):
                course_instructors.append(course.get("sections")[0].get("instructors")[0].get("name"))
            else:
                course_instructors.append("No instructor listed")
                
            course_meet_times.append(course.get("sections")[0].get("meetTimes")) 
            course_credit_hours.append(course.get("sections")[0].get("credits"))
            course_department.append(course.get("sections")[0].get("deptName"))

    #Write all data to csv file
    with open('CourseData.csv', 'w', newline="", encoding = "utf-8") as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(course_headers)
        for i in range(len(course_codes)):
            csvwriter.writerow([course_codes[i], course_names[i], course_descriptions[i], course_prerequisites[i], 
                                course_instructors[i], course_meet_times[i], course_credit_hours[i], course_department[i]])

writeDeptData(2258, ["Chemical Engineering", "Computer & Information Science & Engineering", "History", "English"])
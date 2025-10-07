import requests
import csv

#ONE.UF CIS API URL. Normal URL does not work since website is dynamically loaded
URL = "https://one.uf.edu/apix/soc/schedule?ai=false&auf=false&category=UFOL&class-num=&course-code=&course-title=&cred-srch=&credits=&day-f=&day-m=&day-r=&day-s=&day-t=&day-w=&dept=19140000&eep=&fitsSchedule=false&ge=&ge-b=&ge-c=&ge-d=&ge-h=&ge-m=&ge-n=&ge-p=&ge-s=&instructor=&last-control-number=0&level-max=&level-min=&no-open-seats=false&online-a=&online-c=&online-h=&online-p=&period-b=&period-e=&prog-level=&qst-1=&qst-2=&qst-3=&quest=false&term=2251&wr-2000=&wr-4000=&wr-6000=&writing=false&var-cred=&hons=false"
response = requests.get(URL)
data = response.json()

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

#Retrieves courses dictionary from data. dataLayout.txt file shows how data is organized
courses = data[0]["COURSES"]

for course in courses:
    course_codes.append(course.get("code"))
    course_names.append(course.get("name"))
    course_descriptions.append(course.get("description"))
    course_prerequisites.append(course.get("prerequisites"))
    course_instructors.append(course.get("sections")[0].get("instructors")[0].get("name"))
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

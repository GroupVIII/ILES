# Customer User Model
# Customer User Model
# Parent class
class User:
  def __init__(self, username,password):
    self.username = username
    self.password = password
  def login(self, username,password):
       if self.username == username and self.password == password:
            return True
       return False

# Student class
class Student(User):
  def student_dashboard(self):
    print("\n------Student Dashboard-----"):
    print("1. Log Daily Internship Activity")
    print("2. View Feedback")
    print("3. Submit report")

# University SUpervisor class
class UniversitySupervisor(User):
  def supervisor_dashboard(self):
    print("\n------University Supervisor------")
    print("1. View Student Logs")
    print("2. Evaluate Student")
    print("3. Provide Feedback")
# Industry Supervisor
class IndustrySupervisor(User):
  def industrysupervisor(self):
    print("\n----------Industry Supervisor--------")



































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
    print("\n------University Supervisor------"):
    print("1. View Student Logs")
    print("2. Evaluate Student")
    print("3. Provide Feedback")
# Industry Supervisor class
class IndustrySupervisor(User):
  def industry_dashboard(self):
    print("\n------ Supervisor Dashboard------")
    print("1. Confirm Student Attendance")
    print("2. Evaluate Intern Performance")
    print("3. Approve Daily Logs")

# System Administration class
class SystemAdministrator(User):
    def admin_dashboard(self):
      print("\n------System Administration Dasboard------")
      print("1. Manage Users")
      print("2. Generate Reports")
      print("3. Maintain System")

# Sample Users
student = Student("student1", "1234")
university_supervisor = UniversitySupervisor("lecturer1", "abcd")
industry_supervisor = IndustrySupervisor("manager1", "5678")
admin = SystemAdministrator("admin", "admin123")

# MENU
def main():
    while True:
        print("\n--------------ILES LOGIN SYSTEM---------------")
        print("1. Student Login")
        print("2. University Supervisor Login")
        print("3. Industry Supervisor Login")
        print("4. System Administrator Login")
        print("5. Exit")

        choice = input("Select user type")
        username = input("Enter username: ")
        password = input("Enter password: ")

        if choice == "1":
            if student.login(username, password):
                student.student_dashboard()
            else:
                print("Invalid student login!")
        
        elif choice == "2":
            if university_supervisor.login(username, password):
                university_supervisor.supervisor_dashboard()
            else:
                print("Invalid university supervisor login!")
              
        elif choice == "3":
            if industry_supervisor.login(username, password):
                 industry_supervisor.industry_dashboard()
            else:
                print("Invalid industry supervisor login!")
        
        elif choice == "4":
            if admin.login(username, password):
                admin.admin_dashboard()
            else:
                print("Invalid administrator login!")

        elif choice == "5":
            print("Exiting system........")
            break
         
        else:
            print("Invalid option. Try again")

# Run program
main()



































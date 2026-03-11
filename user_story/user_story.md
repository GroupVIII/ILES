# USER STORIES: INTERNSHIP LOGGING AND EVALUATION SYSTEM

---

## AUTHENTICATION AND USER MANAGEMENT

**US-101** | Priority: High
> "As a user (interns and supervisors), I want to log in using my company email password so that I can access the system securely."

**US-102** | Priority: High
> "As a user, I want to reset my password via email if I forget it so that I can regain access to my account"

**US-103** | Priority: High
> "As an admin, I want to create new intern accounts with their basic details so that they can start logging hours."

**US-104** | Priority: High
> "As an admin, I want to assign interns to specific supervisors during account creation so that the right supervisor has oversight."

**US-105** | Priority: Medium
> "As an admin, I want to deactivate user accounts when an internship ends so that former interns cannot access the system."

**US-106** | Priority: Low
> "As a user, I want to update my profile information so that my details remain current"

---

## DAILY LOGGING AND TIMESHEETS

**US-201** | Priority: High
> "As an intern, I want to log my daily work hours by entering start time, end time, and total hours so that I can track my attendance."

**US-202** | Priority: High
> "As an intern, I want to add a description of tasks completed for each log entry so that my supervisor knows the task that I have worked on"

**US-203** | Priority: High
> "As an intern, I want to attach files and links to my log entries as proof of work"

**US-204** | Priority: High
> "As an intern, I want to view my total accumulated hours on my dashboard so that I know how close I am to completing tasks."


**US-205** | Priority: Medium
> "As an intern, I want to edit my log entries for the current week so that I can correct mistakes"

**US-206** | Priority: Low
> "As an intern, I want to add tags to my log entries so that I can organize my work"

## WEEKLY REPORTS AND SUBMISSIONS 

**US-301** | Priority: High 
> "As an intern, I want to generate a weekly summary report that compiles all my log entries for the week so that I don’t have to retype everything." 

**US-302** | Priority: Medium 
> "As an intern, I want to add goals for the next week to my weekly report so that my supervisor knows my focus areas." 

**US-303** | Priority: High 
> "As an intern, I want to submit my weekly report to my supervisor for review with one click." 

**US-304** | Priority: High 
> "As a supervisor, I want to view a list of pending weekly reports submitted by my interns so that I know what needs my attention." 

**US-305** | Priority: High 
> "As a supervisor, I want to approve or reject a weekly report with optional comments so that interns know their work is acknowledged." 

**US-306** | Priority: Medium 
> "As an intern, I want to receive a notification when my supervisor approves or comments on my report." 

---

## MONITORING AND DASHBOARD 

**US-401** | Priority: High 
> "As a supervisor, I want to see a dashboard of all interns assigned to me so that I can monitor them briefly and immediately." 

**US-402** | Priority: High 
> "As a supervisor, I want to see who has not logged hours todays or this week so that I can follow up with them." 

**US-403** | Priority: High 
> "As a supervisor, I want to view an individual intern’s complete log history in chronological order." 

**US-404** | Priority: Medium 
> "As a supervisor, I want to filter logs by date range or tag so that I can focus on specific periods or activities." 

**US-405** | Priority: High 
> "As a supervisor, I want to add comments to any log entry so that I can provide timely feedback." 

**US-406** | Priority: Low 
> "As a supervisor, I want to receive alerts when an intern has not logged hours for 3 consecutive days."

---

## EVALUATION & PERFORMANCE 
*Focus: Formal assessment of intern performance.* 

**US-501** | Priority: High 
> "As an admin, I want to create customizable evaluation templates with different criteria (e.g., Technical Skills, Communication, Punctuality)." 

**US-502** | Priority: High 
> "As a supervisor, I want to complete a mid-point evaluation for each intern using the defined template." 

**US-503** | Priority: High 
> "As a supervisor, I want to complete an end-point evaluation with final ratings and comments." 

**US-504** | Priority: High 
> "As a supervisor, I want to rate interns on a scale (e.g., 1-5) for each evaluation criterion." 

**US-505** | Priority: Medium 
> "As a supervisor, I want to add a final recommendation note (e.g., 'Would hire,' 'Needs improvement') to the evaluation." 

**US-506** | Priority: Medium 
> "As an intern, I want to view my completed evaluations so that I can see my performance feedback." 

**US-507** | Priority: Low 
> "As an admin, I want to set evaluation due dates and send reminders to supervisors." 

---

## NOTIFICATIONS & ALERTS 
*Focus: Keeping everyone informed.* 

**US-601** | Priority: High 
> "As a user, I want to receive email notifications for important events (report submitted, feedback received)." 

**US-602** | Priority: Medium 
> "As a user, I want to see in-app notifications in a bell icon dropdown." 

**US-603** | Priority: High 
> "As a supervisor, I want to get notified immediately when an intern submits a weekly report." 

**US-604** | Priority: High 
> "As an intern, I want to get notified when my supervisor leaves feedback or approves my report." 

**US-605** | Priority: Low 
> "As a user, I want to customize my notification preferences (email vs. in-app only)." 

---

## REPORTING AND ANALYTICS

**US-701** | Priority: High
>"As an admin, I want to generate a report of all logged hours for a specific date range so that I can process stipends or university credits."

**US-702** | Priority: High
>"As a admin, I want to export reports to CSV/Excel so that I can manipulate data in spreadsheets."

**US-703** | Priority:Medium
>"As an admin, I want to view a summsry of completed evaluatiion for all interns."

**US-704** | Priority: Medium
>"As an admin, I want to filter reports by department, supervisor, or intern so that I can narrow down results."

**US-705** | Priority: Low
>"As an admin, I want to see audit logs of who viewed or modified intern records."

---

## SYSTEM CONFIGURATION

**US-801** | Priority: High
>"As an admin, I want to define the internship period for each intern or cohort."

**US-802** | Priority: High
>"As an admin, I want to set the total required hours for the internship program."

**US-803** | Priority: Medium
>"As an admin, I want to create and manage departments."

**US-804** | Priority: High
>"As an admin, I want to configure the evaluation rubric."

---

## FUNCTIONAL REQUIREMENTS

### 1. Authentication and Access Control
* The system should allow users to authenticate using their official company email and password.
* The system should provide a secure, email-based password reset mechanism.
* The system should empower administrators to provision new intern accounts and assign them to designated supervisors.
* The system should enable administrators to deactivate user accounts upon the completion of an internship programme.
* The system should permit users to update their personal profile information.

### 2. Activity Logging and Timesheets
* The system should capture daily log entries, including start times, end times, and automatically calculated total hours.
* The system should require text descriptions for all logged tasks.
* The system should support the attachment of files and external hyperlinks as proof of work.
* The system should display real-time accumulated hours on the intern dashboard.
* The system should allow interns to edit log entries within the current week's timeframe.
* The system should support custom tagging for the categorisation of log entries.

### 3. Reporting and Workflows
* The system should automatically compile weekly log entries into a unified summary report.
* The system should allow interns to append future goals to their weekly reports.
* The system should facilitate a single-click submission workflow for weekly reports.
* The system should provide supervisors with a queue of pending reports requiring review.
* The system should grant supervisors the authority to approve or reject reports, with mandatory fields for explanatory comments.

### 4. Monitoring and Dashboards
* The system should generate a consolidated dashboard for supervisors to monitor all assigned interns.
* The system should explicitly flag interns who fail to log hours on a daily or weekly basis.
* The system should display individual intern log histories in strict chronological order.
* The system should provide dynamic filtering capabilities based on date ranges and custom tags.
* The system should allow supervisors to attach feedback comments to any specific daily log entry.

### 5. Evaluation and Performance
* The system should provide customisable evaluation templates featuring varied criteria, such as Technical Skills and Communication.
* The system should require supervisors to execute structured mid-point and end-point evaluations.
* The system should capture supervisor ratings on a numerical scale for each predefined criterion.
* The system should allow supervisors to append final recommendation notes to evaluations.
* The system should grant interns read-only access to their completed performance evaluations.
* The system should allow administrators to configure evaluation due dates and trigger automated reminders.

### 6. Notifications and Alerts
* The system should dispatch automated email alerts for critical workflow events, such as report submissions and feedback delivery.
* The system should maintain an in-app notification centre accessible via a top-navigation bell icon.
* The system should instantly notify supervisors upon the submission of a weekly report.
* The system should instantly notify interns when a supervisor approves a report or submits feedback.
* The system should allow users to configure and customise their individual notification preferences.

### 7. Reporting and Analytics
* The system should generate aggregated reports of logged hours across specified date ranges.
* The system should export analytical reports in CSV and Excel formats.
* The system should display a high-level summary of all completed evaluations for administrative review.
* The system should support data filtering by department, supervisor, or individual intern.
* The system should maintain an immutable audit log detailing user access and modifications to intern records.

### 8. System Configuration
* The system should allow administrators to define specific date parameters for internship cohorts.
* The system should allow administrators to establish the total required hours for programme completion.
* The system should provide tools for the creation and management of distinct organisational departments.
* The system should allow administrators to configure and modify the global evaluation rubric.

---

## NON-FUNCTIONAL REQUIREMENTS
### 1. Security
* All user passwords must be hashed and salted using industry-standard cryptographic protocols before database storage.
* The system must strictly enforce permissions. An intern must never access administrative configuration panels. A supervisor must only view data for their assigned interns.
* The system must automatically terminate user sessions after 30 minutes of absolute inactivity to prevent unauthorised access.

### 2. Performance
* Dashboard rendering and log submissions must execute in under 2 seconds under normal network conditions.
* CSV/Excel report generation for up to 1,000 records must complete within 5 seconds.

### 3. Usability
* The user interface must adapt flawlessly to mobile, tablet, and desktop viewports. Interns will often log hours via mobile devices on their commute.
* The core workflow (logging hours, submitting reports) must require zero formal training for a new user to comprehend.

### 4. Reliability
* The system must maintain a 99.9% uptime during standard business hours.
* Automated, encrypted backups of the database must occur daily at midnight. No logged hour can ever be lost to a server fault.

1. Problem Statement
Managing student internships is currently a chaotic, paper-heavy nightmare. Institutions still rely heavily on physical logbooks and email submissions, which frequently leads to lost records and delayed supervisor feedback. Academic supervisors waste hours manually calculating grades because there is no automated mechanism to compute weighted evaluations. Without a centralised tracking system, there is no reliable way to monitor real-time performance, track deadlines, or resolve missing marks efficiently. To solve this, a workflow-driven, role-based digital system is required.

2. Project Scope
We will develop the Internship Logging & Evaluation System (ILES), a web application built with Django for the backend (the brain) and React for the frontend (the user interface).
In Scope:
•	Role Management: Secure access control for four core users: Student Interns, Workplace Supervisors, Academic Supervisors, and Internship Administrators.
•	Internship Placement Module: A system to handle internship assignment and prevent conflicting date ranges for student placements.
•	Logbook Workflow: A module for interns to submit weekly logs through structured state transitions (Draft, Submitted, Reviewed, and Approved), lock editing after approval and enforce submission deadlines.
•	Supervisor Review Workflow: Tools for workplace supervisors to review logs, leave comments and enforce valid state changes with an audit trail of the status history.
•	Academic Evaluation Module: A specific module for academic supervisors to submit and prevent duplicate evaluations of the interns.
•	Automated Grading: System-computed weighted scores that calculate total scores and prevent double submissions.
•	Dashboards & Reporting: Real-time reporting interfaces using data aggregation to build student progress dashboards, admin statistics, and supervisor pending reviews.
Out of Scope:
•	Financial allowance or payment processing.
•	Placement matching algorithms or integration with external university Enterprise Resource Planning (ERPs).
•	Native mobile application development.
•	Physical supervision visit tracking.
•	Job-hunting boards or resume builders.

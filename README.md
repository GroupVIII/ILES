# Internship Logging & Evaluation System (ILES)

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Django](https://img.shields.io/badge/Backend-Django_REST-092E20?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

## Problem Statement
Managing student internships is currently a chaotic, paper-heavy nightmare. Institutions still rely heavily on physical logbooks and email submissions, which frequently leads to lost records and delayed supervisor feedback. Academic supervisors waste hours manually calculating grades because there is no automated mechanism to compute weighted evaluations. Without a centralised tracking system, there is no reliable way to monitor real-time performance, track deadlines, or resolve missing marks efficiently. To solve this, a workflow-driven, role-based digital system is required.

## Project Scope
The Internship Logging & Evaluation System (ILES) is a full-stack web application built with Django (REST API) for the backend and React for the interactive frontend.

### In Scope
* **Role Management:** Secure access control for four core users: Student Interns, Workplace Supervisors, Academic Supervisors, and Internship Administrators.
* **Internship Placement Module:** A system to handle internship assignment and prevent conflicting date ranges for student placements.
* **Logbook Workflow:** A module for interns to submit weekly logs through structured state transitions (Draft, Submitted, Approved/Rejected), locking edits after submission and enforcing deadlines.
* **Supervisor Review Workflow:** Tools for workplace supervisors to review logs, leave mandatory feedback, and enforce valid state changes with an audit trail.
* **Academic Evaluation Module:** A specific module for academic supervisors to score students against a dynamic rubric and prevent duplicate evaluations.
* **Automated Grading:** System-computed weighted scores that calculate final grades dynamically based on administrative criteria.
* **Dashboards & Reporting:** Real-time reporting interfaces using data aggregation (Recharts) to build student progress dashboards, admin statistics, and supervisor action centres.
* **Notification System:** Automated in-app alerts (and SMTP email triggers) for critical workflow events like log approvals.

### Out of Scope
* Financial allowance or payment processing.
* Placement matching algorithms or integration with external university ERPs.
* Native mobile application development.
* Physical supervision visit tracking.
* Job-hunting boards or resume builders.

---

## Tech Stack
* **Frontend:** React (Vite), React Router, Axios, Recharts (Data Visualization), React-Toastify
* **Backend:** Django, Django REST Framework (DRF), SimpleJWT (Authentication)
* **Database:** PostgreSQL / SQLite (Local)

---

## Local Installation & Setup

### Prerequisites
* Node.js (v18+)
* Python (3.10+)

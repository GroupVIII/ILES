# INTERNSHIP LOGGING AND EVALUATION SYSTEM (ILES)

---

## 1. AUTHENTICATION & USER MANAGEMENT

**US-101** | Priority: High
> "As a user, I want to securely log in using my username and password to access my role-specific dashboard."

**US-102** | Priority: High
> "As an administrator, I want to use the Master Directory to register new user profiles and explicitly assign their role (Student, Workplace Supervisor, Academic Supervisor, or Admin)."

**US-103** | Priority: High
> "As an administrator, I want to permanently delete user accounts from the system directory to revoke access and remove their associated data."

---

## 2. INTERNSHIP PLACEMENTS & SYSTEM CONFIGURATION

**US-201** | Priority: High
> "As an administrator, I want to create an internship placement by linking a student to a specific company and defining strict start and end dates."

**US-202** | Priority: High
> "As an administrator, I want to use the Global Placement Matrix to assign or reassign Academic and Workplace Supervisors to a student's placement."

**US-203** | Priority: High
> "As an administrator, I want to define global Evaluation Criteria (name, description, and percentage weight) while the system strictly enforces that the total weight cannot exceed 100%."

**US-204** | Priority: Medium
> "As an administrator, I want to edit or delete existing evaluation criteria before grading begins."

---

## 3. WEEKLY LOGGING & WORKFLOWS

**US-301** | Priority: High
> "As an intern, I want to draft a weekly activity report by selecting an unlogged week number and detailing my tasks."

**US-302** | Priority: Medium
> "As an intern, I want to save my logbook entry as a 'Draft' so I can edit it before pushing it for review."

**US-303** | Priority: High
> "As an intern, I want to submit my log, permanently transitioning it from 'Draft' to 'Submitted' and locking it from further edits."

**US-304** | Priority: High
> "As a workplace supervisor, I want to view a dedicated queue of 'Pending Reviews' requiring my verification."

**US-305** | Priority: High
> "As a workplace supervisor, I want to approve or reject a weekly log and append mandatory feedback justifying the decision."

---

## 4. EVALUATION & PERFORMANCE ENGINE

**US-401** | Priority: High
> "As an academic supervisor, I want to view a gradebook of all my assigned students to identify who requires an official evaluation."

**US-402** | Priority: High
> "As an academic supervisor, I want to score an intern out of 100 for each dynamic criterion and provide final academic remarks."

**US-403** | Priority: High
> "As the system, I want to automatically calculate the student's final weighted score based on the rubric's exact percentages."

**US-404** | Priority: High
> "As an intern, I want to view my finalised evaluation scores, supervisor remarks, and a radar chart breaking down my syllabus competencies."

---

## 5. DASHBOARDS & ANALYTICS

**US-501** | Priority: High
> "As an administrator, I want a System Command Centre showing system-wide log compliance (Approved vs. Pending vs. Rejected) via interactive bar and line charts."

**US-502** | Priority: High
> "As an administrator, I want to view a global radar chart plotting the average cohort performance across all evaluation criteria."

**US-503** | Priority: High
> "As a workplace supervisor, I want to track the total approval progress (out of 12 weeks) for each of my assigned interns via a gauge chart."

**US-504** | Priority: High
> "As an academic supervisor, I want to view an intern's dossier, combining their evaluation scores with their weekly log volume timeline."

---

## 6. NOTIFICATIONS & ALERTS

**US-601** | Priority: High
> "As a user, I want an in-app notification bell with an active unread counter that updates dynamically."

**US-602** | Priority: High
> "As the system, I want to trigger a backend signal that dispatches an alert (and SMTP email) to the student immediately when a logbook is approved."

**US-603** | Priority: Medium
> "As a user, I want clicking the notification bell to display a dropdown of alerts and automatically clear the unread counter in the database."

**US-604** | Priority: High
> "As a user, I want temporary neon UI pop-ups (Toasts) to confirm successful log submissions, evaluations, and administrative actions."

---

## FUNCTIONAL REQUIREMENTS

### 1. Security & Authentication
* The system shall authenticate users via secure JSON Web Tokens (JWT).
* Passwords shall be cryptographically hashed using Django's standard protocols.
* Role-Based Access Control (RBAC) shall strictly isolate data. Supervisors shall only view data for explicitly assigned interns.
* Client sessions shall automatically terminate following 15 minutes of inactivity (auto-logout).

### 2. Workflow Logic
* The system shall enforce a strict state machine for logs: `DRAFT` → `SUBMITTED` → `APPROVED` or `REJECTED`.
* The system shall mandate supervisor comments upon the verification or rejection of a log.
* The system shall prevent interns from selecting a week number that has already been logged.

### 3. Business Rules (Evaluation)
* The system shall strictly block administrators from creating evaluation criteria if the combined global weight exceeds 100%.
* The system shall calculate overall grades via the formula: `SUM((score / max_score) * weight)`.

---

## WORKFLOW STATES

### Weekly Logs
* **DRAFT:** Compiled by the intern. Fully editable.
* **SUBMITTED:** Pushed for review. Read-only for the intern. Awaiting workplace supervisor review.
* **APPROVED:** Verified by the workplace supervisor with attached feedback. Locked.
* **REJECTED:** Returned to the intern by the supervisor with feedback.

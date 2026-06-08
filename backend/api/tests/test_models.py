import pytest
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from api.models import InternshipPlacement, WeeklyLog, EvaluationCriteria, Evaluation

User = get_user_model()

@pytest.mark.django_db
class TestILESModels:
    
    # ==========================================
    # USER & ROLE MANAGEMENT TESTS
    # ==========================================
    def test_create_users_with_roles(self):
        """Tests that RBAC roles are correctly assigned to users."""
        student = User.objects.create_user(username="test_student", password="password123", role="STUDENT")
        supervisor = User.objects.create_user(username="test_supervisor", password="password123", role="WORKPLACE_SUPERVISOR")
        
        assert student.role == "STUDENT"
        assert supervisor.role == "WORKPLACE_SUPERVISOR"

    # ==========================================
    # INTERNSHIP PLACEMENT TESTS
    # ==========================================
    def test_placement_date_validation(self):
        """Tests that a placement cannot end before it starts."""
        student = User.objects.create_user(username="student_date_test", role="STUDENT")
        
        placement = InternshipPlacement(
            student=student,
            company_name="Buggy Corp",
            start_date="2026-08-01",
            end_date="2026-05-01" # Invalid: End date is before start date
        )
        
        with pytest.raises(ValidationError) as excinfo:
            placement.clean()
        assert "End date must be after the start date." in str(excinfo.value)

    def test_weighted_score_computation(self):
        """Tests the automated score computation (Score / Max Score) * Weight."""
        student = User.objects.create_user(username="student_score_test", role="STUDENT")
        academic_sup = User.objects.create_user(username="academic_sup", role="ACADEMIC_SUPERVISOR")
        
        placement = InternshipPlacement.objects.create(
            student=student,
            academic_supervisor=academic_sup,
            company_name="Tech Corp",
            start_date="2026-05-01",
            end_date="2026-08-01"
        )
        
        # Create criteria: 40% weight, max score 100
        criteria1 = EvaluationCriteria.objects.create(name="Code Quality", max_score=100, weight=40.0)
        # Create criteria: 60% weight, max score 50
        criteria2 = EvaluationCriteria.objects.create(name="Teamwork", max_score=50, weight=60.0)
        
        # Student gets 90/100 on Code Quality -> (90/100) * 40 = 36
        Evaluation.objects.create(placement=placement, evaluator=academic_sup, criteria=criteria1, score=90)
        
        # Student gets 40/50 on Teamwork -> (40/50) * 60 = 48
        Evaluation.objects.create(placement=placement, evaluator=academic_sup, criteria=criteria2, score=40)
        
        # Total expected: 36 + 48 = 84.0
        assert placement.total_computed_score == 84.0

    # ==========================================
    # SUPERVISOR REVIEW WORKFLOW TESTS
    # ==========================================
    def test_logbook_default_state(self):
        """Tests that a new logbook always defaults to DRAFT."""
        student = User.objects.create_user(username="student_log_test", role="STUDENT")
        placement = InternshipPlacement.objects.create(student=student, company_name="Tech Corp", start_date="2026-05-01", end_date="2026-08-01")
        
        log = WeeklyLog.objects.create(
            placement=placement, 
            week_number=1, 
            activities="Built APIs",
            start_date="2026-05-01",
            end_date="2026-05-07"
        )
        assert log.status == "DRAFT"

    def test_log_approval_requires_comments(self):
        """Tests the workflow rule: Supervisors cannot approve logs without leaving a comment."""
        student = User.objects.create_user(username="student_comment_test", role="STUDENT")
        placement = InternshipPlacement.objects.create(student=student, company_name="Tech Corp", start_date="2026-05-01", end_date="2026-08-01")
        
        log = WeeklyLog(
            placement=placement, 
            week_number=2, 
            activities="Refactored code",
            start_date="2026-05-08",
            end_date="2026-05-14",
            status="APPROVED",
            supervisor_comment="" # Invalid: Empty comment on approval
        )
        
        with pytest.raises(ValidationError) as excinfo:
            log.clean()
        assert "Supervisor comments are required to approve or reject a log." in str(excinfo.value)
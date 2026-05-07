import pytest
from django.contrib.auth import get_user_model
from api.models import InternshipPlacement, WeeklyLog, EvaluationCriteria

User = get_user_model()

@pytest.mark.django_db
class TestILESModels:
    
    # TEST 1: Role Creation (RBAC) 
    def test_create_student_user(self):
        # DEFENSE POINT: Using get_or_create prevents crashes if the test database leaks state
        user, created = User.objects.get_or_create(
            username="test_student", 
            defaults={"password": "password123", "role": "STUDENT"}
        )
        assert user.role == "STUDENT"
        assert user.is_active == True

    # TEST 2: Workflow State Defaults
    def test_logbook_default_state(self):
        student, _ = User.objects.get_or_create(username="student2", defaults={"role": "STUDENT"})
        
        placement, _ = InternshipPlacement.objects.get_or_create(
            student=student,
            defaults={
                "company_name": "Tech Corp",
                "start_date": "2026-05-01",
                "end_date": "2026-08-01"
            }
        )
        
        # Ensure we don't violate the unique_together constraint if a log is stuck in the DB
        WeeklyLog.objects.filter(placement=placement, week_number=1).delete()
        
        log = WeeklyLog.objects.create(
            placement=placement, 
            week_number=1, 
            activities="Learned React",
            start_date="2026-05-01",
            end_date="2026-05-07"
        )
        
        assert log.status == "DRAFT"

    # TEST 3: Evaluation Criteria Weight Logic
    def test_criteria_weight_validation(self):
        # Clean up old test data to prevent duplicates
        EvaluationCriteria.objects.filter(name="Code Quality").delete()
        
        criteria = EvaluationCriteria.objects.create(
            name="Code Quality", 
            description="Clean code", 
            max_score=100.0,
            weight=40.0
        )
        
        assert criteria.weight == 40.0
        assert criteria.max_score == 100.0
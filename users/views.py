# # accounts/views.py
# from rest_framework import viewsets, permissions, status, generics
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework_simplejwt.views import TokenObtainPairView
# from rest_framework_simplejwt.tokens import RefreshToken
# from django.contrib.auth import login, logout
# from django.utils import timezone
# from django.db.models import Q
# from .models import User, SupervisorAssignment, Invitation, UserProfile
# from .serializers import (
#     UserSerializer, UserCreateSerializer, UserUpdateSerializer,
#     UserProfileUpdateSerializer, SupervisorAssignmentSerializer,
#     InvitationSerializer, CustomTokenObtainPairSerializer,
#     LoginSerializer, ChangePasswordSerializer
# )
# from core.api import MultiSerializerViewSet, ActionBasedPermission
# from notifications.services import NotificationService
# import logging
# import uuid

# logger = logging.getLogger(__name__)


# class UserViewSet(MultiSerializerViewSet):
#     """
#     ViewSet for managing users.
#     """
#     queryset = User.objects.filter(is_deleted=False)
#     serializer_classes = {
#         'create': UserCreateSerializer,
#         'update': UserUpdateSerializer,
#         'partial_update': UserUpdateSerializer,
#         'list': UserSerializer,
#         'retrieve': UserSerializer,
#         'profile': UserProfileUpdateSerializer,
#     }
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_queryset(self):
#         """Filter queryset based on user role"""
#         user = self.request.user
        
#         if user.is_admin_or_hr:
#             return User.objects.all()
#         elif user.is_supervisor:
#             # Supervisors see their interns
#             intern_ids = user.supervising_assignments.filter(
#                 is_active=True
#             ).values_list('intern_id', flat=True)
#             return User.objects.filter(
#                 Q(id__in=intern_ids) | Q(id=user.id)
#             )
#         else:
#             # Interns only see themselves
#             return User.objects.filter(id=user.id)
    
#     @action(detail=False, methods=['get'])
#     def me(self, request):
#         """Get current user details"""
#         serializer = UserSerializer(request.user)
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['get'])
#     def interns(self, request):
#         """Get all interns"""
#         interns = User.objects.filter(
#             role=User.Roles.INTERN,
#             is_deleted=False
#         )
        
#         # Filter by supervisor if not admin
#         if request.user.is_supervisor:
#             intern_ids = request.user.supervising_assignments.filter(
#                 is_active=True
#             ).values_list('intern_id', flat=True)
#             interns = interns.filter(id__in=intern_ids)
        
#         serializer = self.get_serializer(interns, many=True)
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['get'])
#     def supervisors(self, request):
#         """Get all supervisors"""
#         supervisors = User.objects.filter(
#             role=User.Roles.SUPERVISOR,
#             is_deleted=False
#         )
#         serializer = self.get_serializer(supervisors, many=True)
#         return Response(serializer.data)
    
#     @action(detail=True, methods=['get', 'put', 'patch'])
#     def profile(self, request, pk=None):
#         """Get or update user profile"""
#         user = self.get_object()
#         profile, _ = UserProfile.objects.get_or_create(user=user)
        
#         if request.method == 'GET':
#             serializer = UserProfileUpdateSerializer(profile)
#             return Response(serializer.data)
        
#         serializer = UserProfileUpdateSerializer(
#             profile,
#             data=request.data,
#             partial=request.method == 'PATCH'
#         )
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     @action(detail=True, methods=['post'])
#     def assign_supervisor(self, request, pk=None):
#         """Assign a supervisor to this intern"""
#         intern = self.get_object()
        
#         if not intern.is_intern:
#             return Response(
#                 {'error': 'User is not an intern'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         supervisor_id = request.data.get('supervisor_id')
        
#         try:
#             supervisor = User.objects.get(
#                 id=supervisor_id,
#                 role=User.Roles.SUPERVISOR
#             )
            
#             # End any active assignments
#             SupervisorAssignment.objects.filter(
#                 intern=intern,
#                 is_active=True
#             ).update(
#                 is_active=False,
#                 ended_at=timezone.now()
#             )
            
#             # Create new assignment
#             assignment = SupervisorAssignment.objects.create(
#                 supervisor=supervisor,
#                 intern=intern,
#                 assigned_by=request.user
#             )
            
#             # Send notification
#             NotificationService.send_notification(
#                 recipient=intern,
#                 category='supervisor_assigned',
#                 title="Supervisor Assigned",
#                 message=f"{supervisor.get_full_name()} has been assigned as your supervisor.",
#                 sender=request.user,
#                 notification_type='success',
#                 data={'assignment_id': str(assignment.id)}
#             )
            
#             logger.info(f"Supervisor {supervisor.email} assigned to intern {intern.email}")
            
#             return Response({
#                 'message': 'Supervisor assigned successfully',
#                 'assignment': SupervisorAssignmentSerializer(assignment).data
#             })
            
#         except User.DoesNotExist:
#             return Response(
#                 {'error': 'Supervisor not found'},
#                 status=status.HTTP_404_NOT_FOUND
#             )


# class SupervisorAssignmentViewSet(viewsets.ModelViewSet):
#     """ViewSet for managing supervisor assignments"""
#     serializer_class = SupervisorAssignmentSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_queryset(self):
#         user = self.request.user
        
#         if user.is_admin_or_hr:
#             return SupervisorAssignment.objects.all()
#         elif user.is_supervisor:
#             return SupervisorAssignment.objects.filter(supervisor=user)
#         else:
#             return SupervisorAssignment.objects.filter(intern=user)
    
#     @action(detail=True, methods=['post'])
#     def end(self, request, pk=None):
#         """End a supervisor assignment"""
#         assignment = self.get_object()
        
#         if not assignment.is_active:
#             return Response(
#                 {'error': 'Assignment is already inactive'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         assignment.end_assignment()
        
#         return Response({
#             'message': 'Assignment ended successfully',
#             'assignment': self.get_serializer(assignment).data
#         })


# class InvitationViewSet(viewsets.ModelViewSet):
#     """ViewSet for managing invitations"""
#     serializer_class = InvitationSerializer
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get_queryset(self):
#         if self.request.user.is_admin_or_hr:
#             return Invitation.objects.all()
#         return Invitation.objects.filter(invited_by=self.request.user)
    
#     def perform_create(self, serializer):
#         serializer.save(
#             invited_by=self.request.user,
#             token=uuid.uuid4().hex,
#             expires_at=timezone.now() + timezone.timedelta(days=7)
#         )


# class CustomTokenObtainPairView(TokenObtainPairView):
#     """Custom token obtain view"""
#     serializer_class = CustomTokenObtainPairSerializer


# class LoginView(APIView):
#     """User login view"""
#     permission_classes = [permissions.AllowAny]
    
#     def post(self, request):
#         serializer = LoginSerializer(data=request.data, context={'request': request})
        
#         if serializer.is_valid():
#             user = serializer.validated_data['user']
            
#             # Record login
#             ip_address = request.META.get('REMOTE_ADDR')
#             user.record_login(ip_address)
            
#             # Generate tokens
#             refresh = RefreshToken.for_user(user)
            
#             # Log the user in (for session auth)
#             login(request, user)
            
#             logger.info(f"User logged in: {user.email}")
            
#             return Response({
#                 'refresh': str(refresh),
#                 'access': str(refresh.access_token),
#                 'user': UserSerializer(user).data
#             })
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class LogoutView(APIView):
#     """User logout view"""
#     permission_classes = [permissions.IsAuthenticated]
    
#     def post(self, request):
#         try:
#             refresh_token = request.data.get('refresh')
#             if refresh_token:
#                 token = RefreshToken(refresh_token)
#                 token.blacklist()
            
#             logout(request)
            
#             logger.info(f"User logged out: {request.user.email}")
            
#             return Response({'message': 'Successfully logged out'})
#         except Exception as e:
#             logger.error(f"Logout error: {str(e)}")
#             return Response(
#                 {'error': 'Error during logout'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )


# class ChangePasswordView(APIView):
#     """Change user password"""
#     permission_classes = [permissions.IsAuthenticated]
    
#     def post(self, request):
#         serializer = ChangePasswordSerializer(data=request.data)
        
#         if serializer.is_valid():
#             user = request.user
            
#             # Check old password
#             if not user.check_password(serializer.validated_data['old_password']):
#                 return Response(
#                     {'old_password': 'Old password is incorrect'},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Set new password
#             user.set_password(serializer.validated_data['new_password'])
#             user.save()
            
#             logger.info(f"Password changed for user: {user.email}")
            
#             # Send notification
#             NotificationService.send_notification(
#                 recipient=user,
#                 category='password_changed',
#                 title="Password Changed",
#                 message="Your password has been successfully changed.",
#                 notification_type='success'
#             )
            
#             return Response({'message': 'Password changed successfully'})
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class ForgotPasswordView(APIView):
#     """Forgot password - send reset email"""
#     permission_classes = [permissions.AllowAny]
    
#     def post(self, request):
#         email = request.data.get('email')
        
#         try:
#             user = User.objects.get(email=email)
            
#             # Generate password reset token (implement your logic)
#             # Send email with reset link
            
#             logger.info(f"Password reset requested for: {email}")
            
#             return Response({
#                 'message': 'If an account exists with this email, you will receive password reset instructions.'
#             })
            
#         except User.DoesNotExist:
#             # Don't reveal that user doesn't exist
#             return Response({
#                 'message': 'If an account exists with this email, you will receive password reset instructions.'
#             })


#Views.py
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout
from django.utils import timezone
from django.db.models import Q
from .models import User, SupervisorAssignment, Invitation, UserProfile
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    UserProfileUpdateSerializer, SupervisorAssignmentSerializer,
    InvitationSerializer, CustomTokenObtainPairSerializer,
    LoginSerializer, ChangePasswordSerializer
)
from core.api import MultiSerializerViewSet, ActionBasedPermission
from notifications.services import NotificationService
import logging
import uuid

logger = logging.getLogger(__name__)


class UserViewSet(MultiSerializerViewSet):
    """
    ViewSet for managing users.
    """
    queryset = User.objects.filter(is_deleted=False)
    serializer_classes = {
        'create': UserCreateSerializer,
        'update': UserUpdateSerializer,
        'partial_update': UserUpdateSerializer,
        'list': UserSerializer,
        'retrieve': UserSerializer,
        'profile': UserProfileUpdateSerializer,
        'me': UserSerializer,
        'interns': UserSerializer,
        'supervisors': UserSerializer,
    }
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        if user.is_admin_or_hr:
            return User.objects.all()
        elif user.is_supervisor:
            # Supervisors see their interns
            intern_ids = user.supervising_assignments.filter(
                is_active=True
            ).values_list('intern_id', flat=True)
            return User.objects.filter(
                Q(id__in=intern_ids) | Q(id=user.id)
            )
        else:
            # Interns only see themselves
            return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user details"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def interns(self, request):
        """Get all interns"""
        interns = User.objects.filter(
            role=User.Roles.INTERN,
            is_deleted=False
        )
        
        # Filter by supervisor if not admin
        if request.user.is_supervisor:
            intern_ids = request.user.supervising_assignments.filter(
                is_active=True
            ).values_list('intern_id', flat=True)
            interns = interns.filter(id__in=intern_ids)
        
        page = self.paginate_queryset(interns)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(interns, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def supervisors(self, request):
        """Get all supervisors"""
        supervisors = User.objects.filter(
            role=User.Roles.SUPERVISOR,
            is_deleted=False
        )
        
        page = self.paginate_queryset(supervisors)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(supervisors, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'put', 'patch'])
    def profile(self, request, pk=None):
        """Get or update user profile"""
        user = self.get_object()
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        if request.method == 'GET':
            serializer = UserProfileUpdateSerializer(profile)
            return Response(serializer.data)
        
        serializer = UserProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=request.method == 'PATCH'
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def assign_supervisor(self, request, pk=None):
        """Assign a supervisor to this intern"""
        intern = self.get_object()
        
        if not intern.is_intern:
            return Response(
                {'error': 'User is not an intern'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        supervisor_id = request.data.get('supervisor_id')
        
        try:
            supervisor = User.objects.get(
                id=supervisor_id,
                role=User.Roles.SUPERVISOR
            )
            
            # End any active assignments
            SupervisorAssignment.objects.filter(
                intern=intern,
                is_active=True
            ).update(
                is_active=False,
                ended_at=timezone.now()
            )
            
            # Create new assignment
            assignment = SupervisorAssignment.objects.create(
                supervisor=supervisor,
                intern=intern,
                assigned_by=request.user
            )
            
            # Send notification
            NotificationService.send_notification(
                recipient=intern,
                category='supervisor_assigned',
                title="Supervisor Assigned",
                message=f"{supervisor.get_full_name()} has been assigned as your supervisor.",
                sender=request.user,
                notification_type='success',
                data={'assignment_id': str(assignment.id)}
            )
            
            logger.info(f"Supervisor {supervisor.email} assigned to intern {intern.email}")
            
            return Response({
                'message': 'Supervisor assigned successfully',
                'assignment': SupervisorAssignmentSerializer(assignment).data
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Supervisor not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class SupervisorAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing supervisor assignments"""
    serializer_class = SupervisorAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_admin_or_hr:
            return SupervisorAssignment.objects.all()
        elif user.is_supervisor:
            return SupervisorAssignment.objects.filter(supervisor=user)
        else:
            return SupervisorAssignment.objects.filter(intern=user)
    
    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        """End a supervisor assignment"""
        assignment = self.get_object()
        
        if not assignment.is_active:
            return Response(
                {'error': 'Assignment is already inactive'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignment.end_assignment()
        
        return Response({
            'message': 'Assignment ended successfully',
            'assignment': self.get_serializer(assignment).data
        })


class InvitationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing invitations"""
    serializer_class = InvitationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_admin_or_hr:
            return Invitation.objects.all()
        return Invitation.objects.filter(invited_by=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(
            invited_by=self.request.user,
            token=uuid.uuid4().hex,
            expires_at=timezone.now() + timezone.timedelta(days=7)
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain view"""
    serializer_class = CustomTokenObtainPairSerializer


class LoginView(APIView):
    """User login view"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Record login
            ip_address = request.META.get('REMOTE_ADDR')
            user.record_login(ip_address)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            # Log the user in (for session auth)
            login(request, user)
            
            logger.info(f"User logged in: {user.email}")
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """User logout view"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            logout(request)
            
            logger.info(f"User logged out: {request.user.email}")
            
            return Response({'message': 'Successfully logged out'})
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response(
                {'error': 'Error during logout'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'Old password is incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            logger.info(f"Password changed for user: {user.email}")
            
            # Send notification
            NotificationService.send_notification(
                recipient=user,
                category='password_changed',
                title="Password Changed",
                message="Your password has been successfully changed.",
                notification_type='success'
            )
            
            return Response({'message': 'Password changed successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    """Forgot password - send reset email"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        try:
            user = User.objects.get(email=email)
            
            # Generate password reset token (implement your logic)
            # Send email with reset link
            
            logger.info(f"Password reset requested for: {email}")
            
            return Response({
                'message': 'If an account exists with this email, you will receive password reset instructions.'
            })
            
        except User.DoesNotExist:
            # Don't reveal that user doesn't exist
            return Response({
                'message': 'If an account exists with this email, you will receive password reset instructions.'
            })
        
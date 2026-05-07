# core/exceptions.py
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF.
    Provides consistent error response format across the application.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Handle Django validation errors
    if isinstance(exc, DjangoValidationError):
        data = {
            'error': 'Validation Error',
            'detail': exc.messages if hasattr(exc, 'messages') else str(exc),
            'code': 'validation_error'
        }
        response = Response(data, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle DRF validation errors
    elif isinstance(exc, DRFValidationError):
        data = {
            'error': 'Validation Error',
            'detail': exc.detail,
            'code': 'validation_error'
        }
        response = Response(data, status=status.HTTP_400_BAD_REQUEST)
    
    # If response exists, format it consistently
    if response is not None:
        # Log the error
        logger.error(f"API Exception: {exc.__class__.__name__} - {str(exc)}")
        
        # Ensure consistent error format
        if isinstance(response.data, dict) and 'error' not in response.data:
            response.data = {
                'error': response.data.get('detail', 'An error occurred'),
                'code': response.data.get('code', 'error'),
                'detail': response.data
            }
    
    return response


class ServiceUnavailable(Exception):
    """Custom exception for service unavailable errors"""
    pass


class BusinessLogicError(Exception):
    """Custom exception for business logic errors"""
    pass
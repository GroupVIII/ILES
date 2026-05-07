# core/middleware.py
import logging
import time
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class RequestLogMiddleware(MiddlewareMixin):
    """
    Middleware to log all requests and their duration.
    Useful for monitoring and debugging.
    """
    
    def process_request(self, request):
        """Start timing the request"""
        request.start_time = time.time()
        
        # Log request details
        logger.info(f"Request: {request.method} {request.path} - User: {request.user if request.user.is_authenticated else 'Anonymous'}")
        
        return None
    
    def process_response(self, request, response):
        """Log request completion time"""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            logger.info(f"Response: {request.method} {request.path} - Status: {response.status_code} - Duration: {duration:.3f}s")
        
        return response
    
    def process_exception(self, request, exception):
        """Log exceptions"""
        logger.error(f"Exception in request {request.method} {request.path}: {str(exception)}", exc_info=True)
        return None


class TimezoneMiddleware(MiddlewareMixin):
    """
    Middleware to set the timezone based on user preference.
    Falls back to default timezone if not set.
    """
    
    def process_request(self, request):
        """Set timezone for authenticated users"""
        if request.user.is_authenticated:
            try:
                # Get user's timezone preference from profile
                # Default to 'UTC' if not set
                user_tz = getattr(request.user, 'timezone', 'UTC')
                timezone.activate(user_tz)
                logger.debug(f"Timezone set to {user_tz} for user {request.user.email}")
            except Exception as e:
                logger.warning(f"Could not set timezone for user: {e}")
                timezone.deactivate()
        else:
            timezone.deactivate()
        
        return None
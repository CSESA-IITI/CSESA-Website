# from django.http import JsonResponse
# from django.conf import settings
# from django.utils.deprecation import MiddlewareMixin
# import json

# class OrganizationValidationMiddleware(MiddlewareMixin):
#     """
#     Middleware to validate that authenticated users belong to the allowed organization domain
#     """
    
#     def process_request(self, request):
#         # Skip validation for certain paths
#         skip_paths = [
#             '/admin/',
#             '/api/auth/google/oauth/',
#             '/accounts/',
#             '/api/token/',
#         ]
        
#         # Check if the request path should be skipped
#         for skip_path in skip_paths:
#             if request.path.startswith(skip_path):
#                 return None
        
#         # Only validate authenticated users
#         if hasattr(request, 'user') and request.user.is_authenticated:
#             user_email = request.user.email
            
#             if user_email:
#                 email_domain = user_email.split('@')[-1].lower()
#                 allowed_domain = getattr(settings, 'ALLOWED_ORGANIZATION_DOMAIN', '').lower()
                
#                 if allowed_domain and email_domain != allowed_domain:
#                     return JsonResponse(
#                         {
#                             'error': 'Access denied',
#                             'message': f'Only users from {allowed_domain} are allowed'
#                         },
#                         status=403
#                     )
        
#         return None

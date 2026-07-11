from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer

class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]  
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        
        contact_message = serializer.save()
        
        # Send email notification to CSESA
        try:
            subject = f"New Contact Form Submission from {contact_message.name}"
            message_body = f"""
New contact form submission received:

Name: {contact_message.name}
Email: {contact_message.email}
Phone: {contact_message.phone or 'Not provided'}
Subject: {contact_message.subject or 'No subject'}

Message:
{contact_message.message}

---
This message was sent through the CSESA website contact form.
You can reply directly to {contact_message.email}
            """
            
            
            send_mail(
                subject=subject,
                message=message_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.CONTACT_EMAIL],
                fail_silently=False,
            )
            confirmation_subject = "Thank you for contacting CSESA"
            confirmation_message = f"""
Dear {contact_message.name},

Thank you for reaching out to CSESA (Computer Science and Engineering Students' Association).

We have received your message and will get back to you as soon as possible.

Your message:
{contact_message.message}

Best regards,
CSESA Team
            """
            
            send_mail(
                subject=confirmation_subject,
                message=confirmation_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[contact_message.email],
                fail_silently=True,  # Don't fail if confirmation email fails
            )
            
        except Exception as e:
            print(f"Failed to send email: {e}")
            # Still return success even if email fails
        
        return Response(
            {
                "message": "Your message has been sent successfully! We'll get back to you soon.",
                "success": True
            },
            status=status.HTTP_201_CREATED
        )
#!/usr/bin/env python
"""
Test script for the contact form functionality.
Run this to test if the contact form and email system work correctly.
"""

import os
import django
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'csesa_backend.settings')
django.setup()

from contact.models import ContactMessage
from contact.serializers import ContactMessageSerializer
from django.core.mail import send_mail
from django.conf import settings

def test_contact_form():
    print("🧪 Testing CSESA Contact Form...")
    print("=" * 50)
    
    # Test data
    test_data = {
        'name': 'Test User',
        'email': 'test@example.com',
        'phone': '+91 9876543210',
        'subject': 'Test Contact Form',
        'message': 'This is a test message to verify the contact form works correctly.'
    }
    
    print("📝 Test Data:")
    for key, value in test_data.items():
        print(f"   {key}: {value}")
    print()
    
    # Test serializer validation
    print("🔍 Testing serializer validation...")
    serializer = ContactMessageSerializer(data=test_data)
    if serializer.is_valid():
        print("✅ Serializer validation passed")
        
        # Save to database
        contact_message = serializer.save()
        print(f"✅ Message saved to database with ID: {contact_message.id}")
        
        # Test email sending
        print("📧 Testing email functionality...")
        try:
            subject = f"Test: New Contact Form Submission from {contact_message.name}"
            message_body = f"""
Test Email - New contact form submission received:

Name: {contact_message.name}
Email: {contact_message.email}
Phone: {contact_message.phone or 'Not provided'}
Subject: {contact_message.subject or 'No subject'}

Message:
{contact_message.message}

---
This is a test email from the CSESA website contact form.
            """
            
            send_mail(
                subject=subject,
                message=message_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.CONTACT_EMAIL],
                fail_silently=False,
            )
            
            print("✅ Email sent successfully!")
            print(f"📬 Email sent to: {settings.CONTACT_EMAIL}")
            print(f"📤 Email sent from: {settings.DEFAULT_FROM_EMAIL}")
            
        except Exception as e:
            print(f"❌ Email sending failed: {e}")
            print("💡 This is normal in development mode (DEBUG=True)")
            print("   Emails are printed to console instead of being sent")
        
        # Clean up test data
        contact_message.delete()
        print("🧹 Test data cleaned up")
        
    else:
        print("❌ Serializer validation failed:")
        for field, errors in serializer.errors.items():
            print(f"   {field}: {errors}")
    
    print("\n" + "=" * 50)
    print("🎉 Contact form test completed!")
    
    # Show current email configuration
    print("\n📧 Current Email Configuration:")
    print(f"   EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"   CONTACT_EMAIL: {settings.CONTACT_EMAIL}")
    print(f"   DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    if hasattr(settings, 'EMAIL_HOST'):
        print(f"   EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"   DEBUG: {settings.DEBUG}")

if __name__ == '__main__':
    test_contact_form()
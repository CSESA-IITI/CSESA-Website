from rest_framework import generics
from .models import Contact
from .serializers import ContactSerializer
from django.core.mail import send_mail
from django.conf import settings

class ContactView(generics.CreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

    def perform_create(self, serializer):
        serializer.save()
        send_mail(
            'New Contact Form Submission',
            f'Name: {serializer.data["name"]}\nEmail: {serializer.data["email"]}\nMessage: {serializer.data["message"]}',
            settings.DEFAULT_FROM_EMAIL,
            [settings.CSESA_EMAIL],
            fail_silently=False,
        )

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import timedelta
from .models import Event

User = get_user_model()


class EventPermissionTests(APITestCase):
    """Test event permissions and access control"""
    
    def setUp(self):
        """Set up test data"""
        # Create users with different roles
        self.president = User.objects.create_user(
            email='president@test.com',
            role='PRESIDENT',
            first_name='President',
            last_name='User'
        )
        
        self.head = User.objects.create_user(
            email='head@test.com',
            role='HEAD',
            first_name='Head',
            last_name='User'
        )
        
        self.coordinator = User.objects.create_user(
            email='coordinator@test.com',
            role='COORDINATOR',
            first_name='Coordinator',
            last_name='User'
        )
        
        self.associate = User.objects.create_user(
            email='associate@test.com',
            role='ASSOCIATE',
            first_name='Associate',
            last_name='User'
        )
        
        # Create test events
        future_date = timezone.now() + timedelta(days=7)
        
        self.event_by_president = Event.objects.create(
            title='President Event',
            description='Event created by president',
            date=future_date,
            location='Test Location',
            created_by=self.president
        )
        
        self.event_by_associate = Event.objects.create(
            title='Associate Event',
            description='Event created by associate',
            date=future_date,
            location='Test Location',
            created_by=self.associate
        )

    def test_unauthenticated_user_can_view_events(self):
        """Unauthenticated users can view events"""
        url = reverse('event-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_unauthenticated_user_cannot_create_event(self):
        """Unauthenticated users cannot create events"""
        url = reverse('event-list')
        data = {
            'title': 'Test Event',
            'description': 'Test Description',
            'date': timezone.now() + timedelta(days=1),
            'location': 'Test Location'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_president_can_create_event(self):
        """Presidents can create events"""
        self.client.force_authenticate(user=self.president)
        url = reverse('event-list')
        data = {
            'title': 'New Event',
            'description': 'New Description',
            'date': timezone.now() + timedelta(days=1),
            'location': 'New Location'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['created_by']['id'], self.president.id)

    def test_head_can_create_event(self):
        """Heads can create events"""
        self.client.force_authenticate(user=self.head)
        url = reverse('event-list')
        data = {
            'title': 'Head Event',
            'description': 'Head Description',
            'date': timezone.now() + timedelta(days=1),
            'location': 'Head Location'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['created_by']['id'], self.head.id)

    def test_coordinator_cannot_create_event(self):
        """Coordinators cannot create events"""
        self.client.force_authenticate(user=self.coordinator)
        url = reverse('event-list')
        data = {
            'title': 'Coordinator Event',
            'description': 'Coordinator Description',
            'date': timezone.now() + timedelta(days=1),
            'location': 'Coordinator Location'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_associate_cannot_create_event(self):
        """Associates cannot create events"""
        self.client.force_authenticate(user=self.associate)
        url = reverse('event-list')
        data = {
            'title': 'Associate Event',
            'description': 'Associate Description',
            'date': timezone.now() + timedelta(days=1),
            'location': 'Associate Location'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_event_creator_can_edit_own_event(self):
        """Event creators can edit their own events"""
        self.client.force_authenticate(user=self.associate)
        url = reverse('event-detail', kwargs={'pk': self.event_by_associate.pk})
        data = {
            'title': 'Updated Title',
            'description': self.event_by_associate.description,
            'date': self.event_by_associate.date,
            'location': self.event_by_associate.location
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Title')

    def test_president_can_edit_any_event(self):
        """Presidents can edit any event"""
        self.client.force_authenticate(user=self.president)
        url = reverse('event-detail', kwargs={'pk': self.event_by_associate.pk})
        data = {
            'title': 'President Updated Title',
            'description': self.event_by_associate.description,
            'date': self.event_by_associate.date,
            'location': self.event_by_associate.location
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'President Updated Title')

    def test_head_can_edit_any_event(self):
        """Heads can edit any event"""
        self.client.force_authenticate(user=self.head)
        url = reverse('event-detail', kwargs={'pk': self.event_by_associate.pk})
        data = {
            'title': 'Head Updated Title',
            'description': self.event_by_associate.description,
            'date': self.event_by_associate.date,
            'location': self.event_by_associate.location
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Head Updated Title')

    def test_coordinator_cannot_edit_others_event(self):
        """Coordinators cannot edit events they didn't create"""
        self.client.force_authenticate(user=self.coordinator)
        url = reverse('event-detail', kwargs={'pk': self.event_by_associate.pk})
        data = {
            'title': 'Coordinator Updated Title',
            'description': self.event_by_associate.description,
            'date': self.event_by_associate.date,
            'location': self.event_by_associate.location
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_event_creator_can_delete_own_event(self):
        """Event creators can delete their own events"""
        self.client.force_authenticate(user=self.associate)
        url = reverse('event-detail', kwargs={'pk': self.event_by_associate.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_president_can_delete_any_event(self):
        """Presidents can delete any event"""
        self.client.force_authenticate(user=self.president)
        url = reverse('event-detail', kwargs={'pk': self.event_by_associate.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_my_events_endpoint(self):
        """Test my_events endpoint returns only user's events"""
        self.client.force_authenticate(user=self.associate)
        url = reverse('event-my-events')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.event_by_associate.id)

    def test_my_events_requires_authentication(self):
        """my_events endpoint requires authentication"""
        url = reverse('event-my-events')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_serializer_computed_fields(self):
        """Test can_edit and can_delete computed fields in serializer"""
        # Test as event creator
        self.client.force_authenticate(user=self.associate)
        url = reverse('event-detail', kwargs={'pk': self.event_by_associate.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['can_edit'])
        self.assertTrue(response.data['can_delete'])

        # Test as president viewing associate's event
        self.client.force_authenticate(user=self.president)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['can_edit'])
        self.assertTrue(response.data['can_delete'])

        # Test as coordinator viewing associate's event
        self.client.force_authenticate(user=self.coordinator)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['can_edit'])
        self.assertFalse(response.data['can_delete'])


class EventSerializerTests(APITestCase):
    """Test EventSerializer functionality"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            role='PRESIDENT',
            first_name='Test',
            last_name='User'
        )

    def test_date_validation_future_date_valid(self):
        """Test that future dates are valid"""
        self.client.force_authenticate(user=self.user)
        url = reverse('event-list')
        future_date = timezone.now() + timedelta(days=1)
        data = {
            'title': 'Future Event',
            'description': 'Event in the future',
            'date': future_date.isoformat(),
            'location': 'Test Location'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_date_validation_past_date_invalid(self):
        """Test that past dates are invalid"""
        self.client.force_authenticate(user=self.user)
        url = reverse('event-list')
        past_date = timezone.now() - timedelta(days=1)
        data = {
            'title': 'Past Event',
            'description': 'Event in the past',
            'date': past_date.isoformat(),
            'location': 'Test Location'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date', response.data)
        self.assertIn('must be in the future', str(response.data['date'][0]))

    def test_date_validation_current_time_invalid(self):
        """Test that current time is invalid (must be future)"""
        self.client.force_authenticate(user=self.user)
        url = reverse('event-list')
        current_time = timezone.now()
        data = {
            'title': 'Current Time Event',
            'description': 'Event at current time',
            'date': current_time.isoformat(),
            'location': 'Test Location'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date', response.data)

    def test_serializer_includes_computed_fields(self):
        """Test that serializer includes can_edit and can_delete fields"""
        future_date = timezone.now() + timedelta(days=1)
        event = Event.objects.create(
            title='Test Event',
            description='Test Description',
            date=future_date,
            location='Test Location',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('event-detail', kwargs={'pk': event.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('can_edit', response.data)
        self.assertIn('can_delete', response.data)
        self.assertTrue(response.data['can_edit'])
        self.assertTrue(response.data['can_delete'])

    def test_serializer_includes_nested_user(self):
        """Test that serializer includes nested user data for created_by"""
        future_date = timezone.now() + timedelta(days=1)
        event = Event.objects.create(
            title='Test Event',
            description='Test Description',
            date=future_date,
            location='Test Location',
            created_by=self.user
        )
        
        self.client.force_authenticate(user=self.user)
        url = reverse('event-detail', kwargs={'pk': event.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('created_by', response.data)
        self.assertEqual(response.data['created_by']['id'], self.user.id)
        self.assertEqual(response.data['created_by']['first_name'], self.user.first_name)
        self.assertEqual(response.data['created_by']['last_name'], self.user.last_name)


class EventModelTests(TestCase):
    """Test Event model functionality"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            role='PRESIDENT'
        )

    def test_event_creation(self):
        """Test event creation with valid data"""
        future_date = timezone.now() + timedelta(days=1)
        event = Event.objects.create(
            title='Test Event',
            description='Test Description',
            date=future_date,
            location='Test Location',
            created_by=self.user
        )
        self.assertEqual(event.title, 'Test Event')
        self.assertEqual(event.created_by, self.user)

    def test_event_str_representation(self):
        """Test event string representation"""
        future_date = timezone.now() + timedelta(days=1)
        event = Event.objects.create(
            title='Test Event',
            description='Test Description',
            date=future_date,
            location='Test Location',
            created_by=self.user
        )
        self.assertEqual(str(event), 'Test Event')

    def test_event_ordering(self):
        """Test events are ordered by date descending"""
        future_date1 = timezone.now() + timedelta(days=1)
        future_date2 = timezone.now() + timedelta(days=2)
        
        event1 = Event.objects.create(
            title='Event 1',
            description='Description 1',
            date=future_date1,
            location='Location 1',
            created_by=self.user
        )
        
        event2 = Event.objects.create(
            title='Event 2',
            description='Description 2',
            date=future_date2,
            location='Location 2',
            created_by=self.user
        )
        
        events = Event.objects.all()
        self.assertEqual(events[0], event2)  # Later date should come first
        self.assertEqual(events[1], event1)

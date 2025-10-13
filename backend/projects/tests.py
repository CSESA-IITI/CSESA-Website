from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework.request import Request
from rest_framework import status
from django.urls import reverse
from .models import Project, Domain
from .serializers import ProjectSerializer, ContributorManagementSerializer

User = get_user_model()

class ProjectModelTests(TestCase):
    def setUp(self):
        """Set up test data"""
        self.president = User.objects.create_user(
            email='president@iiti.ac.in',
            password='testpass123',
            role=User.Role.PRESIDENT,
            first_name='Test',
            last_name='President'
        )
        
        self.coordinator = User.objects.create_user(
            email='coordinator@iiti.ac.in',
            password='testpass123',
            role=User.Role.COORDINATOR,
            first_name='Test',
            last_name='Coordinator'
        )
        
        self.associate = User.objects.create_user(
            email='associate@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Test',
            last_name='Associate'
        )
        
        self.domain = Domain.objects.create(name='Web Development')
        
        self.project = Project.objects.create(
            name='Test Project',
            description='A test project',
            tech_stack='Django, React',
            github_link='https://github.com/test/project',
            created_by=self.president
        )
        self.project.domains.add(self.domain)

    def test_add_contributor_success(self):
        """Test successfully adding a contributor to a project"""
        result = self.project.add_contributor(self.associate)
        
        self.assertTrue(result)
        self.assertTrue(self.project.team_members.filter(id=self.associate.id).exists())

    def test_add_contributor_already_exists(self):
        """Test adding a contributor who is already in the project"""
        # Add contributor first time
        self.project.add_contributor(self.associate)
        
        # Try to add same contributor again
        result = self.project.add_contributor(self.associate)
        
        self.assertFalse(result)
        self.assertEqual(self.project.team_members.count(), 1)

    def test_remove_contributor_success(self):
        """Test successfully removing a contributor from a project"""
        # Add contributor first
        self.project.add_contributor(self.associate)
        
        # Remove contributor
        result = self.project.remove_contributor(self.associate)
        
        self.assertTrue(result)
        self.assertFalse(self.project.team_members.filter(id=self.associate.id).exists())

    def test_remove_contributor_not_exists(self):
        """Test removing a contributor who is not in the project"""
        result = self.project.remove_contributor(self.associate)
        
        self.assertFalse(result)

    def test_can_manage_contributors_creator(self):
        """Test that project creator can manage contributors"""
        result = self.project.can_manage_contributors(self.president)
        
        self.assertTrue(result)

    def test_can_manage_contributors_president(self):
        """Test that presidents can manage contributors"""
        # Create another president
        another_president = User.objects.create_user(
            email='president2@iiti.ac.in',
            password='testpass123',
            role=User.Role.PRESIDENT
        )
        
        result = self.project.can_manage_contributors(another_president)
        
        self.assertTrue(result)

    def test_can_manage_contributors_coordinator(self):
        """Test that coordinators can manage contributors"""
        result = self.project.can_manage_contributors(self.coordinator)
        
        self.assertTrue(result)

    def test_can_manage_contributors_associate_denied(self):
        """Test that associates cannot manage contributors (unless they're the creator)"""
        result = self.project.can_manage_contributors(self.associate)
        
        self.assertFalse(result)

    def test_can_manage_contributors_associate_creator(self):
        """Test that associate who created the project can manage contributors"""
        # Create project with associate as creator
        associate_project = Project.objects.create(
            name='Associate Project',
            description='Project created by associate',
            tech_stack='Python',
            github_link='https://github.com/test/associate-project',
            created_by=self.associate
        )
        
        result = associate_project.can_manage_contributors(self.associate)
        
        self.assertTrue(result)

    def test_project_created_by_field(self):
        """Test that created_by field is properly set"""
        self.assertEqual(self.project.created_by, self.president)

    def test_team_members_blank_allowed(self):
        """Test that projects can be created without team members"""
        project = Project.objects.create(
            name='Empty Team Project',
            description='Project with no team members',
            tech_stack='Solo work',
            github_link='https://github.com/test/solo',
            created_by=self.president
        )
        
        self.assertEqual(project.team_members.count(), 0)


class ProjectSerializerTests(TestCase):
    def setUp(self):
        """Set up test data for serializer tests"""
        self.factory = APIRequestFactory()
        
        self.president = User.objects.create_user(
            email='president@iiti.ac.in',
            password='testpass123',
            role=User.Role.PRESIDENT,
            first_name='Test',
            last_name='President'
        )
        
        self.coordinator = User.objects.create_user(
            email='coordinator@iiti.ac.in',
            password='testpass123',
            role=User.Role.COORDINATOR,
            first_name='Test',
            last_name='Coordinator'
        )
        
        self.associate = User.objects.create_user(
            email='associate@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Test',
            last_name='Associate'
        )
        
        self.domain = Domain.objects.create(name='Web Development')
        
        self.project = Project.objects.create(
            name='Test Project',
            description='A test project',
            tech_stack='Django, React',
            github_link='https://github.com/test/project',
            created_by=self.president
        )
        self.project.domains.add(self.domain)
        self.project.team_members.add(self.coordinator)

    def _create_request_with_user(self, user):
        """Helper method to create a request with authenticated user"""
        from django.contrib.auth.models import AnonymousUser
        request = self.factory.post('/')
        request.user = user
        # Create a DRF Request object
        drf_request = Request(request)
        # Override the user property to ensure it's authenticated
        drf_request._user = user
        return drf_request

    def test_add_self_as_contributor_field_exists(self):
        """Test that add_self_as_contributor field is present in serializer"""
        serializer = ProjectSerializer()
        self.assertIn('add_self_as_contributor', serializer.fields)
        
        # Test that it's write_only
        field = serializer.fields['add_self_as_contributor']
        self.assertTrue(field.write_only)
        self.assertTrue(field.default)

    def test_available_contributors_field_exists(self):
        """Test that available_contributors field is present in serializer"""
        serializer = ProjectSerializer()
        self.assertIn('available_contributors', serializer.fields)

    def test_team_members_field_optional(self):
        """Test that team_members field is optional during creation"""
        serializer = ProjectSerializer()
        field = serializer.fields['team_members']
        self.assertFalse(field.required)

    def test_create_project_with_self_assignment_true(self):
        """Test creating project with add_self_as_contributor=True"""
        request = self._create_request_with_user(self.president)
        
        data = {
            'name': 'New Project',
            'description': 'Test project with self assignment',
            'tech_stack': 'Python, Django',
            'github_link': 'https://github.com/test/new-project',
            'domains': [self.domain.id],
            'add_self_as_contributor': True
        }
        
        serializer = ProjectSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        project = serializer.save()
        
        # Check that project was created correctly
        self.assertEqual(project.name, 'New Project')
        self.assertEqual(project.created_by, self.president)
        
        # Check that creator was added as team member
        self.assertTrue(project.team_members.filter(id=self.president.id).exists())

    def test_create_project_with_self_assignment_false(self):
        """Test creating project with add_self_as_contributor=False"""
        request = self._create_request_with_user(self.president)
        
        data = {
            'name': 'New Project',
            'description': 'Test project without self assignment',
            'tech_stack': 'Python, Django',
            'github_link': 'https://github.com/test/new-project',
            'domains': [self.domain.id],
            'add_self_as_contributor': False
        }
        
        serializer = ProjectSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        project = serializer.save()
        
        # Check that project was created correctly
        self.assertEqual(project.name, 'New Project')
        self.assertEqual(project.created_by, self.president)
        
        # Check that creator was NOT added as team member
        self.assertFalse(project.team_members.filter(id=self.president.id).exists())

    def test_create_project_with_default_self_assignment(self):
        """Test creating project without specifying add_self_as_contributor (should default to True)"""
        request = self._create_request_with_user(self.president)
        
        data = {
            'name': 'New Project',
            'description': 'Test project with default self assignment',
            'tech_stack': 'Python, Django',
            'github_link': 'https://github.com/test/new-project',
            'domains': [self.domain.id]
        }
        
        serializer = ProjectSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        project = serializer.save()
        
        # Check that creator was added as team member (default behavior)
        self.assertTrue(project.team_members.filter(id=self.president.id).exists())

    def test_create_project_without_team_members(self):
        """Test creating project without specifying team_members"""
        request = self._create_request_with_user(self.president)
        
        data = {
            'name': 'Empty Team Project',
            'description': 'Project with no initial team members',
            'tech_stack': 'Solo work',
            'github_link': 'https://github.com/test/solo',
            'domains': [self.domain.id],
            'add_self_as_contributor': False
        }
        
        serializer = ProjectSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        project = serializer.save()
        
        # Check that no team members were added
        self.assertEqual(project.team_members.count(), 0)

    def test_create_project_with_explicit_team_members(self):
        """Test creating project with explicit team_members list"""
        request = self._create_request_with_user(self.president)
        
        data = {
            'name': 'Team Project',
            'description': 'Project with explicit team members',
            'tech_stack': 'Collaborative work',
            'github_link': 'https://github.com/test/team',
            'domains': [self.domain.id],
            'team_members': [self.coordinator.id, self.associate.id],
            'add_self_as_contributor': True
        }
        
        serializer = ProjectSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        project = serializer.save()
        
        # Check that explicit team members were added
        self.assertTrue(project.team_members.filter(id=self.coordinator.id).exists())
        self.assertTrue(project.team_members.filter(id=self.associate.id).exists())
        
        # Check that creator was also added due to add_self_as_contributor=True
        self.assertTrue(project.team_members.filter(id=self.president.id).exists())
        
        # Total should be 3 team members
        self.assertEqual(project.team_members.count(), 3)

    def test_get_available_contributors_new_project(self):
        """Test available_contributors method for new project (no existing object)"""
        serializer = ProjectSerializer()
        
        # For new projects, should return all users
        available_contributors = serializer.get_available_contributors(None)
        
        # Should return all 3 users we created
        self.assertEqual(len(available_contributors), 3)
        
        # Check that user data is properly serialized
        user_emails = [contrib['email'] for contrib in available_contributors]
        self.assertIn('president@iiti.ac.in', user_emails)
        self.assertIn('coordinator@iiti.ac.in', user_emails)
        self.assertIn('associate@iiti.ac.in', user_emails)

    def test_get_available_contributors_existing_project(self):
        """Test available_contributors method for existing project"""
        serializer = ProjectSerializer()
        
        # For existing project, should exclude current team members
        available_contributors = serializer.get_available_contributors(self.project)
        
        # Should return users not in the project (president and associate)
        # Coordinator is already in the project, so should be excluded
        self.assertEqual(len(available_contributors), 2)
        
        user_emails = [contrib['email'] for contrib in available_contributors]
        self.assertIn('president@iiti.ac.in', user_emails)
        self.assertIn('associate@iiti.ac.in', user_emails)
        self.assertNotIn('coordinator@iiti.ac.in', user_emails)

    def test_create_project_without_request_context(self):
        """Test creating project without request context (should not crash)"""
        data = {
            'name': 'No Context Project',
            'description': 'Project created without request context',
            'tech_stack': 'Backend only',
            'github_link': 'https://github.com/test/no-context',
            'domains': [self.domain.id]
        }
        
        serializer = ProjectSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        
        project = serializer.save()
        
        # Check that project was created
        self.assertEqual(project.name, 'No Context Project')
        # created_by should be None since no user in context
        self.assertIsNone(project.created_by)
        # No team members should be added
        self.assertEqual(project.team_members.count(), 0)

    def test_serializer_fields_include_new_fields(self):
        """Test that serializer includes all required fields"""
        serializer = ProjectSerializer()
        
        expected_fields = [
            'id', 'name', 'description', 'tech_stack', 'github_link',
            'deployment_link', 'created_at', 'updated_at', 'created_by',
            'domains', 'domains_details', 'team_members', 'team_members_details',
            'add_self_as_contributor', 'available_contributors'
        ]
        
        for field in expected_fields:
            self.assertIn(field, serializer.fields, f"Field '{field}' missing from serializer")

    def test_created_by_field_read_only(self):
        """Test that created_by field is read-only"""
        serializer = ProjectSerializer()
        field = serializer.fields['created_by']
        self.assertTrue(field.read_only)


class ContributorManagementSerializerTests(TestCase):
    def setUp(self):
        """Set up test data for serializer tests"""
        self.user1 = User.objects.create_user(
            email='user1@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE
        )
        self.user2 = User.objects.create_user(
            email='user2@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE
        )

    def test_valid_serializer_data(self):
        """Test serializer with valid data"""
        data = {
            'user_ids': [self.user1.id, self.user2.id],
            'action': 'add'
        }
        
        serializer = ContributorManagementSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['user_ids'], [self.user1.id, self.user2.id])
        self.assertEqual(serializer.validated_data['action'], 'add')

    def test_invalid_action(self):
        """Test serializer with invalid action"""
        data = {
            'user_ids': [self.user1.id],
            'action': 'invalid_action'
        }
        
        serializer = ContributorManagementSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('action', serializer.errors)

    def test_empty_user_ids(self):
        """Test serializer with empty user_ids list"""
        data = {
            'user_ids': [],
            'action': 'add'
        }
        
        serializer = ContributorManagementSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('user_ids', serializer.errors)

    def test_invalid_user_ids(self):
        """Test serializer with non-existent user IDs"""
        data = {
            'user_ids': [999, 1000],  # Non-existent IDs
            'action': 'add'
        }
        
        serializer = ContributorManagementSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('user_ids', serializer.errors)

    def test_mixed_valid_invalid_user_ids(self):
        """Test serializer with mix of valid and invalid user IDs"""
        data = {
            'user_ids': [self.user1.id, 999],  # One valid, one invalid
            'action': 'add'
        }
        
        serializer = ContributorManagementSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('user_ids', serializer.errors)


class ProjectContributorManagementAPITests(APITestCase):
    def setUp(self):
        """Set up test data for API tests"""
        # Create users with different roles
        self.president = User.objects.create_user(
            email='president@iiti.ac.in',
            password='testpass123',
            role=User.Role.PRESIDENT,
            first_name='Test',
            last_name='President'
        )
        
        self.coordinator = User.objects.create_user(
            email='coordinator@iiti.ac.in',
            password='testpass123',
            role=User.Role.COORDINATOR,
            first_name='Test',
            last_name='Coordinator'
        )
        
        self.associate1 = User.objects.create_user(
            email='associate1@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Test',
            last_name='Associate1'
        )
        
        self.associate2 = User.objects.create_user(
            email='associate2@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Test',
            last_name='Associate2'
        )
        
        self.associate3 = User.objects.create_user(
            email='associate3@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Test',
            last_name='Associate3'
        )
        
        # Create domain
        self.domain = Domain.objects.create(name='Web Development')
        
        # Create project owned by president
        self.project = Project.objects.create(
            name='Test Project',
            description='A test project',
            tech_stack='Django, React',
            github_link='https://github.com/test/project',
            created_by=self.president
        )
        self.project.domains.add(self.domain)
        self.project.team_members.add(self.associate1)  # Add one initial contributor
        
        # Create project owned by associate
        self.associate_project = Project.objects.create(
            name='Associate Project',
            description='Project created by associate',
            tech_stack='Python',
            github_link='https://github.com/test/associate-project',
            created_by=self.associate2
        )

    def test_add_contributors_as_project_creator(self):
        """Test adding contributors as project creator"""
        self.client.force_authenticate(user=self.president)
        
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {
            'user_ids': [self.associate2.id, self.associate3.id],
            'action': 'add'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('results', response.data)
        self.assertIn('current_contributors', response.data)
        
        # Check that contributors were added
        self.assertTrue(self.project.team_members.filter(id=self.associate2.id).exists())
        self.assertTrue(self.project.team_members.filter(id=self.associate3.id).exists())
        
        # Check response data
        self.assertEqual(len(response.data['results']), 2)
        self.assertEqual(len(response.data['current_contributors']), 3)  # associate1 + associate2 + associate3

    def test_add_contributors_as_president(self):
        """Test adding contributors as president (not project creator)"""
        self.client.force_authenticate(user=self.president)
        
        url = reverse('project-manage-contributors', kwargs={'pk': self.associate_project.pk})
        data = {
            'user_ids': [self.associate1.id],
            'action': 'add'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.associate_project.team_members.filter(id=self.associate1.id).exists())

    def test_add_contributors_as_coordinator(self):
        """Test adding contributors as coordinator"""
        self.client.force_authenticate(user=self.coordinator)
        
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {
            'user_ids': [self.associate2.id],
            'action': 'add'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.project.team_members.filter(id=self.associate2.id).exists())

    def test_add_contributors_permission_denied(self):
        """Test adding contributors without permission"""
        self.client.force_authenticate(user=self.associate1)
        
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {
            'user_ids': [self.associate2.id],
            'action': 'add'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('detail', response.data)

    def test_add_contributors_as_associate_creator(self):
        """Test that associate who created project can manage contributors"""
        self.client.force_authenticate(user=self.associate2)
        
        url = reverse('project-manage-contributors', kwargs={'pk': self.associate_project.pk})
        data = {
            'user_ids': [self.associate1.id],
            'action': 'add'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.associate_project.team_members.filter(id=self.associate1.id).exists())

    def test_remove_contributors_success(self):
        """Test removing contributors successfully"""
        self.client.force_authenticate(user=self.president)
        
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {
            'user_ids': [self.associate1.id],
            'action': 'remove'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.project.team_members.filter(id=self.associate1.id).exists())
        
        # Check response indicates successful removal
        self.assertEqual(response.data['results'][0]['action'], 'removed')
        self.assertTrue(response.data['results'][0]['success'])

    def test_add_existing_contributor(self):
        """Test adding a user who is already a contributor"""
        self.client.force_authenticate(user=self.president)
        
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {
            'user_ids': [self.associate1.id],  # Already a contributor
            'action': 'add'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should indicate that user was already a contributor
        self.assertFalse(response.data['results'][0]['success'])
        self.assertIn('already a contributor', response.data['results'][0]['message'])

    def test_remove_non_contributor(self):
        """Test removing a user who is not a contributor"""
        self.client.force_authenticate(user=self.president)
        
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {
            'user_ids': [self.associate2.id],  # Not a contributor
            'action': 'remove'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should indicate that user was not a contributor
        self.assertFalse(response.data['results'][0]['success'])
        self.assertIn('was not a contributor', response.data['results'][0]['message'])

    def test_manage_contributors_invalid_data(self):
        """Test contributor management with invalid data"""
        self.client.force_authenticate(user=self.president)
        
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {
            'user_ids': [],  # Empty list
            'action': 'add'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_contributors_invalid_user_ids(self):
        """Test contributor management with invalid user IDs"""
        self.client.force_authenticate(user=self.president)
        
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {
            'user_ids': [999, 1000],  # Non-existent user IDs
            'action': 'add'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_contributors_unauthenticated(self):
        """Test contributor management without authentication"""
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {
            'user_ids': [self.associate2.id],
            'action': 'add'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_available_contributors_success(self):
        """Test getting available contributors successfully"""
        self.client.force_authenticate(user=self.president)
        
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('available_contributors', response.data)
        self.assertIn('count', response.data)
        
        # Should return users not in the project
        available_emails = [user['email'] for user in response.data['available_contributors']]
        self.assertIn('president@iiti.ac.in', available_emails)
        self.assertIn('coordinator@iiti.ac.in', available_emails)
        self.assertIn('associate2@iiti.ac.in', available_emails)
        self.assertIn('associate3@iiti.ac.in', available_emails)
        self.assertNotIn('associate1@iiti.ac.in', available_emails)  # Already a contributor

    def test_available_contributors_permission_denied(self):
        """Test getting available contributors without permission"""
        self.client.force_authenticate(user=self.associate1)
        
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_available_contributors_as_creator(self):
        """Test getting available contributors as project creator"""
        self.client.force_authenticate(user=self.associate2)
        
        url = reverse('project-available-contributors', kwargs={'pk': self.associate_project.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_available_contributors_unauthenticated(self):
        """Test getting available contributors without authentication"""
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProjectPermissionTests(TestCase):
    """Test cases specifically for project contributor management permissions"""
    
    def setUp(self):
        """Set up test data for permission tests"""
        # Create users with different roles
        self.president = User.objects.create_user(
            email='president@iiti.ac.in',
            password='testpass123',
            role=User.Role.PRESIDENT,
            first_name='Test',
            last_name='President'
        )
        
        self.head = User.objects.create_user(
            email='head@iiti.ac.in',
            password='testpass123',
            role=User.Role.HEAD,
            first_name='Test',
            last_name='Head'
        )
        
        self.coordinator = User.objects.create_user(
            email='coordinator@iiti.ac.in',
            password='testpass123',
            role=User.Role.COORDINATOR,
            first_name='Test',
            last_name='Coordinator'
        )
        
        self.associate_creator = User.objects.create_user(
            email='associate_creator@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Creator'
        )
        
        self.associate_regular = User.objects.create_user(
            email='associate_regular@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Regular'
        )
        
        self.associate_contributor = User.objects.create_user(
            email='associate_contributor@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Contributor'
        )
        
        # Create domain
        self.domain = Domain.objects.create(name='Web Development')
        
        # Create project owned by president
        self.president_project = Project.objects.create(
            name='President Project',
            description='Project created by president',
            tech_stack='Django, React',
            github_link='https://github.com/test/president-project',
            created_by=self.president
        )
        self.president_project.domains.add(self.domain)
        self.president_project.team_members.add(self.associate_contributor)
        
        # Create project owned by associate
        self.associate_project = Project.objects.create(
            name='Associate Project',
            description='Project created by associate',
            tech_stack='Python',
            github_link='https://github.com/test/associate-project',
            created_by=self.associate_creator
        )
        self.associate_project.domains.add(self.domain)

    def test_can_manage_contributors_project_creator_president(self):
        """Test that president who created project can manage contributors"""
        result = self.president_project.can_manage_contributors(self.president)
        self.assertTrue(result)

    def test_can_manage_contributors_project_creator_associate(self):
        """Test that associate who created project can manage contributors"""
        result = self.associate_project.can_manage_contributors(self.associate_creator)
        self.assertTrue(result)

    def test_can_manage_contributors_president_not_creator(self):
        """Test that president can manage contributors even if not creator"""
        result = self.associate_project.can_manage_contributors(self.president)
        self.assertTrue(result)

    def test_can_manage_contributors_head_not_creator(self):
        """Test that head can manage contributors even if not creator"""
        result = self.associate_project.can_manage_contributors(self.head)
        self.assertTrue(result)

    def test_can_manage_contributors_coordinator_not_creator(self):
        """Test that coordinator can manage contributors even if not creator"""
        result = self.associate_project.can_manage_contributors(self.coordinator)
        self.assertTrue(result)

    def test_can_manage_contributors_associate_not_creator(self):
        """Test that associate cannot manage contributors if not creator"""
        result = self.president_project.can_manage_contributors(self.associate_regular)
        self.assertFalse(result)

    def test_can_manage_contributors_associate_contributor_not_creator(self):
        """Test that associate contributor cannot manage contributors if not creator"""
        result = self.president_project.can_manage_contributors(self.associate_contributor)
        self.assertFalse(result)

    def test_can_manage_contributors_none_user(self):
        """Test that None user cannot manage contributors"""
        result = self.president_project.can_manage_contributors(None)
        self.assertFalse(result)


class ProjectPermissionClassTests(APITestCase):
    """Test cases for custom permission classes"""
    
    def setUp(self):
        """Set up test data for permission class tests"""
        from users.permissions import CanManageProjectContributors, CanViewProjectContributors
        
        # Create users with different roles
        self.president = User.objects.create_user(
            email='president@iiti.ac.in',
            password='testpass123',
            role=User.Role.PRESIDENT,
            first_name='Test',
            last_name='President'
        )
        
        self.coordinator = User.objects.create_user(
            email='coordinator@iiti.ac.in',
            password='testpass123',
            role=User.Role.COORDINATOR,
            first_name='Test',
            last_name='Coordinator'
        )
        
        self.associate_creator = User.objects.create_user(
            email='associate_creator@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Creator'
        )
        
        self.associate_regular = User.objects.create_user(
            email='associate_regular@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Regular'
        )
        
        self.associate_contributor = User.objects.create_user(
            email='associate_contributor@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Contributor'
        )
        
        # Create domain
        self.domain = Domain.objects.create(name='Web Development')
        
        # Create project
        self.project = Project.objects.create(
            name='Test Project',
            description='A test project',
            tech_stack='Django, React',
            github_link='https://github.com/test/project',
            created_by=self.associate_creator
        )
        self.project.domains.add(self.domain)
        self.project.team_members.add(self.associate_contributor)
        
        # Initialize permission classes
        self.manage_permission = CanManageProjectContributors()
        self.view_permission = CanViewProjectContributors()

    def _create_mock_request(self, user):
        """Helper to create mock request with user"""
        from unittest.mock import Mock
        request = Mock()
        request.user = user
        return request

    def _create_mock_view(self):
        """Helper to create mock view"""
        from unittest.mock import Mock
        return Mock()

    def test_can_manage_contributors_permission_authenticated_required(self):
        """Test that CanManageProjectContributors requires authentication"""
        from django.contrib.auth.models import AnonymousUser
        
        request = self._create_mock_request(AnonymousUser())
        view = self._create_mock_view()
        
        result = self.manage_permission.has_permission(request, view)
        self.assertFalse(result)

    def test_can_manage_contributors_permission_authenticated_allowed(self):
        """Test that CanManageProjectContributors allows authenticated users"""
        request = self._create_mock_request(self.associate_regular)
        view = self._create_mock_view()
        
        result = self.manage_permission.has_permission(request, view)
        self.assertTrue(result)

    def test_can_manage_contributors_object_permission_creator(self):
        """Test that project creator can manage contributors"""
        request = self._create_mock_request(self.associate_creator)
        view = self._create_mock_view()
        
        result = self.manage_permission.has_object_permission(request, view, self.project)
        self.assertTrue(result)

    def test_can_manage_contributors_object_permission_president(self):
        """Test that president can manage contributors"""
        request = self._create_mock_request(self.president)
        view = self._create_mock_view()
        
        result = self.manage_permission.has_object_permission(request, view, self.project)
        self.assertTrue(result)

    def test_can_manage_contributors_object_permission_coordinator(self):
        """Test that coordinator can manage contributors"""
        request = self._create_mock_request(self.coordinator)
        view = self._create_mock_view()
        
        result = self.manage_permission.has_object_permission(request, view, self.project)
        self.assertTrue(result)

    def test_can_manage_contributors_object_permission_regular_associate_denied(self):
        """Test that regular associate cannot manage contributors"""
        request = self._create_mock_request(self.associate_regular)
        view = self._create_mock_view()
        
        result = self.manage_permission.has_object_permission(request, view, self.project)
        self.assertFalse(result)

    def test_can_manage_contributors_object_permission_contributor_denied(self):
        """Test that contributor associate cannot manage contributors"""
        request = self._create_mock_request(self.associate_contributor)
        view = self._create_mock_view()
        
        result = self.manage_permission.has_object_permission(request, view, self.project)
        self.assertFalse(result)

    def test_can_view_contributors_permission_authenticated_required(self):
        """Test that CanViewProjectContributors requires authentication"""
        from django.contrib.auth.models import AnonymousUser
        
        request = self._create_mock_request(AnonymousUser())
        view = self._create_mock_view()
        
        result = self.view_permission.has_permission(request, view)
        self.assertFalse(result)

    def test_can_view_contributors_permission_authenticated_allowed(self):
        """Test that CanViewProjectContributors allows authenticated users"""
        request = self._create_mock_request(self.associate_regular)
        view = self._create_mock_view()
        
        result = self.view_permission.has_permission(request, view)
        self.assertTrue(result)

    def test_can_view_contributors_object_permission_creator(self):
        """Test that project creator can view contributors"""
        request = self._create_mock_request(self.associate_creator)
        view = self._create_mock_view()
        
        result = self.view_permission.has_object_permission(request, view, self.project)
        self.assertTrue(result)

    def test_can_view_contributors_object_permission_contributor(self):
        """Test that project contributor can view contributors"""
        request = self._create_mock_request(self.associate_contributor)
        view = self._create_mock_view()
        
        result = self.view_permission.has_object_permission(request, view, self.project)
        self.assertTrue(result)

    def test_can_view_contributors_object_permission_president(self):
        """Test that president can view contributors"""
        request = self._create_mock_request(self.president)
        view = self._create_mock_view()
        
        result = self.view_permission.has_object_permission(request, view, self.project)
        self.assertTrue(result)

    def test_can_view_contributors_object_permission_coordinator(self):
        """Test that coordinator can view contributors"""
        request = self._create_mock_request(self.coordinator)
        view = self._create_mock_view()
        
        result = self.view_permission.has_object_permission(request, view, self.project)
        self.assertTrue(result)

    def test_can_view_contributors_object_permission_regular_associate_denied(self):
        """Test that regular associate cannot view contributors"""
        request = self._create_mock_request(self.associate_regular)
        view = self._create_mock_view()
        
        result = self.view_permission.has_object_permission(request, view, self.project)
        self.assertFalse(result)

    def test_can_view_contributors_object_permission_unauthenticated_denied(self):
        """Test that unauthenticated user cannot view contributors"""
        from django.contrib.auth.models import AnonymousUser
        
        request = self._create_mock_request(AnonymousUser())
        view = self._create_mock_view()
        
        result = self.view_permission.has_object_permission(request, view, self.project)
        self.assertFalse(result)

    def test_can_view_contributors_object_permission_none_user_denied(self):
        """Test that None user cannot view contributors"""
        request = self._create_mock_request(None)
        view = self._create_mock_view()
        
        result = self.view_permission.has_object_permission(request, view, self.project)
        self.assertFalse(result)


class ProjectPermissionIntegrationTests(APITestCase):
    """Integration tests for permission system with API endpoints"""
    
    def setUp(self):
        """Set up test data for integration tests"""
        # Create users with different roles
        self.president = User.objects.create_user(
            email='president@iiti.ac.in',
            password='testpass123',
            role=User.Role.PRESIDENT,
            first_name='Test',
            last_name='President'
        )
        
        self.head = User.objects.create_user(
            email='head@iiti.ac.in',
            password='testpass123',
            role=User.Role.HEAD,
            first_name='Test',
            last_name='Head'
        )
        
        self.coordinator = User.objects.create_user(
            email='coordinator@iiti.ac.in',
            password='testpass123',
            role=User.Role.COORDINATOR,
            first_name='Test',
            last_name='Coordinator'
        )
        
        self.associate_creator = User.objects.create_user(
            email='associate_creator@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Creator'
        )
        
        self.associate_regular = User.objects.create_user(
            email='associate_regular@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Regular'
        )
        
        self.associate_contributor = User.objects.create_user(
            email='associate_contributor@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Contributor'
        )
        
        # Create domain
        self.domain = Domain.objects.create(name='Web Development')
        
        # Create project owned by associate
        self.project = Project.objects.create(
            name='Test Project',
            description='A test project',
            tech_stack='Django, React',
            github_link='https://github.com/test/project',
            created_by=self.associate_creator
        )
        self.project.domains.add(self.domain)
        self.project.team_members.add(self.associate_contributor)

    def test_manage_contributors_permission_flow_creator(self):
        """Test complete permission flow for project creator"""
        self.client.force_authenticate(user=self.associate_creator)
        
        # Should be able to add contributors
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {'user_ids': [self.associate_regular.id], 'action': 'add'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should be able to view available contributors
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should be able to remove contributors
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {'user_ids': [self.associate_regular.id], 'action': 'remove'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_manage_contributors_permission_flow_president(self):
        """Test complete permission flow for president (not creator)"""
        self.client.force_authenticate(user=self.president)
        
        # Should be able to add contributors
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {'user_ids': [self.associate_regular.id], 'action': 'add'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should be able to view available contributors
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_manage_contributors_permission_flow_head(self):
        """Test complete permission flow for head (not creator)"""
        self.client.force_authenticate(user=self.head)
        
        # Should be able to add contributors
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {'user_ids': [self.associate_regular.id], 'action': 'add'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should be able to view available contributors
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_manage_contributors_permission_flow_coordinator(self):
        """Test complete permission flow for coordinator (not creator)"""
        self.client.force_authenticate(user=self.coordinator)
        
        # Should be able to add contributors
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {'user_ids': [self.associate_regular.id], 'action': 'add'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should be able to view available contributors
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_manage_contributors_permission_denied_regular_associate(self):
        """Test permission denied for regular associate"""
        self.client.force_authenticate(user=self.associate_regular)
        
        # Should NOT be able to add contributors
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {'user_ids': [self.president.id], 'action': 'add'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Should NOT be able to view available contributors
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manage_contributors_permission_denied_contributor(self):
        """Test permission denied for project contributor (not creator)"""
        self.client.force_authenticate(user=self.associate_contributor)
        
        # Should NOT be able to add contributors
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {'user_ids': [self.president.id], 'action': 'add'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Should NOT be able to view available contributors
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manage_contributors_permission_denied_unauthenticated(self):
        """Test permission denied for unauthenticated users"""
        # Should NOT be able to add contributors
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {'user_ids': [self.president.id], 'action': 'add'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Should NOT be able to view available contributors
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_permission_error_response_format(self):
        """Test that permission error responses have correct format"""
        self.client.force_authenticate(user=self.associate_regular)
        
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        data = {'user_ids': [self.president.id], 'action': 'add'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        # The permission class should handle the error, so we expect a standard DRF 403 response
        self.assertIn('detail', response.data)

    def test_available_contributors_permission_denied(self):
        """Test getting available contributors without permission"""
        self.client.force_authenticate(user=self.associate_regular)
        
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_available_contributors_as_creator(self):
        """Test getting available contributors as project creator"""
        self.client.force_authenticate(user=self.associate_creator)
        
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('available_contributors', response.data)

    def test_available_contributors_unauthenticated(self):
        """Test getting available contributors without authentication"""
        url = reverse('project-available-contributors', kwargs={'pk': self.project.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_bulk_contributor_operations(self):
        """Test adding and removing multiple contributors in sequence"""
        self.client.force_authenticate(user=self.president)
        
        # First, add multiple contributors
        url = reverse('project-manage-contributors', kwargs={'pk': self.project.pk})
        add_data = {
            'user_ids': [self.associate_regular.id, self.head.id, self.coordinator.id],
            'action': 'add'
        }
        
        response = self.client.post(url, add_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['current_contributors']), 4)  # associate_contributor + 3 new ones
        
        # Then, remove some contributors
        remove_data = {
            'user_ids': [self.associate_regular.id, self.coordinator.id],
            'action': 'remove'
        }
        
        response = self.client.post(url, remove_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['current_contributors']), 2)  # associate_contributor + head
        
        # Verify final state
        self.assertTrue(self.project.team_members.filter(id=self.associate_contributor.id).exists())
        self.assertTrue(self.project.team_members.filter(id=self.head.id).exists())
        self.assertFalse(self.project.team_members.filter(id=self.associate_regular.id).exists())
        self.assertFalse(self.project.team_members.filter(id=self.coordinator.id).exists())

    def test_project_nonexistent(self):
        """Test contributor management on non-existent project"""
        self.client.force_authenticate(user=self.president)
        
        url = reverse('project-manage-contributors', kwargs={'pk': 999})
        data = {
            'user_ids': [self.associate_regular.id],
            'action': 'add'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_available_contributors_project_nonexistent(self):
        """Test getting available contributors for non-existent project"""
        self.client.force_authenticate(user=self.president)
        
        url = reverse('project-available-contributors', kwargs={'pk': 999})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
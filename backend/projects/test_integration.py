"""
Integration tests for complete contributor management flow.
Tests the full end-to-end workflow including project creation with self-assignment,
contributor add/remove operations, permission validation, and error scenarios.
"""

from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from django.db import transaction
from .models import Project, Domain
from users.models import CustomUser
import json

User = get_user_model()


class ContributorManagementIntegrationTests(APITestCase):
    """
    Integration tests for complete contributor management workflow.
    Tests Requirements: 1.1, 1.5, 2.1, 2.5, 3.1, 3.5
    """
    
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
        
        self.coordinator = User.objects.create_user(
            email='coordinator@iiti.ac.in',
            password='testpass123',
            role=User.Role.COORDINATOR,
            first_name='Test',
            last_name='Coordinator'
        )
        
        self.head = User.objects.create_user(
            email='head@iiti.ac.in',
            password='testpass123',
            role=User.Role.HEAD,
            first_name='Test',
            last_name='Head'
        )
        
        self.associate1 = User.objects.create_user(
            email='associate1@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='One'
        )
        
        self.associate2 = User.objects.create_user(
            email='associate2@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Two'
        )
        
        self.associate3 = User.objects.create_user(
            email='associate3@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Three'
        )
        
        # Create domain
        self.domain = Domain.objects.create(name='Web Development')
        
        # Create API client
        self.client = APIClient()

    def test_complete_project_creation_with_self_assignment_flow(self):
        """
        Test complete project creation flow with self-assignment.
        Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
        """
        # Authenticate as president
        self.client.force_authenticate(user=self.president)
        
        # Create project with self-assignment enabled (default behavior)
        project_data = {
            'name': 'Integration Test Project',
            'description': 'Project for testing integration flow',
            'tech_stack': 'Django, React, PostgreSQL',
            'github_link': 'https://github.com/test/integration-project',
            'domains': [self.domain.id],
            'add_self_as_contributor': True
        }
        
        # Step 1: Create project
        response = self.client.post('/api/projects/', project_data, format='json')
        
        # Verify project creation
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project_id = response.data['id']
        
        # Verify creator was added as contributor
        self.assertEqual(len(response.data['team_members_details']), 1)
        self.assertEqual(response.data['team_members_details'][0]['id'], self.president.id)
        
        # Verify created_by field is set
        self.assertEqual(response.data['created_by'], self.president.id)
        
        # Step 2: Verify project in database
        project = Project.objects.get(id=project_id)
        self.assertEqual(project.created_by, self.president)
        self.assertTrue(project.team_members.filter(id=self.president.id).exists())
        
        # Step 3: Test permission validation - creator can manage contributors
        self.assertTrue(project.can_manage_contributors(self.president))

    def test_complete_project_creation_without_self_assignment_flow(self):
        """
        Test complete project creation flow without self-assignment.
        Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
        """
        # Authenticate as coordinator
        self.client.force_authenticate(user=self.coordinator)
        
        # Create project without self-assignment
        project_data = {
            'name': 'No Contributors Project',
            'description': 'Project created without initial contributors',
            'tech_stack': 'Python, FastAPI',
            'github_link': 'https://github.com/test/no-contributors',
            'domains': [self.domain.id],
            'add_self_as_contributor': False
        }
        
        # Step 1: Create project
        response = self.client.post('/api/projects/', project_data, format='json')
        
        # Verify project creation
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project_id = response.data['id']
        
        # Verify no contributors were added
        self.assertEqual(len(response.data['team_members_details']), 0)
        
        # Verify created_by field is set
        self.assertEqual(response.data['created_by'], self.coordinator.id)
        
        # Step 2: Verify project in database
        project = Project.objects.get(id=project_id)
        self.assertEqual(project.created_by, self.coordinator)
        self.assertEqual(project.team_members.count(), 0)
        
        # Step 3: Creator should still be able to manage contributors
        self.assertTrue(project.can_manage_contributors(self.coordinator))

    def test_complete_contributor_add_remove_workflow(self):
        """
        Test complete workflow for adding and removing contributors.
        Requirements: 3.1, 3.3, 3.4, 3.5
        """
        # Setup: Create project with president as creator
        self.client.force_authenticate(user=self.president)
        
        project_data = {
            'name': 'Contributor Management Test',
            'description': 'Testing contributor operations',
            'tech_stack': 'Full Stack',
            'github_link': 'https://github.com/test/contributor-mgmt',
            'domains': [self.domain.id],
            'add_self_as_contributor': True
        }
        
        response = self.client.post('/api/projects/', project_data, format='json')
        project_id = response.data['id']
        
        # Step 1: Get available contributors
        available_url = reverse('project-available-contributors', kwargs={'pk': project_id})
        response = self.client.get(available_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('available_contributors', response.data)
        self.assertIn('count', response.data)
        
        # Should have 5 available users (all except president who is already a contributor)
        available_users = response.data['available_contributors']
        self.assertEqual(len(available_users), 5)
        
        available_emails = [user['email'] for user in available_users]
        self.assertNotIn('president@iiti.ac.in', available_emails)  # Already a contributor
        self.assertIn('coordinator@iiti.ac.in', available_emails)
        self.assertIn('associate1@iiti.ac.in', available_emails)
        
        # Step 2: Add multiple contributors
        contributors_url = reverse('project-manage-contributors', kwargs={'pk': project_id})
        add_data = {
            'user_ids': [self.coordinator.id, self.associate1.id, self.associate2.id],
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, add_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('results', response.data)
        self.assertIn('current_contributors', response.data)
        
        # Verify all additions were successful
        results = response.data['results']
        self.assertEqual(len(results), 3)
        for result in results:
            self.assertEqual(result['action'], 'added')
            self.assertTrue(result['success'])
            self.assertEqual(result['message'], 'User added successfully')
        
        # Verify current contributors count (president + 3 new contributors)
        current_contributors = response.data['current_contributors']
        self.assertEqual(len(current_contributors), 4)
        
        # Step 3: Verify contributors in database
        project = Project.objects.get(id=project_id)
        self.assertEqual(project.team_members.count(), 4)
        self.assertTrue(project.team_members.filter(id=self.president.id).exists())
        self.assertTrue(project.team_members.filter(id=self.coordinator.id).exists())
        self.assertTrue(project.team_members.filter(id=self.associate1.id).exists())
        self.assertTrue(project.team_members.filter(id=self.associate2.id).exists())
        
        # Step 4: Try to add existing contributor (should handle gracefully)
        duplicate_data = {
            'user_ids': [self.coordinator.id],
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, duplicate_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.data['results'][0]
        self.assertEqual(result['action'], 'added')
        self.assertFalse(result['success'])
        self.assertEqual(result['message'], 'User is already a contributor')
        
        # Step 5: Remove contributors
        remove_data = {
            'user_ids': [self.associate1.id, self.associate2.id],
            'action': 'remove'
        }
        
        response = self.client.post(contributors_url, remove_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify removals were successful
        results = response.data['results']
        self.assertEqual(len(results), 2)
        for result in results:
            self.assertEqual(result['action'], 'removed')
            self.assertTrue(result['success'])
            self.assertEqual(result['message'], 'User removed successfully')
        
        # Verify current contributors count (president + coordinator)
        current_contributors = response.data['current_contributors']
        self.assertEqual(len(current_contributors), 2)
        
        # Step 6: Verify removals in database
        project.refresh_from_db()
        self.assertEqual(project.team_members.count(), 2)
        self.assertTrue(project.team_members.filter(id=self.president.id).exists())
        self.assertTrue(project.team_members.filter(id=self.coordinator.id).exists())
        self.assertFalse(project.team_members.filter(id=self.associate1.id).exists())
        self.assertFalse(project.team_members.filter(id=self.associate2.id).exists())
        
        # Step 7: Try to remove non-contributor (should handle gracefully)
        non_contributor_data = {
            'user_ids': [self.associate3.id],
            'action': 'remove'
        }
        
        response = self.client.post(contributors_url, non_contributor_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.data['results'][0]
        self.assertEqual(result['action'], 'removed')
        self.assertFalse(result['success'])
        self.assertEqual(result['message'], 'User was not a contributor')

    def test_permission_validation_across_full_flow(self):
        """
        Test permission validation throughout the contributor management flow.
        Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
        """
        # Setup: Create project with coordinator as creator
        self.client.force_authenticate(user=self.coordinator)
        
        project_data = {
            'name': 'Permission Test Project',
            'description': 'Testing permissions',
            'tech_stack': 'React',
            'github_link': 'https://github.com/test/permissions',
            'domains': [self.domain.id],
            'add_self_as_contributor': True
        }
        
        response = self.client.post('/api/projects/', project_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project_id = response.data['id']
        
        # Step 1: Creator (coordinator) should be able to manage contributors
        contributors_url = reverse('project-manage-contributors', kwargs={'pk': project_id})
        add_data = {
            'user_ids': [self.associate2.id],
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, add_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Step 2: President should be able to manage any project
        self.client.force_authenticate(user=self.president)
        
        add_data = {
            'user_ids': [self.associate3.id],
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, add_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Step 3: Head should be able to manage any project
        self.client.force_authenticate(user=self.head)
        
        remove_data = {
            'user_ids': [self.associate3.id],
            'action': 'remove'
        }
        
        response = self.client.post(contributors_url, remove_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Step 4: Coordinator should be able to manage any project
        self.client.force_authenticate(user=self.coordinator)
        
        add_data = {
            'user_ids': [self.coordinator.id],
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, add_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Step 5: Non-creator associate should NOT be able to manage contributors
        self.client.force_authenticate(user=self.associate3)
        
        add_data = {
            'user_ids': [self.associate3.id],
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, add_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Step 6: Unauthenticated user should not be able to manage contributors
        self.client.force_authenticate(user=None)
        
        response = self.client.post(contributors_url, add_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Step 7: Available contributors endpoint should also respect permissions
        available_url = reverse('project-available-contributors', kwargs={'pk': project_id})
        
        # Unauthenticated
        response = self.client.get(available_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Non-creator associate
        self.client.force_authenticate(user=self.associate3)
        response = self.client.get(available_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Creator should have access
        self.client.force_authenticate(user=self.coordinator)
        response = self.client.get(available_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_error_scenarios_and_recovery(self):
        """
        Test various error scenarios and system recovery.
        Requirements: 3.5, 5.5
        """
        # Setup: Create project
        self.client.force_authenticate(user=self.president)
        
        project_data = {
            'name': 'Error Test Project',
            'description': 'Testing error scenarios',
            'tech_stack': 'Error Handling',
            'github_link': 'https://github.com/test/errors',
            'domains': [self.domain.id]
        }
        
        response = self.client.post('/api/projects/', project_data, format='json')
        project_id = response.data['id']
        contributors_url = reverse('project-manage-contributors', kwargs={'pk': project_id})
        
        # Test 1: Invalid project ID
        invalid_url = reverse('project-manage-contributors', kwargs={'pk': 99999})
        add_data = {
            'user_ids': [self.associate1.id],
            'action': 'add'
        }
        
        response = self.client.post(invalid_url, add_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Test 2: Invalid user IDs
        invalid_user_data = {
            'user_ids': [99999, 88888],
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, invalid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test 3: Empty user IDs list
        empty_data = {
            'user_ids': [],
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, empty_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test 4: Invalid action
        invalid_action_data = {
            'user_ids': [self.associate1.id],
            'action': 'invalid_action'
        }
        
        response = self.client.post(contributors_url, invalid_action_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test 5: Missing required fields
        incomplete_data = {
            'user_ids': [self.associate1.id]
            # Missing 'action' field
        }
        
        response = self.client.post(contributors_url, incomplete_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test 6: Invalid JSON format
        response = self.client.post(
            contributors_url, 
            'invalid json', 
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test 7: Verify system state remains consistent after errors
        project = Project.objects.get(id=project_id)
        initial_contributor_count = project.team_members.count()
        
        # All error scenarios above should not have modified the project
        project.refresh_from_db()
        self.assertEqual(project.team_members.count(), initial_contributor_count)

    def test_ui_updates_after_contributor_changes(self):
        """
        Test that API responses provide correct data for UI updates.
        Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
        """
        # Setup: Create project
        self.client.force_authenticate(user=self.president)
        
        project_data = {
            'name': 'UI Update Test Project',
            'description': 'Testing UI update data',
            'tech_stack': 'Frontend Testing',
            'github_link': 'https://github.com/test/ui-updates',
            'domains': [self.domain.id],
            'add_self_as_contributor': True
        }
        
        response = self.client.post('/api/projects/', project_data, format='json')
        project_id = response.data['id']
        
        # Step 1: Verify initial project data structure
        self.assertIn('team_members_details', response.data)
        self.assertIn('created_by', response.data)
        
        team_member = response.data['team_members_details'][0]
        required_fields = ['id', 'email', 'first_name', 'last_name', 'role']
        for field in required_fields:
            self.assertIn(field, team_member)
        
        # Step 2: Test contributor addition response structure
        contributors_url = reverse('project-manage-contributors', kwargs={'pk': project_id})
        add_data = {
            'user_ids': [self.coordinator.id, self.associate1.id],
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, add_data, format='json')
        
        # Verify response structure for UI updates
        self.assertIn('message', response.data)
        self.assertIn('results', response.data)
        self.assertIn('current_contributors', response.data)
        
        # Verify results structure
        results = response.data['results']
        self.assertEqual(len(results), 2)
        
        for result in results:
            required_result_fields = ['user_id', 'user_name', 'action', 'success', 'message']
            for field in required_result_fields:
                self.assertIn(field, result)
        
        # Verify current_contributors structure
        current_contributors = response.data['current_contributors']
        self.assertEqual(len(current_contributors), 3)  # president + coordinator + associate1
        
        for contributor in current_contributors:
            for field in required_fields:
                self.assertIn(field, contributor)
        
        # Step 3: Test available contributors response structure
        available_url = reverse('project-available-contributors', kwargs={'pk': project_id})
        response = self.client.get(available_url)
        
        self.assertIn('available_contributors', response.data)
        self.assertIn('count', response.data)
        
        available_contributors = response.data['available_contributors']
        self.assertEqual(response.data['count'], len(available_contributors))
        
        # Should exclude current contributors
        available_emails = [user['email'] for user in available_contributors]
        self.assertNotIn('president@iiti.ac.in', available_emails)
        self.assertNotIn('coordinator@iiti.ac.in', available_emails)
        self.assertNotIn('associate1@iiti.ac.in', available_emails)
        
        # Step 4: Test removal response structure
        remove_data = {
            'user_ids': [self.associate1.id],
            'action': 'remove'
        }
        
        response = self.client.post(contributors_url, remove_data, format='json')
        
        # Verify updated contributor list
        current_contributors = response.data['current_contributors']
        self.assertEqual(len(current_contributors), 2)  # president + coordinator
        
        contributor_emails = [c['email'] for c in current_contributors]
        self.assertIn('president@iiti.ac.in', contributor_emails)
        self.assertIn('coordinator@iiti.ac.in', contributor_emails)
        self.assertNotIn('associate1@iiti.ac.in', contributor_emails)

    def test_concurrent_contributor_operations(self):
        """
        Test handling of concurrent contributor operations.
        Requirements: 3.5
        """
        # Setup: Create project
        self.client.force_authenticate(user=self.president)
        
        project_data = {
            'name': 'Concurrent Test Project',
            'description': 'Testing concurrent operations',
            'tech_stack': 'Concurrency Testing',
            'github_link': 'https://github.com/test/concurrent',
            'domains': [self.domain.id]
        }
        
        response = self.client.post('/api/projects/', project_data, format='json')
        project_id = response.data['id']
        contributors_url = reverse('project-manage-contributors', kwargs={'pk': project_id})
        
        # Simulate concurrent additions
        client1 = APIClient()
        client2 = APIClient()
        client1.force_authenticate(user=self.president)
        client2.force_authenticate(user=self.president)
        
        add_data1 = {
            'user_ids': [self.associate1.id],
            'action': 'add'
        }
        
        add_data2 = {
            'user_ids': [self.associate2.id],
            'action': 'add'
        }
        
        # Both operations should succeed
        response1 = client1.post(contributors_url, add_data1, format='json')
        response2 = client2.post(contributors_url, add_data2, format='json')
        
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        
        # Verify final state
        project = Project.objects.get(id=project_id)
        self.assertTrue(project.team_members.filter(id=self.associate1.id).exists())
        self.assertTrue(project.team_members.filter(id=self.associate2.id).exists())

    def test_bulk_contributor_operations(self):
        """
        Test bulk addition and removal of contributors.
        Requirements: 3.3, 3.4
        """
        # Setup: Create project
        self.client.force_authenticate(user=self.president)
        
        project_data = {
            'name': 'Bulk Operations Test',
            'description': 'Testing bulk operations',
            'tech_stack': 'Bulk Processing',
            'github_link': 'https://github.com/test/bulk',
            'domains': [self.domain.id],
            'add_self_as_contributor': False  # Don't add president automatically
        }
        
        response = self.client.post('/api/projects/', project_data, format='json')
        project_id = response.data['id']
        contributors_url = reverse('project-manage-contributors', kwargs={'pk': project_id})
        
        # Test bulk addition
        all_associates = [self.coordinator.id, self.associate1.id, self.associate2.id, self.associate3.id]
        bulk_add_data = {
            'user_ids': all_associates,
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, bulk_add_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 4)
        # Should have 4 contributors (coordinator + 3 associates)
        self.assertEqual(len(response.data['current_contributors']), 4)
        
        # Verify all were added successfully
        for result in response.data['results']:
            self.assertTrue(result['success'])
            self.assertEqual(result['action'], 'added')
        
        # Test bulk removal
        bulk_remove_data = {
            'user_ids': [self.associate1.id, self.associate2.id],
            'action': 'remove'
        }
        
        response = self.client.post(contributors_url, bulk_remove_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        self.assertEqual(len(response.data['current_contributors']), 2)
        
        # Verify removals were successful
        for result in response.data['results']:
            self.assertTrue(result['success'])
            self.assertEqual(result['action'], 'removed')
        
        # Verify final state
        project = Project.objects.get(id=project_id)
        self.assertTrue(project.team_members.filter(id=self.coordinator.id).exists())
        self.assertTrue(project.team_members.filter(id=self.associate3.id).exists())
        self.assertFalse(project.team_members.filter(id=self.associate1.id).exists())
        self.assertFalse(project.team_members.filter(id=self.associate2.id).exists())


class ContributorManagementTransactionTests(TransactionTestCase):
    """
    Transaction-based tests for contributor management to test database consistency.
    """
    
    def setUp(self):
        """Set up test data"""
        self.president = User.objects.create_user(
            email='president@iiti.ac.in',
            password='testpass123',
            role=User.Role.PRESIDENT,
            first_name='Test',
            last_name='President'
        )
        
        self.associate = User.objects.create_user(
            email='associate@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Test',
            last_name='Associate'
        )
        
        self.domain = Domain.objects.create(name='Web Development')
        self.client = APIClient()

    def test_database_consistency_during_errors(self):
        """
        Test that database remains consistent even when errors occur.
        Requirements: 3.5
        """
        self.client.force_authenticate(user=self.president)
        
        # Create project
        project_data = {
            'name': 'Consistency Test',
            'description': 'Testing database consistency',
            'tech_stack': 'Database Testing',
            'github_link': 'https://github.com/test/consistency',
            'domains': [self.domain.id]
        }
        
        response = self.client.post('/api/projects/', project_data, format='json')
        project_id = response.data['id']
        
        # Get initial state
        project = Project.objects.get(id=project_id)
        initial_count = project.team_members.count()
        
        # Attempt operation with invalid data (should fail but not corrupt database)
        contributors_url = reverse('project-manage-contributors', kwargs={'pk': project_id})
        invalid_data = {
            'user_ids': [99999],  # Non-existent user
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify database state unchanged
        project.refresh_from_db()
        self.assertEqual(project.team_members.count(), initial_count)
        
        # Verify subsequent valid operations still work
        valid_data = {
            'user_ids': [self.associate.id],
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        project.refresh_from_db()
        self.assertEqual(project.team_members.count(), initial_count + 1)


class ProjectEditingIntegrationTests(APITestCase):
    """
    Integration tests for project editing functionality with contributor management.
    Tests Requirements: 1.1, 1.5, 2.1, 2.5, 3.1, 3.5
    """
    
    def setUp(self):
        """Set up test data for project editing tests"""
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
            first_name='Associate',
            last_name='One'
        )
        
        self.associate2 = User.objects.create_user(
            email='associate2@iiti.ac.in',
            password='testpass123',
            role=User.Role.ASSOCIATE,
            first_name='Associate',
            last_name='Two'
        )
        
        # Create domain
        self.domain = Domain.objects.create(name='Web Development')
        
        # Create API client
        self.client = APIClient()

    def test_project_editing_with_contributor_updates(self):
        """
        Test complete project editing flow including contributor management.
        Requirements: 1.1, 1.5, 2.1, 2.5, 3.1, 3.5
        """
        # Setup: Create initial project
        self.client.force_authenticate(user=self.president)
        
        initial_project_data = {
            'name': 'Original Project Name',
            'description': 'Original description',
            'tech_stack': 'React, Node.js',
            'github_link': 'https://github.com/test/original',
            'deployment_link': 'https://original.example.com',
            'domains': [self.domain.id],
            'add_self_as_contributor': True
        }
        
        # Step 1: Create project
        response = self.client.post('/api/projects/', initial_project_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project_id = response.data['id']
        
        # Verify initial state
        self.assertEqual(response.data['name'], 'Original Project Name')
        self.assertEqual(len(response.data['team_members_details']), 1)
        self.assertEqual(response.data['team_members_details'][0]['id'], self.president.id)
        
        # Step 2: Update project with new contributors
        updated_project_data = {
            'name': 'Updated Project Name',
            'description': 'Updated description with more details',
            'tech_stack': 'React, Node.js, PostgreSQL, Docker',
            'github_link': 'https://github.com/test/updated',
            'deployment_link': 'https://updated.example.com',
            'team_members': [self.president.id, self.coordinator.id, self.associate1.id]
        }
        
        response = self.client.patch(f'/api/projects/{project_id}/', updated_project_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify updates
        self.assertEqual(response.data['name'], 'Updated Project Name')
        self.assertEqual(response.data['description'], 'Updated description with more details')
        self.assertEqual(response.data['tech_stack'], 'React, Node.js, PostgreSQL, Docker')
        self.assertEqual(response.data['github_link'], 'https://github.com/test/updated')
        self.assertEqual(response.data['deployment_link'], 'https://updated.example.com')
        
        # Verify contributors were updated
        self.assertEqual(len(response.data['team_members_details']), 3)
        contributor_ids = [member['id'] for member in response.data['team_members_details']]
        self.assertIn(self.president.id, contributor_ids)
        self.assertIn(self.coordinator.id, contributor_ids)
        self.assertIn(self.associate1.id, contributor_ids)
        
        # Step 3: Verify database state
        project = Project.objects.get(id=project_id)
        self.assertEqual(project.name, 'Updated Project Name')
        self.assertEqual(project.team_members.count(), 3)
        self.assertTrue(project.team_members.filter(id=self.president.id).exists())
        self.assertTrue(project.team_members.filter(id=self.coordinator.id).exists())
        self.assertTrue(project.team_members.filter(id=self.associate1.id).exists())
        
        # Step 4: Update to remove some contributors
        reduced_project_data = {
            'team_members': [self.president.id, self.coordinator.id]
        }
        
        response = self.client.patch(f'/api/projects/{project_id}/', reduced_project_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify contributor reduction
        self.assertEqual(len(response.data['team_members_details']), 2)
        contributor_ids = [member['id'] for member in response.data['team_members_details']]
        self.assertIn(self.president.id, contributor_ids)
        self.assertIn(self.coordinator.id, contributor_ids)
        self.assertNotIn(self.associate1.id, contributor_ids)

    def test_project_editing_permissions(self):
        """
        Test permission validation for project editing.
        Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
        """
        # Setup: Create project with coordinator as creator
        self.client.force_authenticate(user=self.coordinator)
        
        project_data = {
            'name': 'Permission Test Project',
            'description': 'Testing edit permissions',
            'tech_stack': 'Permission Testing',
            'github_link': 'https://github.com/test/permissions',
            'domains': [self.domain.id],
            'add_self_as_contributor': True
        }
        
        response = self.client.post('/api/projects/', project_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project_id = response.data['id']
        
        # Step 1: Creator should be able to edit
        update_data = {
            'name': 'Updated by Creator',
            'description': 'Updated by the project creator'
        }
        
        response = self.client.patch(f'/api/projects/{project_id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated by Creator')
        
        # Step 2: President should be able to edit any project
        self.client.force_authenticate(user=self.president)
        
        update_data = {
            'name': 'Updated by President',
            'description': 'Updated by president'
        }
        
        response = self.client.patch(f'/api/projects/{project_id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated by President')
        
        # Step 3: Non-creator associate should NOT be able to edit
        self.client.force_authenticate(user=self.associate1)
        
        update_data = {
            'name': 'Unauthorized Update',
            'description': 'This should fail'
        }
        
        response = self.client.patch(f'/api/projects/{project_id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Step 4: Unauthenticated user should not be able to edit
        self.client.force_authenticate(user=None)
        
        response = self.client.patch(f'/api/projects/{project_id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_backward_compatibility_with_existing_projects(self):
        """
        Test that existing projects without created_by field work correctly.
        Requirements: 1.1, 1.5, 2.1, 2.5
        """
        # Create a project directly in database without created_by (simulating old project)
        project = Project.objects.create(
            name='Legacy Project',
            description='Project created before created_by field',
            tech_stack='Legacy Tech',
            github_link='https://github.com/test/legacy'
        )
        project.domains.add(self.domain)
        
        # Step 1: Verify project can be retrieved
        self.client.force_authenticate(user=self.president)
        response = self.client.get(f'/api/projects/{project.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Legacy Project')
        self.assertIsNone(response.data['created_by'])
        
        # Step 2: President should be able to edit legacy project
        update_data = {
            'name': 'Updated Legacy Project',
            'description': 'Updated legacy project description'
        }
        
        response = self.client.patch(f'/api/projects/{project.id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Legacy Project')
        
        # Step 3: Associate should not be able to edit legacy project
        self.client.force_authenticate(user=self.associate1)
        
        update_data = {
            'name': 'Unauthorized Legacy Update'
        }
        
        response = self.client.patch(f'/api/projects/{project.id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_project_creation_api_call_includes_add_self_flag(self):
        """
        Test that existing project creation API calls work with add_self_as_contributor flag.
        Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
        """
        self.client.force_authenticate(user=self.coordinator)
        
        # Test 1: Default behavior (add_self_as_contributor should default to True)
        project_data_default = {
            'name': 'Default Behavior Project',
            'description': 'Testing default self-assignment',
            'tech_stack': 'Default Testing',
            'github_link': 'https://github.com/test/default',
            'domains': [self.domain.id]
            # No add_self_as_contributor field - should default to True
        }
        
        response = self.client.post('/api/projects/', project_data_default, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Should have coordinator as contributor by default
        self.assertEqual(len(response.data['team_members_details']), 1)
        self.assertEqual(response.data['team_members_details'][0]['id'], self.coordinator.id)
        
        # Test 2: Explicit True
        project_data_explicit_true = {
            'name': 'Explicit True Project',
            'description': 'Testing explicit true self-assignment',
            'tech_stack': 'Explicit Testing',
            'github_link': 'https://github.com/test/explicit-true',
            'domains': [self.domain.id],
            'add_self_as_contributor': True
        }
        
        response = self.client.post('/api/projects/', project_data_explicit_true, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Should have coordinator as contributor
        self.assertEqual(len(response.data['team_members_details']), 1)
        self.assertEqual(response.data['team_members_details'][0]['id'], self.coordinator.id)
        
        # Test 3: Explicit False
        project_data_explicit_false = {
            'name': 'Explicit False Project',
            'description': 'Testing explicit false self-assignment',
            'tech_stack': 'No Self Testing',
            'github_link': 'https://github.com/test/explicit-false',
            'domains': [self.domain.id],
            'add_self_as_contributor': False
        }
        
        response = self.client.post('/api/projects/', project_data_explicit_false, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Should have no contributors
        self.assertEqual(len(response.data['team_members_details']), 0)
        
        # Test 4: With explicit contributors and add_self_as_contributor True
        project_data_with_contributors = {
            'name': 'Contributors Plus Self Project',
            'description': 'Testing contributors with self-assignment',
            'tech_stack': 'Combined Testing',
            'github_link': 'https://github.com/test/contributors-plus-self',
            'domains': [self.domain.id],
            'team_members': [self.associate1.id, self.associate2.id],
            'add_self_as_contributor': True
        }
        
        response = self.client.post('/api/projects/', project_data_with_contributors, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Should have coordinator + 2 associates = 3 contributors
        self.assertEqual(len(response.data['team_members_details']), 3)
        contributor_ids = [member['id'] for member in response.data['team_members_details']]
        self.assertIn(self.coordinator.id, contributor_ids)
        self.assertIn(self.associate1.id, contributor_ids)
        self.assertIn(self.associate2.id, contributor_ids)

    def test_integration_with_existing_project_workflows(self):
        """
        Test integration with existing project workflows and components.
        Requirements: 1.1, 1.5, 2.1, 2.5, 3.1, 3.5
        """
        self.client.force_authenticate(user=self.president)
        
        # Step 1: Create project using the enhanced API
        project_data = {
            'name': 'Workflow Integration Project',
            'description': 'Testing workflow integration',
            'tech_stack': 'Integration Testing',
            'github_link': 'https://github.com/test/workflow',
            'deployment_link': 'https://workflow.example.com',
            'domains': [self.domain.id],
            'add_self_as_contributor': True
        }
        
        response = self.client.post('/api/projects/', project_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project_id = response.data['id']
        
        # Step 2: Test project retrieval (GET)
        response = self.client.get(f'/api/projects/{project_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify all expected fields are present
        expected_fields = [
            'id', 'name', 'description', 'tech_stack', 'github_link', 
            'deployment_link', 'created_at', 'updated_at', 'created_by',
            'team_members_details', 'domains_details'
        ]
        for field in expected_fields:
            self.assertIn(field, response.data)
        
        # Step 3: Test project list (GET all)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        
        # Find our project in the list
        our_project = next((p for p in response.data if p['id'] == project_id), None)
        self.assertIsNotNone(our_project)
        
        # Step 4: Test project update (PUT)
        full_update_data = {
            'name': 'Fully Updated Project',
            'description': 'Completely updated description',
            'tech_stack': 'Updated, Tech, Stack',
            'github_link': 'https://github.com/test/fully-updated',
            'deployment_link': 'https://fully-updated.example.com',
            'domains': [self.domain.id],
            'team_members': [self.president.id, self.coordinator.id]
        }
        
        response = self.client.put(f'/api/projects/{project_id}/', full_update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify full update
        self.assertEqual(response.data['name'], 'Fully Updated Project')
        self.assertEqual(len(response.data['team_members_details']), 2)
        
        # Step 5: Test partial update (PATCH)
        partial_update_data = {
            'description': 'Partially updated description'
        }
        
        response = self.client.patch(f'/api/projects/{project_id}/', partial_update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['description'], 'Partially updated description')
        # Other fields should remain unchanged
        self.assertEqual(response.data['name'], 'Fully Updated Project')
        
        # Step 6: Test contributor management integration
        contributors_url = reverse('project-manage-contributors', kwargs={'pk': project_id})
        
        # Add contributor
        add_data = {
            'user_ids': [self.associate1.id],
            'action': 'add'
        }
        
        response = self.client.post(contributors_url, add_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify contributor was added
        response = self.client.get(f'/api/projects/{project_id}/')
        self.assertEqual(len(response.data['team_members_details']), 3)
        
        # Step 7: Test available contributors integration
        available_url = reverse('project-available-contributors', kwargs={'pk': project_id})
        response = self.client.get(available_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should exclude current contributors
        available_emails = [user['email'] for user in response.data['available_contributors']]
        self.assertNotIn('president@iiti.ac.in', available_emails)
        self.assertNotIn('coordinator@iiti.ac.in', available_emails)
        self.assertNotIn('associate1@iiti.ac.in', available_emails)
        self.assertIn('associate2@iiti.ac.in', available_emails)
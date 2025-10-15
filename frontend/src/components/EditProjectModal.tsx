import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { updateProject } from '../services/api';
import { User } from '../services/authService';
import ContributorManagement from './ContributorManagement';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ProjectResponse } from '../services/api';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: (updatedProject: ProjectResponse) => void;
  project: ProjectResponse;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onProjectUpdated, 
  project 
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [title, setTitle] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [techStack, setTechStack] = useState(project.tech_stack);
  const [githubLink, setGithubLink] = useState(project.github_link);
  const [deploymentLink, setDeploymentLink] = useState(project.deployment_link || '');
  const [contributors, setContributors] = useState<User[]>(project.team_members_details);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.name);
      setDescription(project.description);
      setTechStack(project.tech_stack);
      setGithubLink(project.github_link);
      setDeploymentLink(project.deployment_link || '');
      setContributors(project.team_members_details);
      setErrors({});
    }
  }, [project]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!techStack.trim()) {
      newErrors.techStack = 'Tech stack is required';
    }

    if (!githubLink.trim()) {
      newErrors.githubLink = 'GitHub link is required';
    } else {
      try {
        new URL(githubLink);
      } catch {
        newErrors.githubLink = 'Please enter a valid GitHub URL';
      }
    }

    if (deploymentLink.trim()) {
      try {
        new URL(deploymentLink);
      } catch {
        newErrors.deploymentLink = 'Please enter a valid deployment URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const contributorIds = contributors.map(contributor => parseInt(contributor.id));
      
      const projectData = {
        name: title.trim(),
        description: description.trim(),
        tech_stack: techStack.trim(),
        github_link: githubLink.trim(),
        deployment_link: deploymentLink.trim() || null,
        team_members: contributorIds
      };

      const updatedProject = await updateProject(project.id.toString(), projectData);
      onProjectUpdated(updatedProject.data);
      
      addToast({
        type: 'success',
        title: 'Project updated successfully!',
        message: 'Your project changes have been saved.'
      });
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
      setErrors({ submit: 'Failed to update project. Please try again.' });
      addToast({
        type: 'error',
        title: 'Failed to update project',
        message: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContributorsUpdate = (updatedContributors: User[]) => {
    setContributors(updatedContributors);
  };

  const canEdit = user && (
    user.role === 'PRESIDENT' || 
    user.role === 'HEAD' || 
    user.role === 'COORDINATOR' ||
    (project.name && user.id === project.name.toString())
  );

  if (!isOpen || !canEdit) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-900 rounded-2xl max-w-4xl w-full border border-gray-700 relative max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-10"
        >
          ×
        </button>
        <div className="p-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Edit Project</h2>
          
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-white mb-2 font-medium">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    errors.title ? 'border-red-500' : 'border-gray-700'
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                  placeholder="Enter project title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="techStack" className="block text-white mb-2 font-medium">
                  Tech Stack <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="techStack"
                  value={techStack}
                  onChange={(e) => {
                    setTechStack(e.target.value);
                    if (errors.techStack) setErrors(prev => ({ ...prev, techStack: '' }));
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    errors.techStack ? 'border-red-500' : 'border-gray-700'
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                  placeholder="React, Node.js, MongoDB"
                />
                {errors.techStack && (
                  <p className="mt-1 text-sm text-red-400">{errors.techStack}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-white mb-2 font-medium">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                }}
                rows={4}
                className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                  errors.description ? 'border-red-500' : 'border-gray-700'
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-vertical`}
                placeholder="Describe your project"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="githubLink" className="block text-white mb-2 font-medium">
                  GitHub Link <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  id="githubLink"
                  value={githubLink}
                  onChange={(e) => {
                    setGithubLink(e.target.value);
                    if (errors.githubLink) setErrors(prev => ({ ...prev, githubLink: '' }));
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    errors.githubLink ? 'border-red-500' : 'border-gray-700'
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                  placeholder="https://github.com/username/repository"
                />
                {errors.githubLink && (
                  <p className="mt-1 text-sm text-red-400">{errors.githubLink}</p>
                )}
              </div>

              <div>
                <label htmlFor="deploymentLink" className="block text-white mb-2 font-medium">
                  Deployment Link
                </label>
                <input
                  type="url"
                  id="deploymentLink"
                  value={deploymentLink}
                  onChange={(e) => {
                    setDeploymentLink(e.target.value);
                    if (errors.deploymentLink) setErrors(prev => ({ ...prev, deploymentLink: '' }));
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    errors.deploymentLink ? 'border-red-500' : 'border-gray-700'
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                  placeholder="https://your-demo-site.com"
                />
                {errors.deploymentLink && (
                  <p className="mt-1 text-sm text-red-400">{errors.deploymentLink}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-white mb-3 font-medium">
                Contributors Management
              </label>
              <p className="text-sm text-gray-400 mb-4">
                Manage team members for this project. Add or remove contributors as needed.
              </p>
              
              <ContributorManagement
                projectId={project.id.toString()}
                currentContributors={contributors}
                onContributorsUpdate={handleContributorsUpdate}
                canManage={true}
              />
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {isSubmitting ? 'Updating...' : 'Update Project'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditProjectModal;
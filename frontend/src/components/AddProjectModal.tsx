import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createProject } from '../services/api';
import { User } from '../services/authService';
import ContributorSelector from './ContributorSelector';
// import { useAuth } from '../contexts/AuthContext';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: (newProject: any) => void;
  allUsers: User[];
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onProjectAdded, allUsers }) => {
  // const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [liveDemoLink, setLiveDemoLink] = useState('');
  const [selectedContributors, setSelectedContributors] = useState<User[]>([]);
  const [addSelfAsContributor, setAddSelfAsContributor] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleContributorChange = (contributors: User[]) => {
    setSelectedContributors(contributors);
    if (contributors.length > 0 || addSelfAsContributor) {
      setErrors(prev => ({ ...prev, contributors: '' }));
    }
  };

  const handleAddSelfChange = (addSelf: boolean) => {
    setAddSelfAsContributor(addSelf);
    if (addSelf || selectedContributors.length > 0) {
      setErrors(prev => ({ ...prev, contributors: '' }));
    }
  };

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


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const contributorIds = selectedContributors.map(contributor => parseInt(contributor.id));
      
      const projectData = {
        name: title.trim(),
        description: description.trim(),
        tech_stack: techStack.trim(),
        github_link: githubLink.trim() || null,
        deployment_link: liveDemoLink.trim() || null,
        team_members: contributorIds,
        domains: [1], 
        add_self_as_contributor: addSelfAsContributor
      };

      const newProject = await createProject(projectData);
      onProjectAdded(newProject.data);
      
      setTitle('');
      setDescription('');
      setTechStack('');
      setGithubLink('');
      setLiveDemoLink('');
      setSelectedContributors([]);
      setAddSelfAsContributor(true);
      setErrors({});
      
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      setErrors({ submit: 'Failed to create project. Please try again.' });
    }
  };

  if (!isOpen) return null;

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
        className="bg-gray-900 rounded-2xl max-w-2xl w-full border border-gray-700 relative max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-10"
        >
          ×
        </button>
        <div className="p-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Add Project</h2>
          
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="e.g., React, Node.js, MongoDB"
              />
              {errors.techStack && (
                <p className="mt-1 text-sm text-red-400">{errors.techStack}</p>
              )}
            </div>

            <div>
              <label htmlFor="githubLink" className="block text-white mb-2 font-medium">
                GitHub Link
              </label>
              <input
                type="url"
                id="githubLink"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="https://github.com/username/repository"
              />
            </div>

            <div>
              <label htmlFor="liveDemoLink" className="block text-white mb-2 font-medium">
                Live Demo Link
              </label>
              <input
                type="url"
                id="liveDemoLink"
                value={liveDemoLink}
                onChange={(e) => setLiveDemoLink(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="https://your-demo-site.com"
              />
            </div>

            <div>
              <label className="block text-white mb-3 font-medium">
                Contributors
              </label>
              <p className="text-sm text-gray-400 mb-4">
                Select team members for this project. You can add contributors now or leave it empty and add them later.
              </p>
              
              <ContributorSelector
                selectedContributors={selectedContributors}
                availableUsers={allUsers}
                onContributorChange={handleContributorChange}
                showAddSelfOption={true}
                addSelfAsContributor={addSelfAsContributor}
                onAddSelfChange={handleAddSelfChange}
                maxHeight="max-h-48"
              />
              
              {errors.contributors && (
                <p className="mt-2 text-sm text-red-400">{errors.contributors}</p>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddProjectModal;

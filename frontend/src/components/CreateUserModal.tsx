import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import authService from '../services/authService';
import LoadingSpinner from './LoadingSpinner';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'COORDINATOR',
    domain: '',
    year: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = [
    { value: 'HEAD', label: 'Head' },
    { value: 'COORDINATOR', label: 'Coordinator' },
    { value: 'ASSOCIATE', label: 'Associate' }
  ];

  const domainOptions = [
    { value: 'COMPETITIVE_PROGRAMMING', label: 'Competitive Programming' },
    { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
    { value: 'SYSTEMS_PROGRAMMING', label: 'Systems Programming' },
    { value: 'GRAPHICS_PROGRAMMING', label: 'Graphics Programming' },
    { value: 'MACHINE_LEARNING', label: 'Machine Learning' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }



    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.domain) {
      newErrors.domain = 'Domain is required';
    }

    if (!formData.year) {
      newErrors.year = 'Graduation year is required';
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
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        domain: formData.domain,
        year: formData.year
      };

      await authService.createUser(userData);
      
      addToast({
        type: 'success',
        title: 'User Created Successfully',
        message: `User with email ${formData.email} has been added to the system.`
      });
      
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'COORDINATOR',
        domain: '',
        year: ''
      });
      setErrors({});
      
      onClose();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to create user. Please try again.';
      
      if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to create users. Only Presidents can create new users.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.email?.[0]) {
        errorMessage = error.response.data.email[0];
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (Array.isArray(error.response?.data) && error.response.data.length > 0) {
        errorMessage = error.response.data[0];
      } else if (error.response?.data && typeof error.response.data === 'object') {
        const firstError = Object.values(error.response.data)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else {
          errorMessage = String(firstError);
        }
      }
      
      addToast({
        type: 'error',
        title: 'Failed to Create User',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'COORDINATOR',
        domain: '',
        year: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gray-900 rounded-2xl max-w-2xl w-full border border-gray-700 relative max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Create New User</h2>
                <p className="text-gray-400 mt-1">Add a new member to the organization</p>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-white text-2xl transition-colors disabled:opacity-50"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">


              <div>
                <label htmlFor="create_email" className="block text-white mb-2 font-medium">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="create_email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    errors.email ? 'border-red-500' : 'border-gray-700'
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="create_role" className="block text-white mb-2 font-medium">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="create_role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                      errors.role ? 'border-red-500' : 'border-gray-700'
                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-400">{errors.role}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="create_domain" className="block text-white mb-2 font-medium">
                    Domain <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="create_domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                      errors.domain ? 'border-red-500' : 'border-gray-700'
                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                  >
                    <option value="">Select Domain</option>
                    {domainOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.domain && (
                    <p className="mt-1 text-sm text-red-400">{errors.domain}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="create_year" className="block text-white mb-2 font-medium">
                    Graduation Year <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="create_year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                      errors.year ? 'border-red-500' : 'border-gray-700'
                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                    placeholder="e.g., 2025"
                  />
                  {errors.year && (
                    <p className="mt-1 text-sm text-red-400">{errors.year}</p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="create_password" className="block text-white mb-2 font-medium">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    id="create_password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                      errors.password ? 'border-red-500' : 'border-gray-700'
                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="create_confirmPassword" className="block text-white mb-2 font-medium">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    id="create_confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 text-lg">ℹ️</span>
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">User Creation Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li>You must provide email, role, domain, graduation year, and password</li>
                      <li>Users will complete their name and other details when they first log in</li>
                      <li>Role, domain, and graduation year cannot be changed by users later</li>
                      <li>Password must be at least 8 characters long</li>
                      <li>Users can edit their bio, social links, and profile picture after login</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <LoadingSpinner size="sm" />}
                  {isSubmitting ? 'Creating User...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateUserModal;
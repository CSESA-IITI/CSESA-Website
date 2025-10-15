import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import authService from '../services/authService';
import LoadingSpinner from './LoadingSpinner';

const OnboardingModal: React.FC = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: '',
    github_link: '',
    linkedin_link: '',
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(() => {
    return localStorage.getItem('onboarding_completed') === 'true';
  });

  React.useEffect(() => {
    if (user?.is_onboarded && localStorage.getItem('onboarding_completed') === 'true') {
      console.log('Cleaning up onboarding_completed flag - user is now onboarded');
      localStorage.removeItem('onboarding_completed');
    }
  }, [user?.is_onboarded]);



  if (!user || user.is_onboarded || isCompleted) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'File Too Large',
          message: 'Please select an image smaller than 5MB.'
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        addToast({
          type: 'error',
          title: 'Invalid File Type',
          message: 'Please select a valid image file.'
        });
        return;
      }

      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number) => {
    const newErrors: {[key: string]: string} = {};

    if (step === 1) {
      if (!formData.first_name.trim()) {
        newErrors.first_name = 'First name is required';
      }
      if (!formData.last_name.trim()) {
        newErrors.last_name = 'Last name is required';
      }
    }

    if (step === 2) {
      if (formData.github_link && !formData.github_link.match(/^https?:\/\/(www\.)?github\.com\/.+/)) {
        newErrors.github_link = 'Please enter a valid GitHub URL';
      }
      if (formData.linkedin_link && !formData.linkedin_link.match(/^https?:\/\/(www\.)?linkedin\.com\/.+/)) {
        newErrors.linkedin_link = 'Please enter a valid LinkedIn URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      if (profileImage) {
        submitData.append('image', profileImage);
      }

      submitData.append('is_onboarded', 'true');

      const updatedUser = await authService.updateProfile(submitData);
      
      setUser(updatedUser);
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      localStorage.setItem('onboarding_completed', 'true');
      setIsCompleted(true);
      
      addToast({
        type: 'success',
        title: 'Welcome to CSESA!',
        message: 'Your profile has been set up successfully.'
      });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      addToast({
        type: 'error',
        title: 'Setup Failed',
        message: 'Failed to complete profile setup. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to CSESA!</h3>
              <p className="text-gray-400">Complete your profile to get started</p>
              <p className="text-sm text-blue-300 mt-2">Your role, domain, and graduation year have been set by the President</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-white mb-2 font-medium">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    errors.first_name ? 'border-red-500' : 'border-gray-700'
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                  placeholder="Enter your first name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-white mb-2 font-medium">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    errors.last_name ? 'border-red-500' : 'border-gray-700'
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                  placeholder="Enter your last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.last_name}</p>
                )}
              </div>
            </div>



            <div>
              <label htmlFor="bio" className="block text-white mb-2 font-medium">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-vertical"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Add Your Photo</h3>
              <p className="text-gray-400">Upload a profile picture and add your social links</p>
            </div>

            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white/20 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-white/40">
                      👤
                    </div>
                  )}
                </div>
                
                <motion.label
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                >
                  <span className="text-white text-lg">📷</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </motion.label>
              </div>
              <p className="text-sm text-gray-400">Click the camera icon to upload a photo</p>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <div>
                <label htmlFor="github_link" className="block text-white mb-2 font-medium">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  id="github_link"
                  name="github_link"
                  value={formData.github_link}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    errors.github_link ? 'border-red-500' : 'border-gray-700'
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                  placeholder="https://github.com/username"
                />
                {errors.github_link && (
                  <p className="mt-1 text-sm text-red-400">{errors.github_link}</p>
                )}
              </div>

              <div>
                <label htmlFor="linkedin_link" className="block text-white mb-2 font-medium">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="linkedin_link"
                  name="linkedin_link"
                  value={formData.linkedin_link}
                  onChange={handleChange}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    errors.linkedin_link ? 'border-red-500' : 'border-gray-700'
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors`}
                  placeholder="https://linkedin.com/in/username"
                />
                {errors.linkedin_link && (
                  <p className="mt-1 text-sm text-red-400">{errors.linkedin_link}</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 rounded-2xl max-w-2xl w-full border border-gray-700 relative"
      >
        {/* Progress Bar */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Step {currentStep} of 2</span>
            <span className="text-sm text-gray-400">{Math.round((currentStep / 2) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 2) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Previous
            </button>

            {currentStep < 2 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmitting && <LoadingSpinner size="sm" />}
                {isSubmitting ? 'Setting up...' : 'Complete Setup'}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import eventService, { Event, EventAPIError } from '../services/eventService';
// import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: (newEvent: Event) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onEventAdded }) => {
  // const { user } = useAuth();
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!date.trim()) {
      newErrors.date = 'Date is required';
    }

    if (!time.trim()) {
      newErrors.time = 'Time is required';
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (date && time) {
      const eventDateTime = new Date(`${date}T${time}`);
      if (eventDateTime <= new Date()) {
        newErrors.date = 'Event date must be in the future';
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
      const dateTime = new Date(`${date}T${time}`).toISOString();
      
      const eventData = {
        title: title.trim(),
        description: description.trim(),
        date: dateTime,
        location: location.trim()
      };

      const newEvent = await eventService.createEvent(eventData);
      onEventAdded(newEvent);
      
      addToast({
        type: 'success',
        title: 'Event Created Successfully',
        message: 'Your event has been added to the calendar.'
      });
      
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setLocation('');
      setErrors({});
      
      onClose();
    } catch (error) {
      console.error('Failed to create event:', error);
      const errorMessage = error instanceof EventAPIError 
        ? error.message 
        : 'Failed to create event. Please try again.';
      
      setErrors({ submit: errorMessage });
      addToast({
        type: 'error',
        title: 'Failed to Create Event',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
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
          <h2 className="text-2xl font-bold text-white mb-6">Add Event</h2>
          
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-white mb-2 font-medium">
                Event Title <span className="text-red-400">*</span>
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
                placeholder="Enter event title"
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
                placeholder="Describe the event"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-white mb-2 font-medium">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    errors.date ? 'border-red-500' : 'border-gray-700'
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-400">{errors.date}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="block text-white mb-2 font-medium">
                  Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    if (errors.time) setErrors(prev => ({ ...prev, time: '' }));
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    errors.time ? 'border-red-500' : 'border-gray-700'
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-400">{errors.time}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-white mb-2 font-medium">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
                }}
                className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                  errors.location ? 'border-red-500' : 'border-gray-700'
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                placeholder="Event location"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-400">{errors.location}</p>
              )}
            </div>



            <div className="flex space-x-3 pt-4">
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
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddEventModal;
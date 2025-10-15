import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import eventService, { Event, EventAPIError } from "../services/eventService";
import LoadingSpinner from "../components/LoadingSpinner";
import AddEventModal from "../components/AddEventModal";
import EditEventModal from "../components/EditEventModal";

type FilterType = 'all' | 'my';

const Events: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Event | null>(null);

  const canCreateEvents = eventService.canCreateEvents(user);

  const fetchEvents = async (filter: FilterType) => {
    setLoading(true);
    try {
      let fetchedEvents: Event[];
      
      if (filter === 'my') {
        fetchedEvents = await eventService.getMyEvents();
      } else {
        fetchedEvents = await eventService.getAllEvents();
      }
      
      setEvents(fetchedEvents);
      setFilteredEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      const errorMessage = error instanceof EventAPIError 
        ? error.message 
        : 'Failed to load events. Please try again.';
      
      addToast({
        type: 'error',
        title: 'Error Loading Events',
        message: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => fetchEvents(filter)
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleEventCreated = (newEvent: Event) => {
    setEvents(prev => [newEvent, ...prev]);
    setFilteredEvents(prev => [newEvent, ...prev]);
    setIsAddModalOpen(false);
    
    addToast({
      type: 'success',
      title: 'Event Created',
      message: 'Your event has been successfully created.'
    });
  };

  const handleEditEvent = (event: Event) => {
    setEventToEdit(event);
    setIsEditModalOpen(true);
  };

  const handleEventUpdated = (updatedEvent: Event) => {
    const updateEventsList = (eventsList: Event[]) =>
      eventsList.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      );

    setEvents(updateEventsList);
    setFilteredEvents(updateEventsList);
    setSelectedEvent(updatedEvent);
    setIsEditModalOpen(false);
    setEventToEdit(null);
    
    addToast({
      type: 'success',
      title: 'Event Updated',
      message: 'The event has been successfully updated.'
    });
  };

  const handleDeleteEvent = async (event: Event) => {
    try {
      await eventService.deleteEvent(event.id);
      
      const removeFromEventsList = (eventsList: Event[]) =>
        eventsList.filter(e => e.id !== event.id);

      setEvents(removeFromEventsList);
      setFilteredEvents(removeFromEventsList);
      setConfirmDelete(null);
      setSelectedEvent(null);
      
      addToast({
        type: 'success',
        title: 'Event Deleted',
        message: 'The event has been successfully removed.'
      });
    } catch (error) {
      console.error('Failed to delete event:', error);
      const errorMessage = error instanceof EventAPIError 
        ? error.message 
        : 'Failed to delete event. Please try again.';
      
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: errorMessage
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const EmptyState: React.FC<{ filter: FilterType }> = ({ filter }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="text-6xl mb-4">📅</div>
      <h3 className="text-xl font-semibold mb-2 text-white">
        {filter === 'my' ? 'No Events Created' : 'No Events Available'}
      </h3>
      <p className="text-gray-400 mb-6">
        {filter === 'my' 
          ? "You haven't created any events yet." 
          : "There are no events scheduled at the moment."
        }
      </p>
      {canCreateEvents && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold transition-all duration-300"
        >
          Create Your First Event
        </motion.button>
      )}
    </motion.div>
  );

  return (
    <section className="relative min-h-screen bg-black text-white px-4 py-32 overflow-hidden">
      <motion.div
        className="absolute top-24 left-24 w-96 h-96 rounded-full bg-blue-400 opacity-20 filter blur-xl"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative max-w-6xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="my-4 alegreya-sans-sc-regular inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full border border-blue-400/30 text-blue-300 text-base font-mono">
            &lt;EVENTS_CSESA/&gt;
          </span>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                activeFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All Events
            </button>
            {isAuthenticated && (
              <button
                onClick={() => handleFilterChange('my')}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  activeFilter === 'my'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                My Events
              </button>
            )}
          </div>

          {canCreateEvents && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <span>+</span>
              Create Event
            </motion.button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" message="Loading events..." />
          </div>
        )}

        {!loading && (
          <>
            {filteredEvents.length === 0 ? (
              <EmptyState filter={activeFilter} />
            ) : (
              <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500 transition-all duration-300 backdrop-blur-md relative cursor-pointer"
                    whileHover={{ y: -5, scale: 1.02 }}
                    variants={itemVariants}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {/* Management buttons for authorized users */}
                    {(event.can_edit || event.can_delete) && (
                      <div className="absolute top-3 right-3 flex gap-1">
                        {event.can_edit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                            className="p-2 bg-blue-600/80 hover:bg-blue-600 hover:scale-105 text-white rounded-full text-xs transition-colors"
                            title="Edit Event"
                          >
                            ✏️
                          </button>
                        )}
                        {event.can_delete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(event);
                            }}
                            className="p-2 bg-red-600/80 hover:bg-red-600 hover:scale-105 text-white rounded-full text-xs transition-colors"
                            title="Delete Event"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-2 text-white vamos pr-16">
                        {event.title}
                      </h3>
                      <p className="text-sm text-blue-400 mb-2 alegreya-sans-sc-regular">
                        {eventService.formatEventDate(event.date)}
                      </p>
                      <p className="text-sm text-gray-300 mb-3">
                        📍 {event.location}
                      </p>
                      <p className="text-gray-400 text-sm overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {event.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        By {event.created_by.first_name} {event.created_by.last_name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        eventService.isEventPast(event.date)
                          ? 'bg-gray-600/20 text-gray-400'
                          : eventService.isEventUpcoming(event.date)
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-blue-600/20 text-blue-400'
                      }`}>
                        {eventService.isEventPast(event.date)
                          ? 'Past'
                          : eventService.isEventUpcoming(event.date)
                          ? 'Upcoming'
                          : 'Scheduled'
                        }
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                className="bg-slate-900 border border-slate-700 text-white p-8 rounded-xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
                  onClick={() => setSelectedEvent(null)}
                >
                  ×
                </button>

                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-3 pr-8">{selectedEvent.title}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      📅 {eventService.formatEventDate(selectedEvent.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      📍 {selectedEvent.location}
                    </span>
                    <span className="flex items-center gap-1">
                      👤 {selectedEvent.created_by.first_name} {selectedEvent.created_by.last_name}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{selectedEvent.description}</p>
                </div>

                {(selectedEvent.can_edit || selectedEvent.can_delete) && (
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    {selectedEvent.can_edit && (
                      <button
                        onClick={() => handleEditEvent(selectedEvent)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Edit Event
                      </button>
                    )}
                    {selectedEvent.can_delete && (
                      <button
                        onClick={() => setConfirmDelete(selectedEvent)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Delete Event
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
            >
              <motion.div
                className="bg-slate-900 border border-slate-700 text-white p-8 rounded-xl max-w-md w-full relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4 text-red-400">Delete Event</h3>
                <p className="mb-6 text-gray-300">
                  Are you sure you want to delete "{confirmDelete.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(confirmDelete)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AddEventModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onEventAdded={handleEventCreated}
        />

        {eventToEdit && (
          <EditEventModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEventToEdit(null);
            }}
            onEventUpdated={handleEventUpdated}
            event={eventToEdit}
          />
        )}
      </div>
    </section>
  );
};

export default Events;
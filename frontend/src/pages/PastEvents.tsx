import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getEvents, deleteEvent } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import AddEventModal from "../components/AddEventModal";
import EditEventModal from "../components/EditEventModal";
import { EventResponse } from "../services/api";

type EventType = EventResponse & {
  image?: string;
};

const PastEvents: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventType | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<EventType | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        setEvents(response.data);
      } catch (err) {
        setError("Failed to fetch events. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const canManageEvents = user && (user.role === 'PRESIDENT' || user.role === 'HEAD');

  const handleAddEvent = (newEvent: EventResponse) => {
    setEvents([newEvent, ...events]);
  };

  const handleEditEvent = (event: EventType) => {
    setEventToEdit(event);
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = (updatedEvent: EventResponse) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async (event: EventType) => {
    try {
      await deleteEvent(event.id.toString());
      setEvents(events.filter(e => e.id !== event.id));
      setConfirmDelete(null);
      setSelectedEvent(null);
      
      addToast({
        type: 'success',
        title: 'Event Deleted',
        message: 'The event has been successfully removed.'
      });
    } catch (error) {
      console.error('Failed to delete event:', error);
      addToast({
        type: 'error',
        title: 'Failed to Delete Event',
        message: 'Please try again or contact support.'
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

  return (
    <section className="relative min-h-screen bg-black text-white px-4 py-32 overflow-hidden">
      {/* Background Effects */}
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

        {/* Add Event Button */}
        {canManageEvents && (
          <div className="flex justify-center mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold transition-all duration-300"
            >
              Add Event
            </motion.button>
          </div>
        )}

        {loading && <div className="text-center text-white/70">Loading Events...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        
        {!loading && !error && (
          <motion.div
            className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {events.map((event) => (
              <motion.div
                key={event.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500 transition-all duration-300 backdrop-blur-md relative"
                whileHover={{ y: -5, scale: 1.05 }}
                variants={itemVariants}
              >
                {/* Management buttons for authorized users */}
                {canManageEvents && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      className="p-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded text-xs"
                      title="Edit Event"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(event);
                      }}
                      className="p-1 bg-red-600/80 hover:bg-red-600 text-white rounded text-xs"
                      title="Delete Event"
                    >
                      🗑️
                    </button>
                  </div>
                )}
                
                <div onClick={() => setSelectedEvent(event)} className="cursor-pointer">
                  <img
                    src={event.image || `https://source.unsplash.com/random/400x400?technology,event&sig=${event.id}`}
                    alt={event.name}
                    className="rounded-lg mb-4 h-48 w-full object-cover"
                  />
                  <h3 className="text-lg font-semibold mb-2 text-white vamos">{event.name}</h3>
                  <p className="text-sm text-gray-300 mb-2 alegreya-sans-sc-regular">
                    {new Date(event.date).toLocaleDateString()} | {event.location}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.split(',').map((tag, index) => (
                      <span key={index} className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Event Detail Modal */}
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
                className="bg-slate-900 border border-slate-700 text-white p-8 rounded-xl max-w-xl w-full relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold">{selectedEvent.name}</h3>
                  {canManageEvents && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEvent(selectedEvent)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(selectedEvent)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  {new Date(selectedEvent.date).toLocaleDateString()} at {new Date(selectedEvent.date).toLocaleTimeString()} | {selectedEvent.location}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedEvent.tags.split(',').map((tag, index) => (
                    <span key={index} className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
                <p className="mb-4 text-gray-300">{selectedEvent.description}</p>
                <button
                  className="absolute top-3 right-4 text-gray-400 hover:text-white text-3xl"
                  onClick={() => setSelectedEvent(null)}
                >
                  &times;
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
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
                  Are you sure you want to delete "{confirmDelete.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(confirmDelete)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Event Modal */}
        <AddEventModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onEventAdded={handleAddEvent}
        />

        {/* Edit Event Modal */}
        {eventToEdit && (
          <EditEventModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEventToEdit(null);
            }}
            onEventUpdated={handleUpdateEvent}
            event={eventToEdit}
          />
        )}
      </div>
    </section>
  );
};

export default PastEvents;

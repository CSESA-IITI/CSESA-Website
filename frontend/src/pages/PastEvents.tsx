import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "../services/api"; // 1. Import your API service

// 2. Define types for the data from the API and for the component's state
interface ApiEvent {
  id: number;
  name: string;
  date: string;
  location: string;
  description: string;
  tags: string; // API sends tags as a single string
}

interface EventType {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  tags: string[]; // Component uses an array of strings
  image: string;
}

const PastEvents: React.FC = () => {
  // 3. State for events, loading, error, and the selected event for the modal
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  // 4. Fetch events from the API when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiService.getEvents();
        // 5. Transform API data to match the component's expected structure
        const transformedData = response.data.map((event: ApiEvent) => ({
          id: event.id,
          title: event.name, // Rename 'name' to 'title'
          date: new Date(event.date).toLocaleDateString("en-US", {
            year: 'numeric', month: 'long', day: 'numeric'
          }),
          location: event.location,
          description: event.description,
          tags: event.tags.split(",").map(tag => tag.trim()), // Split tags string into an array
          image: `https://source.unsplash.com/random/400x400?technology,event&sig=${event.id}`, // Placeholder image
        }));
        setEvents(transformedData);
      } catch (err) {
        setError("Failed to fetch events. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); // Empty dependency array ensures this runs only once

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

        {/* 6. Conditional rendering for loading, error, and success states */}
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
                className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition-all duration-300 backdrop-blur-md"
                whileHover={{ y: -5, scale: 1.05 }}
                onClick={() => setSelectedEvent(event)}
                variants={itemVariants}
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="rounded-lg mb-4 h-48 w-full object-cover"
                />
                <h3 className="text-lg font-semibold mb-2 text-white vamos">{event.title}</h3>
                <p className="text-sm text-gray-300 mb-2 alegreya-sans-sc-regular">
                  {event.date} | {event.location}
                </p>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
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
                className="bg-slate-900 border border-slate-700 text-white p-8 rounded-xl max-w-xl w-full relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-400 mb-2">
                  {selectedEvent.date} | {selectedEvent.location}
                </p>
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
      </div>
    </section>
  );
};

export default PastEvents;

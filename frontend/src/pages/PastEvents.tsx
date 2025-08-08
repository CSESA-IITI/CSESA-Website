import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiService } from "../services/apiService";

interface ApiEvent {
  id: number;
  name: string;
  date: string;
  description: string;
  location?: string;
  tags?: string[] | string;
}

// Interface for the transformed event data used by the component for rendering
interface DisplayEvent {
  id: number;
  title:string;
  date: string;
  location: string;
  description: string;
  tags: string[];
  image: string;
}


const PastEvents: React.FC = () => {
  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<DisplayEvent | null>(null);

 
  useEffect(() => {
    const fetchAndTransformEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiService.getEvents();
        
        // Access the .results property from the paginated response.
        const rawEvents = response.data.results || [];

        // Transform the raw API data into the format needed by the component
        const transformedEvents: DisplayEvent[] = rawEvents.map((event: ApiEvent) => {
          let eventTags: string[] = [];
          if (event.tags) {
            if (typeof event.tags === 'string') {
              eventTags = event.tags.split(",").map(tag => tag.trim());
            } else if (Array.isArray(event.tags)) {
              eventTags = event.tags;
            }
          }
          
          return {
            id: event.id,
            title: event.name || "Untitled Event",
            date: event.date
              ? new Date(event.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Date TBD",
            location: event.location || "Location TBD",
            description: event.description || "No description available.",
            tags: eventTags,
            image: `https://source.unsplash.com/random/400x300?technology,event&sig=${event.id}`,
          };
        });

        setEvents(transformedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Could not load events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndTransformEvents();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center text-white/70 text-lg">Loading Events...</div>;
    }

    if (error) {
      return <div className="text-center text-red-500 text-lg">{error}</div>;
    }

    if (events.length === 0) {
      return <div className="text-center text-white/70 text-lg">No past events found.</div>;
    }
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
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => setSelectedEvent(event)}
            variants={itemVariants}
          >
            <img
              src={event.image}
              alt={event.title}
              className="rounded-lg mb-4 h-48 w-full object-cover"
            />
            <h3 className="text-xl font-semibold mb-2 text-white vamos">{event.title}</h3>
            <p className="text-sm text-gray-300 mb-4 alegreya-sans-sc-regular">
              {event.date} | {event.location}
            </p>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span key={tag} className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <section className="relative min-h-screen bg-black text-white px-4 py-32 overflow-hidden">
      <div className="relative max-w-6xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="my-4 alegreya-sans-sc-regular inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full border border-blue-400/30 text-blue-300 text-base font-mono">
            &lt;PAST_EVENTS/&gt;
          </span>
        </motion.div>

        {renderContent()}

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
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
              >
                <img src={selectedEvent.image} alt={selectedEvent.title} className="rounded-lg mb-4 h-64 w-full object-cover"/>
                <h3 className="text-3xl font-bold mb-4 vamos">{selectedEvent.title}</h3>
                <p className="text-md text-gray-400 mb-4 alegreya-sans-sc-regular">
                  {selectedEvent.date} | {selectedEvent.location}
                </p>
                <p className="mb-6 text-gray-300 leading-relaxed">{selectedEvent.description}</p>
                <div className="flex flex-wrap gap-2">
                   {selectedEvent.tags.map((tag) => (
                    <span key={tag} className="text-sm bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  className="absolute top-4 right-5 text-gray-400 hover:text-white text-3xl"
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
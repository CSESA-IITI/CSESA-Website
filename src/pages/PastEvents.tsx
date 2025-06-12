import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const eventsList = [
    {
      id: 1,
      title: "Hackathon 2024",
      date: "March 10, 2024",
      location: "Main Auditorium",
      description:
        "A 24-hour coding challenge focused on solving real-world problems. Teams of up to 4 people compete for exciting prizes.",
      tags: ["Hackathon", "Innovation", "Collaboration"],
      image: "https://source.unsplash.com/random/400x400?hackathon"
    },
    {
      id: 2,
      title: "AI Workshop",
      date: "April 5, 2024",
      location: "CSE Lab 2",
      description:
        "Hands-on workshop exploring modern AI tools, hosted by faculty and alumni. Ideal for beginners and enthusiasts alike.",
      tags: ["AI", "Workshop", "Learning"],
      image: "https://source.unsplash.com/random/400x400?ai"
    },
    {
      id: 3,
      title: "Tech Talk: Cybersecurity",
      date: "May 18, 2024",
      location: "Room 104, CSE Block",
      description:
        "An expert session discussing the latest in cybersecurity trends and ethical hacking techniques.",
      tags: ["Cybersecurity", "Talk", "Awareness"],
      image: "https://source.unsplash.com/random/400x400?cybersecurity"
    }
  ];

  return (
    <section className="relative min-h-screen bg-black text-white px-4 py-20 overflow-hidden">
      {/* Background Effects */}
      <motion.div
        className="absolute top-24 left-24 w-96 h-96 rounded-full bg-blue-400 opacity-20"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 45, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative max-w-6xl mx-auto z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-300 bg-clip-text text-transparent">
          Past Events
        </h2>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {eventsList.map((event) => (
            <motion.div
              key={event.id}
              className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition-all duration-300 backdrop-blur-md"
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedEvent(event)}
            >
              <img
                src={event.image}
                alt={event.title}
                className="rounded-lg mb-4 h-48 w-full object-cover"
              />
              <h3 className="text-xl font-semibold mb-2 text-white">
                {event.title}
              </h3>
              <p className="text-sm text-gray-300 mb-2">{event.date} | {event.location}</p>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                className="bg-white text-black p-8 rounded-xl max-w-xl w-full relative"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-700 mb-2">
                  {selectedEvent.date} | {selectedEvent.location}
                </p>
                <p className="mb-4 text-gray-800">{selectedEvent.description}</p>
                <button
                  className="absolute top-2 right-3 text-black text-2xl"
                  onClick={() => setSelectedEvent(null)}
                >
                  ×
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Events;
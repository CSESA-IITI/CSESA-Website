import { useEffect, useState } from "react";
import { motion } from "motion/react";
import "./Home.css";
import About from "./About";
import CircularGallery from "../components/ui/CircularGallery";
import eventService from "../services/eventService";

const Home = () => {
  const [eventGalleryItems, setEventGalleryItems] = useState<{ image: string; text: string }[]>([]);

  useEffect(() => {
    eventService.getAllEvents()
      .then(events => setEventGalleryItems(events.filter(event => event.image_url).map(event => ({ image: event.image_url!, text: event.title }))))
      .catch(() => setEventGalleryItems([]));
  }, []);

  return (
    <motion.div>
      {/* Hero — original animation, unchanged */}
      <section className=" relative min-h-screen flex flex-col items-center justify-center text-black px-4 overflow-hidden bg-black ">
        {/* <GlowEffect /> */}
        <motion.div
          className="absolute bottom-50 border-1 border-gray-500 w-400 h-800 rounded-full bg-indigo-300 backdrop-brightness-150"
          animate={{
            boxShadow: ["0 0 200px rgba(0, 60, 255, 0.5)"],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-55 w-400 h-400 rounded-full bg-gray-950 bounce internal-shadow-box"
          animate={{
            boxShadow: [
              "0 0 100px rgba(16, 146, 246, 0.5)",
              // "0 0 20px rgba(0, 183, 255, 0.5)",
              // "0 0 10px rgba(34, 0, 255, 0.3)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div className="absolute bottom-30 w-400 h-800 rounded-full backdrop-blur-md" />

        <div className="z-20 text-white text-center border rounded ">
          {" "}
          <div className="p-4 ">
            <h1 className="p-4 border rounded text-4xl md:text-6xl font-extrabold mb-4 leading-tight vamos tracking-widest ">
              {`< CSESA />`}
            </h1>
            <p className="border rounded text-md md:text-xl mt-4 text-gray-300 max-w-2xl mx-auto alegreya-sans-sc-regular ">
              Computer Science Engineering Students Association
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section — refined */}
      <section
        id="gallery"
        className="relative w-full bg-black py-24 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 max-w-2xl"
          >
            <span className="alegreya-sans-sc-regular text-xs tracking-[0.3em] text-blue-300/80 uppercase">
              Events
            </span>
            <h2 className="vamos text-3xl md:text-5xl font-bold text-white mt-3 mb-4">
              A journey in frames
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Hackathons, workshops, and competitions that shaped our
              community — captured moment by moment.
            </p>
          </motion.div>

          {eventGalleryItems.length > 0 ? (
            <>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="h-[600px] w-full">
                <CircularGallery items={eventGalleryItems} bend={2} textColor="#60a5fa" borderRadius={0.08} font="bold 24px 'Figtree', sans-serif" scrollSpeed={2.5} scrollEase={0.08} />
              </motion.div>
              <p className="text-center text-xs text-gray-500 font-mono mt-8">Scroll or drag to explore — {eventGalleryItems.length} events captured</p>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/15 text-center text-gray-400">Event photos will appear here once they are uploaded.</div>
          )}
        </div>
      </section>

      <section id="about" className="relative w-full">
        <About />
      </section>
    </motion.div>
  );
};

export default Home;

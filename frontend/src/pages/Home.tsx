import { motion } from "motion/react";
import "./Home.css";
import About from "./About";
import CircularGallery from "../components/ui/CircularGallery";

const Home = () => {
  const eventGalleryItems = [
    {
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
      text: "TechFest 2024"
    },
    {
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop",
      text: "Hackathon Supreme"
    },
    {
      image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=600&fit=crop",
      text: "AI Workshop"
    },
    {
      image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop",
      text: "Code Sprint"
    },
    {
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop",
      text: "Web Dev Bootcamp"
    },
    {
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
      text: "Tech Talk Series"
    },
    {
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop",
      text: "Innovation Summit"
    },
    {
      image: "https://images.unsplash.com/photo-1515378791036-0648a814c963?w=800&h=600&fit=crop",
      text: "Coding Competition"
    },
    {
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
      text: "Project Showcase"
    },
    {
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
      text: "Alumni Meetup"
    }
  ];

  return (
    <motion.div>
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
      
      {/* Gallery Section */}
      <section className="relative w-full bg-black py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="alegreya-sans-sc-regular inline-block px-4 py-2 bg-slate-800/50 rounded-full border border-blue-400/30 text-blue-300 text-sm font-mono mb-6">
              &lt;EVENT_GALLERY/&gt;
            </span>
            <h2 className="text-4xl md:text-6xl font-black mb-4 vamos">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Our Journey
              </span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto alegreya-sans-sc-regular">
              Explore the moments that define our community - from hackathons to workshops, 
              competitions to celebrations.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-[600px] w-full"
          >
            <CircularGallery
              items={eventGalleryItems}
              bend={2}
              textColor="#60a5fa"
              borderRadius={0.08}
              font="bold 24px 'Figtree', sans-serif"
              scrollSpeed={2.5}
              scrollEase={0.08}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-gray-400 font-mono">
              Scroll or drag to explore • {eventGalleryItems.length} events captured
            </p>
          </motion.div>
        </div>
      </section>
      
      <section className="relative w-full ">
        <About />
      </section>
    </motion.div>
  );
};

export default Home;

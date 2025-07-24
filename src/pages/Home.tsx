import { motion } from "motion/react";
import "./Home.css";
import About from "./About";

const Home = () => {
  return (
    <motion.div>
      <section className="border-3 relative min-h-screen flex flex-col items-center justify-center text-black px-4 overflow-hidden bg-black ">
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

        {/* Main content */}
        <div className="z-20 text-white text-center border rounded ">
          {" "}
          {/* Centering text for better aesthetics */}
          <div className="p-4 ">
            <h1 className="p-4 border rounded text-4xl md:text-6xl font-extrabold mb-4 leading-tight vamos tracking-widest">
              {`< CSESA />`}
            </h1>
            <p className="border rounded text-md md:text-xl mt-4 text-gray-300 max-w-2xl mx-auto alegreya-sans-sc-regular ">
              Computer Science Engineering Students Association
            </p>
          </div>
        </div>
      </section>
      <section className="relative w-full ">
        <About />
      </section>
    </motion.div>
  );
};

export default Home;

import { motion, useScroll, useTransform, useInView, MotionValue } from "framer-motion";
import React, { useState, useEffect, useRef, useMemo } from "react";

// Define component-level types
interface MousePosition {
  x: number;
  y: number;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
  icon: string;
  tech: string;
}

interface Value {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  pattern: string;
}

// Define types for the GlowCard component's props
type GlowColor = "blue" | "purple" | "green" | "orange";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
}

const About: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const useCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState<number>(0);
    const [hasAnimated, setHasAnimated] = useState<boolean>(false);
    const counterRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(counterRef, { once: true, amount: 0.3 });

    useEffect(() => {
      if (!hasAnimated && isInView) {
        setHasAnimated(true);
        let startTime: number | null = null;
        const animate = (currentTime: DOMHighResTimeStamp) => {
          if (!startTime) startTime = currentTime;
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(easeProgress * end));
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }
    }, [end, duration, hasAnimated, isInView]);

    return { count, ref: counterRef };
  };

  const memberCounter = useCounter(50);
  const eventCounter = useCounter(10);
  const projectCounter = useCounter(8);
  const yearCounter = useCounter(7);

  const textY: MotionValue<string> = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const milestones: Milestone[] = useMemo(() => [
    { year: "2017", title: "Foundation", description: "CSESA was founded with a vision to create a supportive tech community.", icon: "🚀", tech: "Genesis Protocol" },
    { year: "2018", title: "First Hackathon", description: "Organized our inaugural hackathon 'CodeStorm', establishing CSESA as a major event organizer.", icon: "⚡", tech: "CodeStorm v1.0" },
    { year: "2019", title: "Industry Partnerships", description: "Formed strategic partnerships, providing students with internship and job opportunities.", icon: "🤝", tech: "Partnership Matrix" },
    { year: "2020", title: "Digital Transformation", description: "Successfully transitioned to virtual events, reaching a global audience.", icon: "🌐", tech: "Virtual Hub 2.0" },
    { year: "2022", title: "Innovation Lab", description: "Launched our Innovation Lab for access to cutting-edge technology and mentorship.", icon: "🔬", tech: "Lab OS" },
    { year: "2024", title: "AI Initiative", description: "Introduced AI/ML workshops and projects, keeping pace with technological advancements.", icon: "🤖", tech: "Neural Network" },
    { year: "2025", title: "Global Reach", description: "Expanded our community internationally, fostering global collaboration.", icon: "🌍", tech: "Global Mesh" },
  ], []);

  const values: Value[] = useMemo(() => [
    { title: "Innovation", description: "We foster creativity, pushing the boundaries of what's possible in technology.", icon: "💡", gradient: "from-blue-400 to-blue-600", pattern: "circuit" },
    { title: "Collaboration", description: "We believe in teamwork and create opportunities for students to learn from each other.", icon: "🤝", gradient: "from-purple-400 to-purple-600", pattern: "network" },
    { title: "Excellence", description: "We strive for the highest standards in our events, projects, and community initiatives.", icon: "⭐", gradient: "from-green-400 to-green-600", pattern: "hexagon" },
    { title: "Inclusivity", description: "We welcome students from all backgrounds, creating an environment where everyone can grow.", icon: "🌈", gradient: "from-orange-400 to-orange-600", pattern: "mesh" },
  ], []);

  const GlowCard: React.FC<GlowCardProps> = ({ children, className = "", glowColor = "blue" }) => {
    const colors: Record<GlowColor, string> = {
      blue: "shadow-blue-500/20 hover:shadow-blue-400/40",
      purple: "shadow-purple-500/20 hover:shadow-purple-400/40",
      green: "shadow-green-500/20 hover:shadow-green-400/40",
      orange: "shadow-orange-500/20 hover:shadow-orange-400/40",
    };

    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-600/40 shadow-2xl ${colors[glowColor]} transition-shadow duration-500 ${className}`}
        style={{ transformStyle: 'preserve-3d', perspective: 1000 } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        {children}
      </motion.div>
    );
  };

  interface Drop {
    id: number;
    x: number;
    delay: number;
    speed: number;
  }

  const BinaryRain: React.FC = () => {
    const [drops, setDrops] = useState<Drop[]>([]);

    useEffect(() => {
      const newDrops: Drop[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        speed: 20 + Math.random() * 30,
      }));
      setDrops(newDrops);
    }, []);

    return (
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
        {drops.map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute text-green-400 font-mono text-xs"
            style={{ left: `${drop.x}%` }}
            animate={{ y: ["-10vh", "110vh"] }}
            transition={{ duration: drop.speed, repeat: Infinity, ease: "linear", delay: drop.delay }}
          >
            {Math.random() > 0.5 ? "1" : "0"}
          </motion.div>
        ))}
      </div>
    );
  };

  // Main component render
  return (
    <div ref={containerRef} className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <BinaryRain />
      <motion.div className="fixed top-0 left-0 pointer-events-none z-50 mix-blend-screen" animate={{ x: mousePosition.x - 100, y: mousePosition.y - 100 }} transition={{ type: "tween", ease: "backOut", duration: 0.5 }}>
        <div className="w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
      </motion.div>
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div style={{ y: textY }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} className="text-center py-32">
          <span className="alegreya-sans-sc-regular inline-block px-4 py-2 bg-slate-800/50 rounded-full border border-blue-400/30 text-blue-300 text-sm font-mono mb-6">&lt;ABOUT_CSESA/&gt;</span>
          <p className="text-lg md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light alegreya-sans-sc-regular">Empowering the next generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-semibold">computer scientists</span> through innovation, collaboration, and excellence.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="mb-32">
          <GlowCard className="p-12 group" glowColor="blue">
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-center"><span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">OUR MISSION</span></h2>
            <p className="text-xl text-slate-300 leading-relaxed max-w-4xl mx-auto font-light alegreya-sans-sc-regular text-center">To create an <span className="text-blue-400 font-medium">inclusive community</span> where computer science students can learn, grow, and innovate together. We bridge the gap between <span className="text-blue-400 font-medium">academic learning</span> and <span className="text-blue-400 font-medium">industry practice</span>.</p>
          </GlowCard>
        </motion.div>
        

        {/* Enhanced Statistics with tech styling */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                SYSTEM STATUS
              </span>
            </h2>
            <div className="flex justify-center space-x-2 mt-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-blue-400 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 alegreya-sans-sc-regular">
            {[
              { counter: memberCounter, suffix: "+", label: "Active Members", color: "text-blue-400", bg: "blue" },
              { counter: eventCounter, suffix: "+", label: "Events Hosted", color: "text-blue-400", bg: "blue" },
              { counter: projectCounter, suffix: "+", label: "Projects Built", color: "text-blue-400", bg: "blue" },
              { counter: yearCounter, suffix: "+", label: "Years Strong", color: "text-blue-400", bg: "blue" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                ref={stat.counter.ref}
                initial={{ scale: 0, rotateY: -180 }}
                whileInView={{ scale: 1, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group"
              >
                <GlowCard glowColor={stat.bg as GlowColor} className="p-8 text-center h-full">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative"
                  >
                    <div className={`text-4xl md:text-6xl font-black mb-3 ${stat.color} relative`}>
                      <span className="relative z-10">{stat.counter.count}{stat.suffix}</span>
                      <motion.div
                        className="absolute inset-0 blur-lg opacity-50"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {stat.counter.count}{stat.suffix}
                      </motion.div>
                    </div>
                    <div className="text-slate-300 text-sm font-mono tracking-wider mb-2 opacity-60">
                      {`[${index + 1}.exe]`}
                    </div>
                    <div className="text-slate-300 text-lg font-light">{stat.label}</div>
                  </motion.div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                CORE VALUES
              </span>
            </h2>
            <p className="text-slate-400 font-mono text-sm">{'{ initializing_values.config }'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60, rotateX: -15 }}
                whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group"
              >
                <GlowCard className="p-8 h-full overflow-hidden" glowColor="blue">
                  <div className="relative">
                    <div className="flex items-center mb-6">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                        className={`text-4xl p-4 rounded-xl bg-gradient-to-r ${value.gradient} bg-opacity-20 mr-4 backdrop-blur-sm border border-white/10`}
                      >
                        {value.icon}
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{value.title}</h3>
                        <span className="text-xs font-mono text-slate-400 ">[{value.pattern}.dll]</span>
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-light alegreya-sans-sc-regular">{value.description}</p>

                    {/* Tech corner decorations */}
                    <div className="absolute top-0 right-0 w-16 h-16">
                      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/20"></div>
                      <div className="absolute top-6 right-6 w-2 h-2 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                TIMELINE.LOG
              </span>
            </h2>
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="text-blue-400 text-sm font-mono">LOADING HISTORY...</div>
              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                  animate={{ x: [-64, 64] as [number, number] }} // Cast to tuple of numbers
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 opacity-60"></div>

            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100, rotateY: -30 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`flex items-center mb-16 relative ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <GlowCard className="p-6 group" glowColor="blue">
                    <div className="flex items-start mb-4">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        className="text-3xl mr-4 p-3 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-600"
                      >
                        {milestone.icon}
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
                          <span className="text-cyan-400 font-mono text-sm px-2 py-1 bg-cyan-400/10 rounded border border-cyan-400/30">
                            {milestone.year}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-500 mb-3">[{milestone.tech}]</div>
                        <p className="text-slate-300 text-sm leading-relaxed font-light alegreya-sans-sc-regular">{milestone.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-mono text-green-400">DEPLOYED</span>
                    </div>
                  </GlowCard>
                </div>

\                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  className="absolute left-1/2 transform -translate-x-1/2"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full border-4 border-slate-900 shadow-lg"></div>
                    <motion.div
                      className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center py-20"
        >
          <GlowCard className="p-12 relative overflow-hidden" glowColor="blue">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -right-10 w-40 h-40 border-4 border-dashed border-blue-400/20 rounded-full"
            />

            <h2 className="text-4xl md:text-6xl font-black mb-6 relative">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                JOIN THE NETWORK
              </span>
            </h2>

            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto font-light leading-relaxed alegreya-sans-sc-regular">
              Be part of a community that's <span className="text-blue-400 font-medium">shaping the future</span> of technology.
              Whether you're a <span className="text-blue-400 font-medium">beginner</span> or an <span className="text-blue-400 font-medium">expert</span>,
              there's a place for you in CSESA.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-bold text-lg overflow-hidden"
              >
                <span className="relative z-10">Initialize Membership</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-transparent border-2 border-slate-400 text-slate-300 rounded-full font-bold text-lg overflow-hidden"
              >
                <span className="relative z-10">Explore Projects</span>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
              </motion.button>
            </div>

            {/* Tech decorations */}
            <div className="absolute bottom-4 right-4 w-16 h-16 opacity-30">
              <div className="w-full h-full border-2 border-dashed border-blue-400/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
            </div>
          </GlowCard>
        </motion.div>


      </div>
    </div>

  );
};

export default About;
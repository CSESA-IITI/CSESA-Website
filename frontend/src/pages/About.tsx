import {
  motion,
  useScroll,
  useTransform,
  useInView,
  MotionValue,
} from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { MultiLineReveal } from "../components/MultiLineReveal";
import systemService, { SystemStats } from "../services/systemService";




type GlowColor = "blue" | "purple" | "green" | "orange";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
}

const About: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await systemService.getSystemStats();
        setSystemStats(stats);
      } catch (error) {
        console.error('Failed to load system stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
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

  const memberCounter = useCounter(systemStats?.activeMembers || 45);
  const eventCounter = useCounter(systemStats?.totalEvents || 12);
  const projectCounter = useCounter(systemStats?.totalProjects || 8);
  const upcomingEventsCounter = useCounter(systemStats?.upcomingEvents || 3);

  const textY: MotionValue<string> = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", "50%"]
  );

  // const values: Value[] = useMemo(
  //   () => [
  //     {
  //       title: "Innovation",
  //       description:
  //         "We encourage curiosity, creativity, and problem-solving to develop cutting-edge solutions and ideas that push the boundaries of computer science.",
  //       icon: "💡",
  //       gradient: "from-blue-400 to-blue-600",
  //       pattern: "circuit",
  //     },
  //     {
  //       title: "Collaboration",
  //       description:
  //         "We believe in teamwork and knowledge-sharing—working with peers, faculty, and industry to achieve more together.",
  //       icon: "🤝",
  //       gradient: "from-purple-400 to-purple-600",
  //       pattern: "network",
  //     },
  //     {
  //       title: "Inclusivity",
  //       description:
  //         "We foster a welcoming community where every student feels valued, respected, and empowered to contribute regardless of background or skill level.",
  //       icon: "🌈",
  //       gradient: "from-orange-400 to-orange-600",
  //       pattern: "mesh",
  //     },
  //     {
  //       title: "Holistic Growth",
  //       description:
  //         "We go beyond academics by promoting technical, cultural, and leadership opportunities, ensuring well-rounded development for all students.",
  //       icon: "⭐",
  //       gradient: "from-green-400 to-green-600",
  //       pattern: "hexagon",
  //     },
  //   ],
  //   []
  // );
  const paragraph = [
    "Empowering the next generation of",
    "computer scientists through innovation,",
    "collaboration, and excellence.",
  ];

  const GlowCard: React.FC<GlowCardProps> = ({
    children,
    className = "",
    glowColor = "blue",
  }) => {
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
        style={
          {
            transformStyle: "preserve-3d",
            perspective: 1000,
          } as React.CSSProperties
        }
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        {children}
      </motion.div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black text-white overflow-x-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div
          style={{ y: textY }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center py-32"
        >
          <span className="alegreya-sans-sc-regular inline-block px-4 py-2 bg-slate-800/50 rounded-full border border-blue-400/30 text-blue-300 text-sm font-mono mb-6">
            &lt;ABOUT_CSESA/&gt;
          </span>
          {/* <motion.div
            // The text is initially fully clipped from the bottom (100%)
            // initial={{ clipPath: "inset(0 0 100% 0)" }}
            // // When in view, the bottom clip is removed (0%)
            // whileInView={{ clipPath: "inset(0 0 0% 0)" }}
            // viewport={{ once: false, margin: "-100px" }}
            // transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            ref={containerRef}
            style={{clipPath}}
            className="text-lg md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light alegreya-sans-sc-regular"
          >
            Empowering the next generation of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-semibold">
              computer scientists
            </span>{" "}
            through innovation, collaboration, and excellence.
          </motion.div> */}

          <MultiLineReveal
            lines={paragraph}
            className="text-lg text-center"
            lineClassName="text-slate-200"
            stagger={0.1} // You can adjust the stagger duration here
          />

          {/* <AdvancedLineReveal
            splitBy="manual"
            stagger={0.1}
            animateFrom="bottom"
            distance={60}
            duration={1.5}
            className=" text-slate-300 max-w-4xl mx-auto leading-relaxed font-light alegreya-sans-sc-regular"
            lineClassName="border"
            manualLines={[
              "Empowering the next generation of",
              "Computer Scientists",
              "through innovation, collaboration, and excellence."
            ]
            }
          >
          </AdvancedLineReveal> */}
          {/* <AdvancedLineReveal
            className="mb-8 text-center border"
            lineClassName="text-lg border md:text-lg text-slate-300 font-light leading-relaxed alegreya-sans-sc-regular"
            stagger={0.2}
            duration={0.8}
            splitBy="manual"
            manualLines={[
              "Empowering the next generation of",
              "computer scientists",
              "through innovation, collaboration, and excellence.",
            ]}
            animateFrom="top"
            distance={40}
          ></AdvancedLineReveal> */}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <GlowCard className="p-12 group" glowColor="blue">
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-center">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                About CSESA
              </span>
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed max-w-4xl mx-auto font-light alegreya-sans-sc-regular text-center">
              Fostering innovation, collaboration, and all-round growth in the next generation of computer scientists.
            </p>
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-center mt-12">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Mission
              </span>
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed max-w-4xl mx-auto font-light alegreya-sans-sc-regular text-center">
              To nurture an inclusive ecosystem that blends academic learning, industry practice, and community engagement for holistic student growth.
            </p>
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

                        <h2 className="text-3xl md:text-4xl font-black mb-4 vamos">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                SYSTEM STATUS
              </span>
            </h2>
            <div className="flex justify-center space-x-2 mt-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-blue-400 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 alegreya-sans-sc-regular">
            {[
              {
                counter: memberCounter,
                suffix: "",
                label: "Active Members",
                color: "text-cyan-400",
                bg: "blue",
                status: "ONLINE"
              },
              {
                counter: eventCounter,
                suffix: "",
                label: "Total Events",
                color: "text-green-400",
                bg: "green",
                status: "DEPLOYED"
              },
              {
                counter: upcomingEventsCounter,
                suffix: "",
                label: "Upcoming Events",
                color: "text-orange-400",
                bg: "orange",
                status: "SCHEDULED"
              },
              {
                counter: projectCounter,
                suffix: "",
                label: "Total Projects",
                color: "text-purple-400",
                bg: "purple",
                status: "BUILT"
              }
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
                <GlowCard
                  glowColor={stat.bg as GlowColor}
                  className="p-8 text-center h-full"
                >
                  <motion.div whileHover={{ scale: 1.1 }} className="relative">
                   
                    
                    
                    <div
                      className={`text-3xl md:text-5xl font-black mb-3 ${stat.color} relative`}
                    >
                      <span className="relative z-10 font-mono">
                        {isLoading ? (
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            --
                          </motion.span>
                        ) : (
                          <>
                            {stat.counter.count}
                            {stat.suffix}
                          </>
                        )}
                      </span>
                      <motion.div
                        className="absolute inset-0 blur-lg opacity-30"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {stat.counter.count}
                        {stat.suffix}
                      </motion.div>
                    </div>
                    
                    <div className="flex items-center justify-center mb-2">
                      <motion.div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          stat.status === 'ONLINE' ? 'bg-green-400' :
                          stat.status === 'DEPLOYED' ? 'bg-blue-400' :
                          stat.status === 'SCHEDULED' ? 'bg-orange-400' :
                          stat.status === 'BUILT' ? 'bg-purple-400' :
                          'bg-cyan-400'
                        }`}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-xs font-mono text-slate-400">
                        {stat.status}
                      </span>
                    </div>
                    
                    <div className="text-slate-300 text-sm font-light leading-tight">
                      {stat.label}
                    </div>
                    
                    <div className="text-slate-500 text-xs font-mono mt-2 opacity-50">
                      PID: {1000 + index}
                    </div>
                  </motion.div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <div className="text-center mb-16">

                        <h2 className="text-3xl md:text-5xl font-black mb-4 vamos">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                TECH DOMAINS
              </span>
            </h2>
            <div className="flex justify-center items-center space-x-2 mt-4">
              <span className="text-blue-400 text-sm font-mono">INITIALIZING MODULES...</span>
              <motion.div
                className="flex space-x-1"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-1 h-1 bg-blue-400 rounded-full" />
                ))}
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Web Development",
                description: "Full-stack development with modern frameworks and technologies",
                icon: "🌐",
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Machine Learning",
                description: "AI/ML research and applications in real-world problems",
                icon: "🤖",
                color: "from-purple-500 to-pink-500"
              },
              {
                title: "Competitive Programming",
                description: "Algorithmic problem solving and competitive coding",
                icon: "⚡",
                color: "from-orange-500 to-red-500"
              },
              {
                title: "Systems Programming",
                description: "Low-level programming and system architecture",
                icon: "⚙️",
                color: "from-gray-500 to-slate-600"
              },
              {
                title: "Graphics Programming",
                description: "Computer graphics, game development, and visualization",
                icon: "🎮",
                color: "from-green-500 to-teal-500"
              }
            ].map((domain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateX: -30 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <GlowCard className="p-6 h-full" glowColor="blue">
                  <div className="flex items-start mb-4">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="text-3xl mr-4 p-3 rounded-lg bg-slate-800/50 border border-slate-600/50"
                    >
                      {domain.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {domain.title}
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4">
                        {domain.description}
                      </p>
                    </div>
                  </div>
                  
                  
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs font-mono text-green-400">ACTIVE</span>
                    </div>
                   
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        {/* <motion.div
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
              Be part of a community that's{" "}
              <span className="text-blue-400 font-medium">
                shaping the future
              </span>{" "}
              of technology. Whether you're a{" "}
              <span className="text-blue-400 font-medium">beginner</span> or an{" "}
              <span className="text-blue-400 font-medium">expert</span>, there's
              a place for you in CSESA.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/login">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-bold text-lg overflow-hidden"
                >
                  <span className="relative z-10">Initialize Membership</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                </motion.button>
              </Link>

              <Link to="/projects">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-transparent border-2 border-slate-400 text-slate-300 rounded-full font-bold text-lg overflow-hidden"
                >
                  <span className="relative z-10">Explore Projects</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                </motion.button>
              </Link>
            </div>

            <div className="absolute bottom-4 right-4 w-16 h-16 opacity-30">
              <div
                className="w-full h-full border-2 border-dashed border-blue-400/30 rounded-full animate-spin"
                style={{ animationDuration: "20s" }}
              ></div>
            </div>
          </GlowCard>
        </motion.div> */}

        
        {/* Enhanced Timeline */}
        {/* <motion.div
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
              <div className="text-blue-400 text-sm font-mono">
                LOADING HISTORY...
              </div>
              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                  animate={{ x: [-64, 64] as [number, number] }} // Cast to tuple of numbers
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 opacity-60"></div>

            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  x: index % 2 === 0 ? -100 : 100,
                  rotateY: -30,
                }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`flex items-center mb-16 relative ${
                  index % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`w-full md:w-5/12 ${
                    index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"
                  }`}
                >
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
                          <h3 className="text-xl font-bold text-white">
                            {milestone.title}
                          </h3>
                          <span className="text-cyan-400 font-mono text-sm px-2 py-1 bg-cyan-400/10 rounded border border-cyan-400/30">
                            {milestone.year}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-500 mb-3">
                          [{milestone.tech}]
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed font-light alegreya-sans-sc-regular">
                          {milestone.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-mono text-green-400">
                        DEPLOYED
                      </span>
                    </div>
                  </GlowCard>
                </div>
                \{" "}
                <motion.div
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
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div> */}

        {/* Enhanced Call to Action */}
        {/* <motion.div
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
              Be part of a community that's{" "}
              <span className="text-blue-400 font-medium">
                shaping the future
              </span>{" "}
              of technology. Whether you're a{" "}
              <span className="text-blue-400 font-medium">beginner</span> or an{" "}
              <span className="text-blue-400 font-medium">expert</span>, there's
              a place for you in CSESA.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/login">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-bold text-lg overflow-hidden"
                >
                  <span className="relative z-10">Initialize Membership</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-transparent border-2 border-slate-400 text-slate-300 rounded-full font-bold text-lg overflow-hidden"
              >
                <span className="relative z-10">Explore Projects</span>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
              </motion.button>
            </div>

            <div className="absolute bottom-4 right-4 w-16 h-16 opacity-30">
              <div
                className="w-full h-full border-2 border-dashed border-blue-400/30 rounded-full animate-spin"
                style={{ animationDuration: "20s" }}
              ></div>
            </div>
          </GlowCard>
        </motion.div> */}
      </div>
    </div>
  );
};

export default About;

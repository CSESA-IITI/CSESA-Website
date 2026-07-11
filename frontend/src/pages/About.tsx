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
        console.error("Failed to load system stats:", error);
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
      blue: "shadow-blue-500/10 hover:shadow-blue-400/20",
      purple: "shadow-purple-500/10 hover:shadow-purple-400/20",
      green: "shadow-green-500/10 hover:shadow-green-400/20",
      orange: "shadow-orange-500/10 hover:shadow-orange-400/20",
    };

    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/60 hover:border-slate-500/60 shadow-xl ${colors[glowColor]} transition-[border-color,box-shadow] duration-300 ${className}`}
      >
        {children}
      </motion.div>
    );
  };

  const domains = [
    {
      tag: "WD",
      title: "Web Development",
      description:
        "Full-stack development with modern frameworks and production tooling.",
      color: "text-cyan-400 border-cyan-400/30",
    },
    {
      tag: "ML",
      title: "Machine Learning",
      description:
        "Applied AI research, model training, and real-world deployment.",
      color: "text-purple-400 border-purple-400/30",
    },
    {
      tag: "CP",
      title: "Competitive Programming",
      description:
        "Algorithmic problem solving, contest prep, and coding sprints.",
      color: "text-orange-400 border-orange-400/30",
    },
    {
      tag: "SY",
      title: "Systems Programming",
      description:
        "Low-level engineering, performance, and system architecture.",
      color: "text-slate-300 border-slate-400/30",
    },
    {
      tag: "GX",
      title: "Graphics Programming",
      description:
        "Computer graphics, game development, and interactive visualization.",
      color: "text-green-400 border-green-400/30",
    },
  ];

  const stats = [
    { counter: memberCounter, label: "Active Members", color: "text-cyan-400" },
    { counter: eventCounter, label: "Total Events", color: "text-green-400" },
    {
      counter: upcomingEventsCounter,
      label: "Upcoming Events",
      color: "text-orange-400",
    },
    { counter: projectCounter, label: "Total Projects", color: "text-purple-400" },
  ];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black text-white overflow-x-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Intro */}
        <motion.div
          style={{ y: textY }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center py-32"
        >
          <span className="alegreya-sans-sc-regular inline-block px-4 py-2 bg-slate-800/50 rounded-full border border-blue-400/30 text-blue-300 text-sm font-mono mb-6">
            &lt;ABOUT_CSESA/&gt;
          </span>

          <MultiLineReveal
            lines={paragraph}
            className="text-lg text-center"
            lineClassName="text-slate-200"
            stagger={0.1}
          />
        </motion.div>

        {/* About + Mission */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32"
        >
          <GlowCard className="p-10" glowColor="blue">
            <span className="text-xs font-mono tracking-[0.25em] text-blue-300/80 uppercase">
              Who we are
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
              About CSESA
            </h2>
            <p className="text-slate-300 leading-relaxed font-light alegreya-sans-sc-regular">
              Fostering innovation, collaboration, and all-round growth in
              the next generation of computer scientists.
            </p>
          </GlowCard>

          <GlowCard className="p-10" glowColor="blue">
            <span className="text-xs font-mono tracking-[0.25em] text-blue-300/80 uppercase">
              Where we're headed
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
              Mission
            </h2>
            <p className="text-slate-300 leading-relaxed font-light alegreya-sans-sc-regular">
              To nurture an inclusive ecosystem that blends academic
              learning, industry practice, and community engagement for
              holistic student growth.
            </p>
          </GlowCard>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-32"
        >
          <div className="text-center mb-14">
            <span className="alegreya-sans-sc-regular text-xs tracking-[0.3em] text-blue-300/80 uppercase">
              By the numbers
            </span>
            <h2 className="vamos text-3xl md:text-4xl font-black text-white mt-3">
              Community at a glance
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 alegreya-sans-sc-regular">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                ref={stat.counter.ref}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <GlowCard glowColor="blue" className="p-8 text-center h-full">
                  <div
                    className={`text-4xl md:text-5xl font-black font-mono mb-3 ${stat.color}`}
                  >
                    {isLoading ? (
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        --
                      </motion.span>
                    ) : (
                      stat.counter.count
                    )}
                  </div>
                  <div className="text-slate-300 text-sm font-light leading-tight">
                    {stat.label}
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Focus Areas */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-32"
        >
          <div className="text-center mb-14">
            <span className="alegreya-sans-sc-regular text-xs tracking-[0.3em] text-blue-300/80 uppercase">
              What we build
            </span>
            <h2 className="vamos text-3xl md:text-5xl font-black text-white mt-3">
              Focus areas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <GlowCard className="p-6 h-full" glowColor="blue">
                  <div className="flex items-start gap-4">
                    <div
                      className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-lg border font-mono text-xs font-bold ${domain.color}`}
                    >
                      {domain.tag}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1.5">
                        {domain.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {domain.description}
                      </p>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
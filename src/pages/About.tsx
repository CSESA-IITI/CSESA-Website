import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

const About = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Counter animation hook
  const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      if (!hasAnimated && isVisible.stats) {
        setHasAnimated(true);
        let startTime;
        const animate = (currentTime) => {
          if (!startTime) startTime = currentTime;
          const progress = Math.min((currentTime - startTime) / duration, 1);
          setCount(Math.floor(progress * end));
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        requestAnimationFrame(animate);
      }
    }, [end, duration, hasAnimated, isVisible.stats]);

    return count;
  };

  const memberCount = useCounter(500);
  const eventCount = useCounter(150);
  const projectCount = useCounter(25);
  const yearCount = useCounter(8);

  const milestones = [
    {
      year: "2017",
      title: "Foundation",
      description: "CSESA was founded by a group of passionate computer science students with a vision to create a supportive community for tech enthusiasts.",
      icon: "🚀"
    },
    {
      year: "2018",
      title: "First Hackathon",
      description: "Organized our inaugural hackathon 'CodeStorm' with 100+ participants, establishing CSESA as a major tech event organizer.",
      icon: "💻"
    },
    {
      year: "2019",
      title: "Industry Partnerships",
      description: "Formed strategic partnerships with leading tech companies, providing students with internship and job opportunities.",
      icon: "🤝"
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description: "Successfully transitioned to virtual events during the pandemic, reaching students globally and expanding our impact.",
      icon: "🌐"
    },
    {
      year: "2022",
      title: "Innovation Lab",
      description: "Launched our Innovation Lab, providing students with access to cutting-edge technology and mentorship programs.",
      icon: "🔬"
    },
    {
      year: "2024",
      title: "AI Initiative",
      description: "Introduced AI/ML workshops and projects, keeping pace with the latest technological advancements.",
      icon: "🤖"
    },
    {
      year: "2025",
      title: "Global Reach",
      description: "Expanded our community to include international students, fostering global collaboration and knowledge sharing.",
      icon: "🌍"
    }
  ];

  const values = [
    {
      title: "Innovation",
      description: "We foster creativity and encourage students to think outside the box, pushing the boundaries of what's possible in technology.",
      icon: "💡",
      color: "from-yellow-400 to-orange-500"
    },
    {
      title: "Collaboration",
      description: "We believe in the power of teamwork and create opportunities for students to learn from each other and work together.",
      icon: "🤝",
      color: "from-blue-400 to-indigo-500"
    },
    {
      title: "Excellence",
      description: "We strive for the highest standards in everything we do, from our events to our projects and community initiatives.",
      icon: "⭐",
      color: "from-purple-400 to-pink-500"
    },
    {
      title: "Inclusivity",
      description: "We welcome students from all backgrounds and skill levels, creating an environment where everyone can learn and grow.",
      icon: "🌈",
      color: "from-green-400 to-teal-500"
    }
  ];

  const achievements = [
    "Winner of National Student Organization Award 2023",
    "Recognized as Best Tech Community by University",
    "Featured in Tech Education Magazine",
    "Partnership with 25+ Industry Leaders",
    "Graduated 200+ Students into Tech Careers",
    "Organized 150+ Educational Events",
    "Maintained 95% Student Satisfaction Rate",
    "Contributed to 50+ Open Source Projects"
  ];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('[data-observe]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Dynamic Background Effects */}
      <motion.div
        className="absolute top-20 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-10"
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, 360],
          x: [0, 100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-32 left-10 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-15"
        animate={{
          scale: [1.2, 1, 1.2],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-5"
        animate={{
          scale: [1, 1.8, 1],
          rotate: [0, -360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center py-20"
        >
          <h1 className="text-3xl md:text-6xl font-extrabold mb-8 tracking-wider">
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-300 bg-clip-text text-transparent">
              ABOUT CSESA
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-lg md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            Empowering the next generation of computer scientists through innovation, collaboration, and excellence
          </motion.p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          id="mission"
          data-observe
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible.mission ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-md rounded-3xl p-12 border border-blue-500/20">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 text-white">
              Our Mission
            </h2>
            <p className="text-xl text-gray-300 text-center leading-relaxed max-w-4xl mx-auto">
              To create an inclusive community where computer science students can learn, grow, and innovate together. 
              We bridge the gap between academic learning and industry practice, preparing students for successful 
              careers in technology while fostering a culture of collaboration and continuous learning.
            </p>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          id="stats"
          data-observe
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible.stats ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Our Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: memberCount, suffix: "+", label: "Active Members", color: "text-blue-400" },
              { number: eventCount, suffix: "+", label: "Events Hosted", color: "text-purple-400" },
              { number: projectCount, suffix: "+", label: "Projects Built", color: "text-cyan-400" },
              { number: yearCount, suffix: "", label: "Years Strong", color: "text-green-400" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={isVisible.stats ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 text-center hover:border-blue-500/50 transition-all duration-300"
              >
                <div className={`text-5xl md:text-6xl font-bold mb-3 ${stat.color}`}>
                  {stat.number}{stat.suffix}
                </div>
                <div className="text-gray-300 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Values */}
        <motion.div
          id="values"
          data-observe
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible.values ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isVisible.values ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className={`text-4xl mr-4 p-3 rounded-full bg-gradient-to-r ${value.color} bg-opacity-20`}>
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{value.title}</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          id="timeline"
          data-observe
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible.timeline ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Our Journey
          </h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-30"></div>
            
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                animate={isVisible.timeline ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`flex items-center mb-16 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
                    <div className="flex items-center mb-3">
                      <span className="text-3xl mr-3">{milestone.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{milestone.title}</h3>
                        <p className="text-blue-400 font-semibold">{milestone.year}</p>
                      </div>
                    </div>
                    <p className="text-gray-300">{milestone.description}</p>
                  </div>
                </div>
                
                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-gray-900"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          id="achievements"
          data-observe
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible.achievements ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Our Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible.achievements ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center p-4 bg-gray-900/30 backdrop-blur-md rounded-xl border border-gray-700/30 hover:border-green-500/50 transition-all duration-300"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full mr-4 flex-shrink-0"></div>
                <p className="text-gray-300">{achievement}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          id="cta"
          data-observe
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible.cta ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center py-20"
        >
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-md rounded-3xl p-12 border border-blue-500/20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Join Us?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Be part of a community that's shaping the future of technology. Whether you're a beginner or an expert, 
              there's a place for you in CSESA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full font-bold text-lg hover:from-blue-300 hover:to-blue-500 transition-all duration-300"
              >
                Become a Member
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent border-2 border-blue-500 text-blue-400 rounded-full font-bold text-lg hover:bg-blue-500 hover:text-white transition-all duration-300"
              >
                Learn More
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
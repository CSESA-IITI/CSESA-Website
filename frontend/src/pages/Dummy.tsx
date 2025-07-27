import React, {useRef} from 'react';
import { motion } from 'framer-motion';
import { LineReveal, AdvancedLineReveal } from '../components/AdvancedLineReveal';



// Demo Component
const Dummy: React.FC = () => {
  return (
    <div className="min-h-[400vh] bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      <div className="max-w-4xl mx-auto px-8">
        
        {/* Header */}
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-6xl font-black mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
            >
              Line Reveal Effect
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl text-slate-300"
            >
              Each line reveals in place as you scroll
            </motion.p>
          </div>
        </div>

        {/* Example 1: Basic Line Reveal */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-blue-400 text-center mb-12">
              Basic Line Reveal
            </h2>
            <LineReveal 
              className="text-center max-w-3xl"
              lineClassName="text-xl leading-relaxed mb-4"
              offset={['start 0.8', 'start 0.2']}
              stagger={0.12}
            >
              This is a paragraph that will reveal line by line as you scroll down the page. Each line appears in its own position without moving the entire paragraph. The effect creates a smooth reading experience that guides your attention through the content naturally and elegantly.
            </LineReveal>
          </div>
        </section>

        {/* Example 2: Manual Lines */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-purple-400 text-center mb-12">
              Manual Line Control
            </h2>
            <AdvancedLineReveal 
              children=""
              className="text-center max-w-3xl"
              lineClassName="text-2xl font-light leading-relaxed mb-6"
              offset={['start 0.8', 'start 0.2']}
              stagger={0.15}
              splitBy="manual"
              manualLines={[
                "First line appears smoothly",
                "Then the second line follows",
                "Each line has perfect timing",
                "Creating an elegant reveal effect"
              ]}
            >
            </AdvancedLineReveal>
          </div>
        </section>

        {/* Example 3: Sentence Splitting */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-green-400 text-center mb-12">
              Sentence-by-Sentence
            </h2>
            <AdvancedLineReveal 
              className="text-left max-w-3xl"
              lineClassName="text-lg leading-relaxed mb-4 text-slate-300"
              offset={['start 0.8', 'start 0.2']}
              stagger={0.1}
              splitBy="sentence"
              animateFrom="bottom"
              distance={30}
            >
              This approach splits text by sentences rather than visual lines. Each sentence appears as a complete thought. This is perfect for storytelling or explanatory content. The reader can follow along naturally as each idea is revealed progressively.
            </AdvancedLineReveal>
          </div>
        </section>

        {/* Example 4: Different Animation Directions */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl">
            
            <div>
              <h3 className="text-2xl font-bold text-orange-400 text-center mb-8">
                From Top
              </h3>
              <AdvancedLineReveal 
                className="text-center"
                lineClassName="text-lg leading-relaxed mb-3 text-slate-300"
                offset={['start 0.8', 'start 0.3']}
                stagger={0.08}
                splitBy="sentence"
                animateFrom="top"
                distance={25}
              >
                Lines slide down from above. This creates a different visual flow. Perfect for headers and important announcements.
              </AdvancedLineReveal>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-cyan-400 text-center mb-8">
                From Left
              </h3>
              <AdvancedLineReveal 
                className="text-center"
                lineClassName="text-lg leading-relaxed mb-3 text-slate-300"
                offset={['start 0.8', 'start 0.3']}
                stagger={0.08}
                splitBy="sentence"
                animateFrom="left"
                distance={40}
              >
                Lines slide in from the left side. Creates a unique horizontal reveal effect. Great for modern, dynamic layouts.
              </AdvancedLineReveal>
            </div>
          </div>
        </section>

        {/* Example 5: Real-world Use Case */}
        <section className="min-h-screen flex items-center justify-center">
          <div className="max-w-4xl space-y-16">
            <div className="text-center">
              <AdvancedLineReveal 
                children=""
                className="mb-8"
                lineClassName="text-5xl font-black leading-tight mb-2"
                offset={['start 0.9', 'start 0.4']}
                stagger={0.1}
                splitBy="manual"
                manualLines={[
                  "Transform Your",
                  "Digital Experience"
                ]}
                animateFrom="bottom"
                distance={50}
              >
              </AdvancedLineReveal>
            </div>

            <AdvancedLineReveal 
              className="text-center"
              lineClassName="text-xl leading-relaxed mb-4 text-slate-300"
              offset={['start 0.7', 'start 0.3']}
              stagger={0.12}
              splitBy="auto"
            >
              We create stunning web experiences that captivate your audience and drive results. Our team combines cutting-edge technology with beautiful design to bring your vision to life. Every project is crafted with attention to detail and optimized for performance across all devices.
            </AdvancedLineReveal>

            <div className="text-center pt-8">
              <motion.div
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 1 }}
                viewport={{ once: true }}
              >
                <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-bold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300">
                  Get Started Today
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Usage Instructions */}
        <section className="py-20">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
            <h3 className="text-2xl font-bold text-cyan-400 mb-6">Usage Examples</h3>
            
            <div className="space-y-6 text-slate-300">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Basic Usage:</h4>
                <pre className="bg-slate-900 p-4 rounded-lg text-sm text-green-400 overflow-x-auto">
{`<LineReveal 
  className="text-center max-w-3xl"
  lineClassName="text-xl leading-relaxed mb-4"
  stagger={0.12}
>
  Your paragraph text here that will reveal line by line.
</LineReveal>`}
                </pre>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Advanced Usage:</h4>
                <pre className="bg-slate-900 p-4 rounded-lg text-sm text-green-400 overflow-x-auto">
{`<AdvancedLineReveal 
  splitBy="sentence"
  animateFrom="top"
  distance={30}
  stagger={0.15}
  manualLines={["Line 1", "Line 2", "Line 3"]}
>
  Your content here
</AdvancedLineReveal>`}
                </pre>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dummy;


import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, FileText, Zap, MessageSquare, BookOpen, Calculator } from "lucide-react";

const StickyFeaturesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Notes Summarization",
      description: "Transform lengthy documents into concise, actionable summaries with advanced AI processing that understands context and key concepts."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Smart Flashcard Generator",
      description: "Automatically create flashcards from your study materials with spaced repetition algorithms that optimize your learning schedule."
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Quiz Mode & Learning Path",
      description: "Generate personalized quizzes and adaptive learning paths based on your progress, weak points, and learning style."
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "AI Tutor Chat",
      description: "Get instant help from your personal AI tutor available 24/7 for any subject, with explanations tailored to your level."
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: "Math Problem Solver",
      description: "Step-by-step solutions for complex math problems with detailed explanations and alternative solving methods."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Multi-Format Support",
      description: "Upload PDFs, Word docs, images, and audio files for comprehensive study assistance across all your materials."
    }
  ];

  return (
    <section ref={containerRef} className="py-20 bg-gray-900 dark:bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-black"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Sticky heading */}
          <div className="lg:sticky lg:top-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-purple-400">Advanced Features</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Everything You Need to
                <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Excel in Your Studies
                </span>
              </h2>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Powerful AI tools designed to transform how you learn, study, and retain information. 
                From summarization to interactive tutoring.
              </p>
              
              <div className="pt-4">
                <motion.div 
                  className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </motion.div>
          </div>

          {/* Right side - Feature blocks */}
          <div ref={ref} className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  ease: "easeOut"
                }}
                className="group"
              >
                <div className="p-8 bg-gray-800/50 dark:bg-gray-800/30 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm hover:bg-gray-800/70">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-xl group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StickyFeaturesSection;

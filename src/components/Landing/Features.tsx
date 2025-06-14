
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Brain, FileText, Zap, MessageSquare, BookOpen, Calculator } from "lucide-react";

const Features = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Notes Summarization",
      description: "Transform lengthy documents into concise, actionable summaries with advanced AI processing."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Smart Flashcard Generator",
      description: "Automatically create flashcards from your study materials with spaced repetition algorithms."
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Quiz Mode & Learning Path",
      description: "Generate personalized quizzes and adaptive learning paths based on your progress."
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "AI Tutor Chat",
      description: "Get instant help from your personal AI tutor available 24/7 for any subject."
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: "Math Problem Solver",
      description: "Step-by-step solutions for complex math problems with detailed explanations."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Multi-Format Support",
      description: "Upload PDFs, Word docs, images, and audio files for comprehensive study assistance."
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Features</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Everything You Need to
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Excel in Your Studies
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            Powerful AI tools designed to transform how you learn, study, and retain information.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
            >
              <div className="mb-4 p-3 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

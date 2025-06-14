
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Brain, Zap, BookOpen, MessageSquare, Calculator, FileText, Sparkles, Target, Clock, Users } from "lucide-react";

const StickyFeaturesSection = () => {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Summarization",
      description: "Transform lengthy documents into concise, actionable summaries with advanced AI processing that understands context and key concepts.",
      gradient: "from-purple-500 to-blue-500"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Smart Flashcard Generation",
      description: "Automatically create flashcards from your study materials with spaced repetition algorithms for optimal learning retention.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Adaptive Learning Paths",
      description: "Generate personalized quizzes and learning paths that adapt to your progress and identify areas for improvement.",
      gradient: "from-cyan-500 to-green-500"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "24/7 AI Tutor Chat",
      description: "Get instant help from your personal AI tutor, available around the clock for any subject or academic challenge.",
      gradient: "from-green-500 to-yellow-500"
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: "Step-by-Step Math Solver",
      description: "Solve complex mathematical problems with detailed step-by-step explanations and visual representations.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Multi-Format Support",
      description: "Upload and process PDFs, Word docs, images, audio files, and more with our comprehensive content extraction.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and insights to optimize your study strategies.",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Study Time Optimization",
      description: "Smart scheduling and time management tools that help you maximize productivity and learning efficiency.",
      gradient: "from-pink-500 to-purple-500"
    }
  ];

  return (
    <section className="py-24 bg-gray-900 dark:bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-black" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Sticky heading */}
          <div className="lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Complete Platform</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Everything You Need to
                <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Excel in Your Studies
                </span>
              </h2>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-md">
                A comprehensive suite of AI-powered tools designed to transform your learning experience and accelerate academic success.
              </p>
              
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 border-2 border-gray-900" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 border-2 border-gray-900" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 border-2 border-gray-900" />
                </div>
                <span className="text-sm text-gray-400">Trusted by 10,000+ students</span>
              </div>
            </motion.div>
          </div>

          {/* Right side - Feature blocks */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <FeatureBlock key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureBlock = ({ feature, index }: { feature: any; index: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
    rootMargin: "-100px 0px"
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="group"
    >
      <div className="p-8 bg-gray-800/50 dark:bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-500">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} group-hover:scale-110 transition-transform duration-300`}>
            <div className="text-white">
              {feature.icon}
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
            <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
              {feature.title}
            </h3>
            <p className="text-gray-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StickyFeaturesSection;

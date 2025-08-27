import React from 'react';
import { motion } from 'framer-motion';
import { 
    MessageSquare, 
    FileText, 
    Headphones, 
    BookOpen, 
    HelpCircle, 
    Calculator, 
    Zap, 
    BrainCircuit, 
    Wand2, // New icon for Humanizer
    ArrowRight 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar"; // Corrected import name
import { Footer } from "@/components/layout/Footer"; // Corrected import name

// --- Main Component ---
export default function AllFeaturesPage() {
    
  // Updated array of all features, with "AI Humanizer" replacing the old feature
  const allFeatures = [
    {
      icon: Calculator,
      title: "Math Solver",
      desc: "Solve complex math problems with step-by-step AI explanations and visual solutions.",
      href: "/features/math-chat",
      color: "hsl(280, 80%, 60%)", // Fuchsia
      glowColor: "hsl(280, 80%, 70%)",
    },
    {
      icon: FileText,
      title: "AI Notes Generator",
      desc: "Generate smart, structured notes from any document, lecture, or study material instantly.",
      href: "/features/ai-notes",
      color: "hsl(200, 90%, 60%)", // Sky
      glowColor: "hsl(200, 90%, 70%)",
    },
    {
      icon: Headphones,
      title: "Audio Recap",
      desc: "Convert audio recordings and lectures into organized notes and summaries.",
      href: "/features/audio-recap",
      color: "hsl(150, 70%, 50%)", // Emerald
      glowColor: "hsl(150, 70%, 60%)",
    },
    {
      icon: BookOpen,
      title: "AI Summarizer",
      desc: "Quickly summarize any text, article, or document into key points and insights.",
      href: "/features/summaries",
      color: "hsl(45, 100%, 55%)", // Amber
      glowColor: "hsl(45, 100%, 65%)",
    },
    {
      icon: Zap,
      title: "Flashcards Generator",
      desc: "Create and review adaptive flashcards that evolve based on your learning progress.",
      href: "/features/flashcard",
      color: "hsl(25, 95%, 60%)", // Orange
      glowColor: "hsl(25, 95%, 70%)",
    },
    {
      icon: HelpCircle,
      title: "Tests & Quizzes",
      desc: "Test your knowledge with AI-generated quizzes based on your study materials.",
      href: "/features/tests-quiz",
      color: "hsl(345, 85%, 65%)", // Rose
      glowColor: "hsl(345, 85%, 75%)",
    },
    {
      icon: MessageSquare,
      title: "Doubt Chain Solver",
      desc: "Break down complex concepts into simple, connected steps for better understanding.",
      href: "/features/doubt-chain",
      color: "hsl(250, 80%, 65%)", // Indigo
      glowColor: "hsl(250, 80%, 75%)",
    },
    {
      icon: BrainCircuit,
      title: "Study Techniques",
      desc: "Discover and apply proven learning methods like Feynman & Pomodoro tailored to your content.",
      href: "/features/study-techniques",
      color: "hsl(170, 70%, 50%)", // Teal
      glowColor: "hsl(170, 70%, 60%)",
    },
    {
      icon: Wand2, // Replaced icon
      title: "AI Humanizer", // Replaced title
      desc: "Refine AI-generated text to have a more natural, human-like tone and style.",
      href: "/features/humanizer", // Replaced href
      color: "hsl(100, 80%, 60%)", // Lime
      glowColor: "hsl(100, 80%, 70%)",
    },
  ];

  // --- Framer Motion Animation Variants ---

  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const heroItemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1], // a nice ease-out cubic bezier
      },
    },
  };


  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-cyan-400 selection:text-black">
      <Navbar />
      
      {/* --- Hero Section --- */}
      <section className="relative text-white border-b-2 border-gray-800 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0],
              x: ['-10%', '10%', '-10%'],
            }}
            transition={{
              duration: 20,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror"
            }}
            className="absolute top-1/2 left-1/2 w-[60rem] h-[60rem] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-cyan-500/30 via-violet-500/30 to-rose-500/30 rounded-full blur-3xl opacity-40" 
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center py-24 md:py-32 relative z-10">
          <motion.div
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={heroItemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                All Powerful Features
            </motion.h1>
            <motion.p variants={heroItemVariants} className="text-xl md:text-2xl font-medium text-gray-300 max-w-3xl mx-auto mt-6">
              Discover a complete suite of AI tools engineered to elevate your learning, writing, and problem-solving abilities.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* --- Core Features Grid --- */}
      <section className="bg-gray-950 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Your AI-Powered Toolkit</h2>
            </div>
          
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={gridContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {allFeatures.map((feature) => (
                    <motion.a
                        key={feature.title}
                        href={feature.href}
                        variants={cardVariants}
                        whileHover={{ scale: 1.03, y: -8 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="group block rounded-xl border-2 border-gray-800 bg-gray-900/50 p-8 h-full flex flex-col transition-all duration-300"
                        style={{'--glow-color': feature.glowColor} as React.CSSProperties}
                    >
                        {/* The Glow Effect on Hover */}
                        <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_50%,var(--glow-color),transparent)] opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"/>

                        <div className="mb-6 w-16 h-16 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700"
                             style={{ color: feature.color }}>
                            <feature.icon className="w-8 h-8" strokeWidth={2.5} />
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                        <p className="text-gray-400 leading-relaxed mb-6 flex-grow">{feature.desc}</p>
                        
                        <div className="mt-auto flex items-center justify-end text-gray-500 group-hover:text-white transition-colors duration-300">
                            <span className="text-sm font-bold uppercase tracking-wider">Explore</span>
                            <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                    </motion.a>
                ))}
            </motion.div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="bg-gray-900 py-20 border-y-2 border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">Ready to Supercharge Your Studies?</h2>
            <p className="text-xl text-gray-400 mb-10">
              Get started with our free plan or unlock unlimited potential by upgrading today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a 
                    href="/signup" 
                    whileHover={{ scale: 1.05, y: -4, boxShadow: "0 10px 20px rgba(0, 255, 255, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    className="block bg-cyan-500 text-black font-bold text-lg px-8 py-4 rounded-lg"
                >
                    Start For Free
                </motion.a>
                <motion.a 
                    href="/pricing"
                    whileHover={{ scale: 1.05, y: -4, boxShadow: "0 10px 20px rgba(255, 255, 255, 0.05)" }}
                    whileTap={{ scale: 0.95 }}
                    className="block bg-gray-800 text-white font-bold text-lg px-8 py-4 rounded-lg"
                >
                    View Pricing
                </motion.a>
            </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}


import { motion } from "framer-motion";
import { Brain, Users, Target, Zap, Globe, Shield } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-black">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-black dark:via-purple-950 dark:to-black">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                About Tutorly
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Empowering students worldwide with AI-powered learning tools to study smarter, not harder.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Mission
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  We believe every student deserves access to personalized, intelligent learning tools. 
                  Tutorly transforms traditional study methods with cutting-edge AI technology, making 
                  learning more efficient, engaging, and accessible to students worldwide.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Brain className="h-12 w-12 text-purple-500" />,
                    title: "AI-Powered Learning",
                    description: "Advanced artificial intelligence that adapts to each student's learning style and pace."
                  },
                  {
                    icon: <Users className="h-12 w-12 text-blue-500" />,
                    title: "Global Community",
                    description: "Connecting students from 200+ institutions across 128 countries worldwide."
                  },
                  {
                    icon: <Target className="h-12 w-12 text-green-500" />,
                    title: "Focused Results",
                    description: "Proven methods that help students achieve their academic goals faster and more effectively."
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.2 }}
                    className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="mb-4 flex justify-center">{item.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-gray-50 dark:bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                  Our Story
                </h2>
                <div className="text-lg text-gray-700 dark:text-gray-300 space-y-6 text-left">
                  <p>
                    Tutorly was born from a simple observation: students spend countless hours creating 
                    study materials, when they could be spending that time actually learning. Our founders, 
                    former students themselves, experienced the frustration of manual note-taking, flashcard 
                    creation, and quiz preparation.
                  </p>
                  <p>
                    In 2024, we set out to revolutionize the learning experience by harnessing the power of 
                    artificial intelligence. What started as a simple note summarization tool has evolved 
                    into a comprehensive AI learning platform that helps students master any subject faster.
                  </p>
                  <p>
                    Today, Tutorly serves over 500,000 students worldwide, from high school to graduate 
                    level, across every subject imaginable. Our AI has processed millions of documents, 
                    created millions of flashcards, and helped students achieve their academic goals.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Values
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  The principles that guide everything we do
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Zap className="h-8 w-8 text-yellow-500" />,
                    title: "Innovation",
                    description: "Constantly pushing the boundaries of what's possible in AI-powered education."
                  },
                  {
                    icon: <Users className="h-8 w-8 text-blue-500" />,
                    title: "Accessibility",
                    description: "Making high-quality learning tools available to students everywhere, regardless of background."
                  },
                  {
                    icon: <Target className="h-8 w-8 text-green-500" />,
                    title: "Excellence",
                    description: "Delivering the highest quality AI tools that genuinely improve learning outcomes."
                  },
                  {
                    icon: <Globe className="h-8 w-8 text-purple-500" />,
                    title: "Global Impact",
                    description: "Building a worldwide community of learners who support and inspire each other."
                  },
                  {
                    icon: <Shield className="h-8 w-8 text-red-500" />,
                    title: "Privacy",
                    description: "Protecting student data with the highest security standards and complete transparency."
                  },
                  {
                    icon: <Brain className="h-8 w-8 text-indigo-500" />,
                    title: "Empowerment",
                    description: "Giving students the tools and confidence to achieve their academic and career goals."
                  }
                ].map((value, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="mb-4">{value.icon}</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-black dark:via-purple-950 dark:to-black">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Join the Future of Learning
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Become part of our global community and transform your study experience with AI
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xl px-12 py-4 rounded-xl font-semibold shadow-xl transition-all duration-300"
                onClick={() => window.location.href = "/dashboard"}
              >
                Start Learning Today
              </motion.button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

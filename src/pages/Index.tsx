import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Sparkles, ArrowRight, MessageSquare, BookOpenCheck, Lightbulb, ShieldCheck, Rocket, Users, Code, CheckCircle, Star, Send } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [showMoreTestimonials, setShowMoreTestimonials] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const features = [
    {
      title: "AI-Powered Summaries",
      description: "Instantly condense lengthy articles and documents into key insights.",
      icon: BookOpenCheck,
    },
    {
      title: "Smart Flashcards",
      description: "Create, review, and master information with AI-generated flashcards.",
      icon: Lightbulb,
    },
    {
      title: "Doubt Chain",
      description: "Get your doubts cleared instantly with our AI doubt solving platform.",
      icon: MessageSquare,
    },
    {
      title: "Privacy First",
      description: "Your data is encrypted and never shared with third parties.",
      icon: ShieldCheck,
    },
    {
      title: "Personalized Learning",
      description: "Adaptive learning paths tailored to your unique needs.",
      icon: Rocket,
    },
    {
      title: "Collaborative Study",
      description: "Connect with peers and study together in real-time.",
      icon: Users,
    },
  ];

  const testimonials = [
    {
      name: "Alice Johnson",
      title: "Student at Harvard",
      quote: "Tutorly has revolutionized my study habits. The AI-powered summaries save me hours, and the flashcards help me retain information like never before.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b2933e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Bob Williams",
      title: "Professor at MIT",
      quote: "As an educator, I'm impressed by Tutorly's ability to personalize learning. It's a game-changer for students who want to master complex subjects efficiently.",
      image: "https://images.unsplash.com/photo-1570295999919-56ceb7e86ef4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Charlie Brown",
      title: "Software Engineer at Google",
      quote: "I use Tutorly to stay up-to-date with the latest tech. The AI assistant is incredibly helpful for understanding new concepts quickly.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd8a72fbc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Diana Prince",
      title: "Medical Student at Johns Hopkins",
      quote: "Tutorly has been a lifesaver during my medical studies. The interactive quizzes and study plans keep me on track, even with a demanding schedule.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d674x?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Ethan Hunt",
      title: "Law Student at Yale",
      quote: "I can't imagine studying law without Tutorly. The AI notes generator helps me digest complex legal documents, and the progress tracker keeps me motivated.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Fiona Gallagher",
      title: "High School Student",
      quote: "I was struggling with math until I found Tutorly. The math chat feature is like having a personal tutor, and my grades have improved significantly.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ];

  const visibleTestimonials = showMoreTestimonials ? testimonials : testimonials.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="lg:flex items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Unlock Your Learning Potential with AI
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-gray-600 dark:text-gray-400 mb-8"
              >
                Tutorly is your AI-powered learning companion, designed to help you master any subject faster and more efficiently.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center lg:justify-start gap-4"
              >
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Get Started <ArrowRight className="ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  Learn More
                </Button>
              </motion.div>
            </div>
            <div className="lg:w-1/2">
              <motion.img
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                src="/hero-image.svg"
                alt="AI Learning Companion"
                className="mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Explore the powerful features that make Tutorly the ultimate learning tool.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-700 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Read inspiring stories from students and educators who have transformed their learning with Tutorly.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-700 rounded-2xl shadow-md p-6"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{testimonial.quote}"
                </p>
              </motion.div>
            ))}
          </div>
          {testimonials.length > 3 && (
            <div className="text-center mt-4">
              <Button variant="outline" onClick={() => setShowMoreTestimonials(!showMoreTestimonials)}>
                {showMoreTestimonials ? "Show Less" : "Show More"}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-purple-50 dark:bg-purple-950">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-50 mb-4">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-lg text-purple-700 dark:text-purple-300">
              Join Tutorly today and unlock your full learning potential.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
              Get Started Now <Sparkles className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
      
      {/* Floating Action Button */}
      {isMobile && (
        <motion.a
          href="/ai-assistant"
          className="fixed bottom-8 right-8 bg-purple-600 text-white rounded-full shadow-lg p-3 flex items-center justify-center hover:bg-purple-700 transition-colors duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Send className="h-6 w-6" />
        </motion.a>
      )}
    </div>
  );
};

export default Index;

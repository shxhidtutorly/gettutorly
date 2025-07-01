import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Brain,
  Zap,
  Users,
  Award,
  Clock,
  Star,
  ChevronRight,
  Play,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Trophy,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  Headphones,
  Calculator,
  Quote,
} from "lucide-react";

// Add missing testimonial components
const TestimonialCard = ({ testimonial }: { testimonial: any }) => (
  <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        <Quote className="w-8 h-8 text-purple-400 flex-shrink-0" />
        <div>
          <p className="text-lg mb-4">{testimonial.content}</p>
          <TestimonialAuthor author={testimonial.author} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const TestimonialAuthor = ({ author }: { author: any }) => (
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
      <span className="text-white font-semibold">{author.name.charAt(0)}</span>
    </div>
    <div>
      <p className="font-semibold">{author.name}</p>
      <p className="text-sm text-gray-400">{author.role}</p>
    </div>
  </div>
);

const Index = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const testimonials = [
    {
      content: "Tutorly transformed my study habits. The AI-powered features helped me understand complex topics faster than ever before.",
      author: { name: "Sarah Chen", role: "Computer Science Student" }
    },
    {
      content: "The personalized study plans and progress tracking kept me motivated throughout my exam preparation.",
      author: { name: "Marcus Johnson", role: "Medical Student" }
    },
    {
      content: "Audio notes feature is a game-changer. I can study while commuting and never miss important lectures.",
      author: { name: "Emily Rodriguez", role: "Business Student" }
    }
  ];

  const features = [
    {
      title: "AI Tutor",
      description: "Get personalized explanations and instant help on any topic",
      icon: Brain,
    },
    {
      title: "Smart Notes",
      description: "Automatically generate notes and summaries from any source",
      icon: FileText,
    },
    {
      title: "Adaptive Quizzes",
      description: "Test your knowledge with quizzes that adapt to your learning level",
      icon: Target,
    },
    {
      title: "Audio Notes",
      description: "Record and transcribe audio notes for on-the-go learning",
      icon: Headphones,
    },
    {
      title: "Math Solver",
      description: "Solve complex math problems with step-by-step explanations",
      icon: Calculator,
    },
    {
      title: "Study Plans",
      description: "Create personalized study plans to stay organized and on track",
      icon: Calendar,
    },
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [testimonials.length]);

  const handleStartLearning = () => {
    toast({
      title: "Let's get started!",
      description: "Redirecting to the dashboard...",
    });
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring" as const,
              mass: 0.8,
              damping: 10,
              stiffness: 100,
              restDelta: 0.001,
              restSpeed: 0.001,
            }}
          >
            <Badge className="mb-6 bg-purple-600/20 text-purple-300 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Learning Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Master Any Subject with AI
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Transform your learning experience with personalized AI tutoring, 
              smart note-taking, and adaptive study plans.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate('/signup')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform transition-transform hover:scale-105"
              >
                Start Learning Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                onClick={() => navigate('/signin')}
                variant="outline"
                size="lg"
                className="border-2 border-purple-400 text-purple-300 hover:bg-purple-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive learning tools powered by cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                <CardHeader>
                  <Brain className="w-12 h-12 text-purple-400 mb-4" />
                  <CardTitle className="text-white">AI Tutor</CardTitle>
                  <CardDescription className="text-gray-300">
                    Get personalized explanations and instant help on any topic
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                <CardHeader>
                  <FileText className="w-12 h-12 text-blue-400 mb-4" />
                  <CardTitle className="text-white">Smart Notes</CardTitle>
                  <CardDescription className="text-gray-300">
                    Automatically generate notes and summaries from any source
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                <CardHeader>
                  <Target className="w-12 h-12 text-green-400 mb-4" />
                  <CardTitle className="text-white">Adaptive Quizzes</CardTitle>
                  <CardDescription className="text-gray-300">
                    Test your knowledge with quizzes that adapt to your learning level
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                <CardHeader>
                  <Headphones className="w-12 h-12 text-pink-400 mb-4" />
                  <CardTitle className="text-white">Audio Notes</CardTitle>
                  <CardDescription className="text-gray-300">
                    Record and transcribe audio notes for on-the-go learning
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                <CardHeader>
                  <Calculator className="w-12 h-12 text-yellow-400 mb-4" />
                  <CardTitle className="text-white">Math Solver</CardTitle>
                  <CardDescription className="text-gray-300">
                    Solve complex math problems with step-by-step explanations
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                <CardHeader>
                  <Calendar className="w-12 h-12 text-red-400 mb-4" />
                  <CardTitle className="text-white">Study Plans</CardTitle>
                  <CardDescription className="text-gray-300">
                    Create personalized study plans to stay organized and on track
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by Students Worldwide
            </h2>
          </motion.div>

          <div className="grid gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <TestimonialCard testimonial={testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of students who are already achieving their academic goals
            </p>
            <Button
              onClick={() => navigate('/signup')}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform transition-transform hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;

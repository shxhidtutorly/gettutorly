import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  BookOpen, 
  Brain, 
  Zap, 
  Users, 
  Star, 
  Check,
  Play,
  Award,
  Target,
  Lightbulb,
  FileText,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Globe,
  Clock,
  Shield,
  Heart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useUser } from "@/hooks/useUser";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <Card className="bg-white/5 backdrop-blur-lg border-white/10 h-full">
    <CardContent className="p-6">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
            }`}
          />
        ))}
      </div>
      <p className="text-white/90 mb-4 italic">"{testimonial.content}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{testimonial.name}</p>
          <p className="text-white/60 text-xs">{testimonial.role}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TestimonialAuthor = ({ name, role }: { name: string; role: string }) => (
  <div className="flex items-center gap-3 mt-4">
    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
      <span className="text-white font-semibold text-sm">{name.charAt(0)}</span>
    </div>
    <div>
      <p className="text-white font-semibold text-sm">{name}</p>
      <p className="text-white/60 text-xs">{role}</p>
    </div>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Chen",
      role: "Pre-Med Student",
      content: "Tutorly transformed my study routine. The AI summaries save me hours, and the quiz generation helps me test my knowledge effectively.",
      rating: 5,
      avatar: "/avatars/sarah.jpg"
    },
    {
      name: "Marcus Johnson",
      role: "Law Student",
      content: "The document analysis feature is incredible. I can upload dense legal texts and get clear, concise explanations instantly.",
      rating: 5,
      avatar: "/avatars/marcus.jpg"
    },
    {
      name: "Emma Rodriguez",
      role: "Engineering Student",
      content: "Perfect for technical subjects. The AI breaks down complex concepts into digestible pieces that actually make sense.",
      rating: 5,
      avatar: "/avatars/emma.jpg"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Summaries",
      description: "Transform any document into clear, concise summaries",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Smart Note Generation",
      description: "Create structured notes from lectures and readings",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Interactive Q&A",
      description: "Ask questions about your materials and get instant answers",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Custom Quizzes",
      description: "Generate practice questions tailored to your content",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Concept Clarification",
      description: "Break down complex topics into understandable explanations",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Progress Tracking",
      description: "Monitor your learning journey and achievements",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const stats = [
    { number: "50K+", label: "Students Helped", icon: <Users className="h-6 w-6" /> },
    { number: "1M+", label: "Notes Generated", icon: <FileText className="h-6 w-6" /> },
    { number: "500K+", label: "Quizzes Created", icon: <Brain className="h-6 w-6" /> },
    { number: "99%", label: "Satisfaction Rate", icon: <Heart className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Learning Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Transform Your 
              <span className="block">Study Experience</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload any document, generate smart summaries, create custom quizzes, and get instant answers. 
              Your AI study companion is here to accelerate your learning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-full"
              >
                {user ? 'Go to Dashboard' : 'Start Learning Free'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/demo')}
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-full"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/5 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring" as const,
                  mass: 0.8,
                  damping: 15,
                  stiffness: 120,
                  restDelta: 0.01,
                  restSpeed: 0.01
                }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring" as const,
              mass: 0.8,
              damping: 15,
              stiffness: 120,
              restDelta: 0.01,
              restSpeed: 0.01
            }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Comprehensive AI-powered tools designed to make studying more efficient and effective
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all h-full">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/5 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Loved by Students Worldwide
            </h2>
            <p className="text-xl text-white/70">
              Join thousands of students who've transformed their learning experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TestimonialCard testimonial={testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Ready to Study Smarter?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already using AI to accelerate their learning journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-full"
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/pricing')}
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-full"
              >
                View Pricing
              </Button>
            </div>
            
            <p className="text-white/60 text-sm mt-6">
              No credit card required • Free forever plan available
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

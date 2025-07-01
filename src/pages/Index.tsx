
import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Zap, Users, Star, ChevronDown, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useUser } from "@/hooks/useUser";

// Testimonial components
const TestimonialCard = ({ testimonial }: { testimonial: any }) => (
  <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
    <CardContent className="pt-0">
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={testimonial.avatar} />
          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-white font-medium">{testimonial.name}</p>
          <p className="text-gray-400 text-sm">{testimonial.role}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TestimonialAuthor = ({ name, role, avatar }: { name: string; role: string; avatar: string }) => (
  <div className="flex items-center">
    <Avatar className="h-10 w-10 mr-3">
      <AvatarImage src={avatar} />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
    <div>
      <p className="text-white font-medium">{name}</p>
      <p className="text-gray-400 text-sm">{role}</p>
    </div>
  </div>
);

const Index = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);
  
  const heroInView = useInView(heroRef);
  const featuresInView = useInView(featuresRef);
  const testimonialsInView = useInView(testimonialsRef);
  const ctaInView = useInView(ctaRef);

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Summaries",
      description: "Transform lengthy documents into concise, actionable summaries in seconds",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Smart Flashcards",
      description: "Automatically generate flashcards from your study materials for efficient review",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Interactive Quizzes",
      description: "Test your knowledge with AI-generated quizzes tailored to your content",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Collaborative Learning",
      description: "Share and collaborate on study materials with classmates and study groups",
      color: "from-green-500 to-teal-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Medical Student",
      avatar: "/avatars/sarah.jpg",
      content: "Tutorly has revolutionized my study routine. The AI summaries save me hours every week!"
    },
    {
      name: "Mike Chen",
      role: "Engineering Student",
      avatar: "/avatars/mike.jpg",
      content: "The flashcard generation is incredible. I can create comprehensive review materials in minutes."
    },
    {
      name: "Emily Rodriguez",
      role: "Law Student",
      avatar: "/avatars/emily.jpg",
      content: "Perfect for dense legal texts. The summaries help me grasp complex concepts quickly."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Students" },
    { number: "2M+", label: "Documents Processed" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "4.9/5", label: "App Store Rating" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              🚀 AI-Powered Learning Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Study Smarter with
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}AI Magic
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your study materials into interactive summaries, flashcards, and quizzes. 
              Boost your learning efficiency with cutting-edge AI technology.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold"
              >
                {user ? 'Go to Dashboard' : 'Start Learning Free'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            <motion.div 
              className="cursor-pointer"
              onClick={scrollToFeatures}
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChevronDown className="h-8 w-8 text-gray-400 mx-auto" />
            </motion.div>
          </motion.div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-2 border-purple-500 rounded-full"
          />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-2 border-pink-500 rounded-full"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-black/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features for Modern Learning
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform provides everything you need to excel in your studies
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group h-full">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by Students Worldwide
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of students who have transformed their learning experience
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <TestimonialCard testimonial={testimonials[currentTestimonial]} />
            </motion.div>

            <div className="flex justify-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ 
              type: "spring", 
              mass: 0.4, 
              damping: 10, 
              stiffness: 100, 
              restDelta: 0.001, 
              restSpeed: 0.001 
            }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already studying smarter with Tutorly. 
              Start your free trial today!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold"
              >
                {user ? 'Go to Dashboard' : 'Start Free Trial'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Link to="/pricing">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
                Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

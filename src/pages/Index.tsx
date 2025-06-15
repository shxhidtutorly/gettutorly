
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Brain, 
  Zap, 
  Target, 
  Users, 
  Trophy,
  Star,
  Check,
  ArrowRight,
  Sparkles,
  GraduationCap,
  MessageSquare,
  BarChart3
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import Footer from "@/components/layout/Footer";

// Declare Paddle types
declare global {
  interface Window {
    Paddle?: {
      Environment: {
        set: (env: string) => void;
      };
      Setup: (config: { token: string }) => void;
      Checkout: {
        open: (config: {
          items: { priceId: string; quantity: number }[];
          customer?: { email?: string };
          customData?: Record<string, any>;
          successUrl?: string;
          settings?: {
            allowLogout?: boolean;
            displayMode?: string;
            theme?: string;
            locale?: string;
          };
        }) => void;
      };
    };
  }
}

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Paddle script
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Environment.set('production');
        window.Paddle.Setup({
          token: 'live_70323ea9dfbc69d45414c712687'
        });
        setPaddleLoaded(true);
        console.log('Paddle loaded successfully on landing page');
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load Paddle script:', error);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleSubscribe = async () => {
    if (loading) {
      toast.info("Please wait while we check your authentication status...");
      return;
    }

    if (!user) {
      toast.info("Please sign in to continue with your subscription");
      navigate("/signin");
      return;
    }

    if (!paddleLoaded || !window.Paddle) {
      toast.error("Payment system is loading, please try again in a moment");
      return;
    }

    setIsProcessing(true);
    toast.success("Redirecting to checkout...");

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId: 'pri_01jxq0pfrjcd0gkj08cmqv6rb1', quantity: 1 }],
        customer: { email: user.email || '' },
        customData: {
          user_id: user.id,
          planName: 'Basic Plan'
        },
        successUrl: 'https://gettutorly.com/pricing?sub=success',
        settings: {
          allowLogout: false,
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en'
        }
      });
      console.log('Paddle checkout opened for Basic Plan');
    } catch (error) {
      console.error('Failed to open Paddle checkout:', error);
      toast.error("Failed to open checkout, please try again");
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Summaries",
      description: "Transform lengthy documents into concise, actionable summaries with advanced AI technology."
    },
    {
      icon: Zap,
      title: "Interactive Flashcards",
      description: "Create dynamic flashcards that adapt to your learning pace and help retain information."
    },
    {
      icon: Target,
      title: "Smart Quizzes",
      description: "Generate personalized quizzes based on your study materials to test comprehension."
    },
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      description: "Get instant answers and explanations from our intelligent study companion."
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and performance insights."
    },
    {
      icon: GraduationCap,
      title: "Study Plans",
      description: "Receive personalized study schedules tailored to your goals and timeline."
    }
  ];

  const stats = [
    { number: "50K+", label: "Students" },
    { number: "95%", label: "Success Rate" },
    { number: "1M+", label: "Study Sessions" },
    { number: "24/7", label: "AI Support" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Medical Student",
      content: "Tutorly transformed my study routine. The AI summaries helped me tackle complex medical texts in half the time.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Engineering Student",
      content: "The personalized quizzes and flashcards made studying for my finals so much more efficient and engaging.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Law Student",
      content: "I wish I had discovered Tutorly earlier. It's like having a personal tutor available 24/7.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Tutorly</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signin">
                    <Button variant="ghost" className="text-gray-700 dark:text-gray-300">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Learning Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Learning</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Harness the power of AI to create summaries, flashcards, and personalized study plans. 
              Join thousands of students achieving better results with smarter study methods.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    Start Learning Today <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              
              <Link to="/pricing">
                <Button variant="outline" className="px-8 py-4 text-lg rounded-xl border-2">
                  View Pricing
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.number}</div>
                  <div>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive suite of AI-powered tools adapts to your learning style and helps you achieve your academic goals faster.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-0 shadow-md">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by Students Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See how Tutorly is transforming study experiences across universities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="border-t pt-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Revolutionize Your Studies?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Join thousands of students who are already achieving better results with AI-powered learning.
            </p>
            <Button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

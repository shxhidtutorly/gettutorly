import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import CountUp from "react-countup";
import AOS from "aos";
import "aos/dist/aos.css";

import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoginButton from "@/components/auth/LoginButton";
import UserProfileButton from "@/components/auth/UserProfileButton";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/SupabaseAuthContext";

import {
  Brain,
  BookOpenText,
  Sparkles,
  BookOpen,
  BarChart3,
  Zap,
  MessageSquare,
  FileText,
  CheckCircle,
  Star,
  Users,
  Globe,
  Shield,
  Play,
  Check,
  X,
  Calculator,
  Languages,
  PenTool,
} from "lucide-react";

import BostonLogo from "@/components/ui/Boston-University-Logo.png";
import ChicagoLogo from "@/components/ui/Chicago-University-Logo.png";
import GeorgetownLogo from "@/components/ui/Georgetown-University-Logo.png";
import HarvardLogo from "@/components/ui/Harvard-University-Logo.png";
import HowardLogo from "@/components/ui/Howard-University-Logo.png";
import OhioStateLogo from "@/components/ui/Ohio-State-University-Logo.png";
import OtagoLogo from "@/components/ui/Otago-University-Logo.png";
import PittsburghLogo from "@/components/ui/Pittsburgh-University-Logo.png";
import StanfordLogo from "@/components/ui/Stanford-University-Logo.png";

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
          cancelUrl?: string;
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
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showAIDemo, setShowAIDemo] = useState(false);
  const [aiDemoText, setAiDemoText] = useState("");
  const [aiDemoResult, setAiDemoResult] = useState("");
  const [pricingToggle, setPricingToggle] = useState("monthly");

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
    });

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    // Load Paddle.js script
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
        console.log('Paddle loaded successfully');
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load Paddle script:', error);
    };
    document.head.appendChild(script);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleGetStarted = () => {
    if (loading) {
      toast({
        title: "Please wait",
        description: "Checking authentication status..."
      });
      return;
    }

    if (!user) {
      navigate("/signin", { state: { returnTo: "/pricing", autoCheckout: true } });
      return;
    }

    if (!paddleLoaded || !window.Paddle) {
      toast({
        title: "Loading payment system",
        description: "Please wait a moment..."
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: "Redirecting to checkout",
      description: "Opening payment window..."
    });

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId: 'pri_01jxq0pfrjcd0gkj08cmqv6rb1', quantity: 1 }],
        customer: { email: user.email || '' },
        customData: {
          user_id: user.id,
          planName: 'Basic Plan'
        },
        successUrl: 'https://gettutorly.com/pricing?sub=success',
        cancelUrl: 'https://gettutorly.com/pricing?sub=cancel',
        settings: {
          allowLogout: false,
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en'
        }
      });
    } catch (error) {
      console.error('Failed to open Paddle checkout:', error);
      toast({
        title: "Payment Error",
        description: "Failed to open checkout, please try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAISummary = async () => {
    if (!aiDemoText.trim()) {
      toast({
        title: "Please enter some text",
        description: "Add some content to summarize"
      });
      return;
    }
    
    setAiDemoResult("Generating summary...");
    
    // Simulate AI response
    setTimeout(() => {
      setAiDemoResult(`📝 **AI Summary**: This text discusses ${aiDemoText.split(' ').slice(0, 3).join(' ')}... Key points include the main concepts and important details that enhance understanding and retention.`);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-black">
      {/* Enhanced Navbar with scroll effect and no theme toggle */}
      <motion.header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrollY > 50 
            ? 'bg-background/95 dark:bg-black/95 backdrop-blur-lg border-b border-border/50' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Brain className="h-8 w-8 text-purple-500" />
            <span className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
              Tutorly
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            {user ? (
              <UserProfileButton />
            ) : (
              <div className="flex gap-2">
                <Link to="/signin">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <main className="flex-1 pt-16">
        {/* Hero Section with Animated Gradient */}
        <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-black dark:via-purple-950 dark:to-black">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse" />
          <motion.div 
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                "radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 60%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          <div className="container max-w-7xl mx-auto relative z-10">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
                  <Sparkles className="h-4 w-4 text-purple-300" />
                  <span className="text-sm font-semibold text-purple-200">AI-Powered Learning Platform</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-center mb-6 text-white">
                  Your Personal
                  <span className="text-lg md:text-xl text-white font-medium text-center drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
                    AI Tutor
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 mb-4 font-medium">
                  Study Smarter. Learn Faster.
                </p>
                
                <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
                  Turn your lectures, notes, and readings into flashcards, summaries, and quizzes — all powered by AI.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-lg px-8 py-4 rounded-xl font-semibold shadow-xl"
                  onClick={handleGetStarted}
                  disabled={isLoading || (user && !paddleLoaded)}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  {isLoading ? "Opening Checkout..." : "Start Learning Free"}
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-xl"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </motion.div>

              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    <CountUp end={500} duration={2.5} />K+
                  </div>
                  <p className="text-gray-300">Students Worldwide</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    <CountUp end={128} duration={2.5} />+
                  </div>
                  <p className="text-gray-300">Countries</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    <CountUp end={200} duration={2.5} />+
                  </div>
                  <p className="text-gray-300">Top Institutions</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trusted by Universities Section */}
        <section className="py-28 bg-white dark:bg-gray-950" data-aos="fade-up">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Empowering learners from 200+ leading institutions across 128 countries  Trusted by over 500,000 students
              </h2>
            </div>
            <div className="relative overflow-hidden w-full">
              <motion.div
                className="flex gap-20 items-center"
                style={{ minWidth: "min-content" }}
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 60,
                  ease: "linear"
                }}
              >
                {/* Duplicate array for seamless looping */}
                {[
                  { name: "Boston University", logo: BostonLogo },
                  { name: "University of Chicago", logo: ChicagoLogo },
                  { name: "Georgetown University", logo: GeorgetownLogo },
                  { name: "Harvard University", logo: HarvardLogo },
                  { name: "Howard University", logo: HowardLogo },
                  { name: "Ohio State University", logo: OhioStateLogo },
                  { name: "University of Otago", logo: OtagoLogo },
                  { name: "University of Pittsburgh", logo: PittsburghLogo },
                  { name: "Stanford University", logo: StanfordLogo },
                ].concat([
                  { name: "Boston University", logo: BostonLogo },
                  { name: "University of Chicago", logo: ChicagoLogo },
                  { name: "Georgetown University", logo: GeorgetownLogo },
                  { name: "Harvard University", logo: HarvardLogo },
                  { name: "Howard University", logo: HowardLogo },
                  { name: "Ohio State University", logo: OhioStateLogo },
                  { name: "University of Otago", logo: OtagoLogo },
                  { name: "University of Pittsburgh", logo: PittsburghLogo },
                  { name: "Stanford University", logo: StanfordLogo },
                ]).map((uni, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 flex items-center justify-center transition-transform duration-300 hover:scale-110"
                    style={{ minWidth: 220 }}
                    title={uni.name}
                  >
                    <img
                      src={uni.logo}
                      alt={uni.name + " logo"}
                      className="h-24 md:h-32 max-w-[220px] object-contain transition-all duration-300 hover:drop-shadow-lg"
                      style={{ filter: "drop-shadow(0 2px 8px #0002)" }}
                    />
                  </div>
                ))}
              </motion.div>
              {/* Optional: subtle fades at the edges for polish */}
              <div className="pointer-events-none absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white/90 dark:from-gray-950/90 to-transparent z-10" />
              <div className="pointer-events-none absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white/90 dark:from-gray-950/90 to-transparent z-10" />
            </div>
          </div>
        </section>

        {/* Real Reviews Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Loved by Students Everywhere
              </h2>
              <div className="flex justify-center items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-lg font-semibold ml-2">4.9/5 from 10,000+ reviews</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Sarah Chen",
                  role: "Medical Student",
                  avatar: "👩‍⚕️",
                  review: "Tutorly transformed my study routine! The AI summaries save me hours, and the quiz generation is incredibly accurate.",
                  rating: 5
                },
                {
                  name: "Marcus Rodriguez",
                  role: "Engineering Student", 
                  avatar: "👨‍💻",
                  review: "The math problem solver is a game-changer. It explains each step clearly and helps me understand concepts deeply.",
                  rating: 5
                },
                {
                  name: "Emily Watson",
                  role: "Business Student",
                  avatar: "👩‍💼", 
                  review: "I've tried many study apps, but Tutorly's AI tutor feels like having a personal teacher available 24/7.",
                  rating: 5
                }
              ].map((review, i) => (
                <motion.div
                  key={i}
                  data-aos="fade-up"
                  data-aos-delay={i * 200}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">{review.avatar}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{review.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{review.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{review.review}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white dark:bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need to Excel
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Powerful AI tools designed for modern learners
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: <Brain className="h-12 w-12 text-purple-500" />,
                  title: "AI Chat Tutor",
                  description: "Get instant help from your personal AI tutor, available 24/7 for any subject"
                },
                {
                  icon: <FileText className="h-12 w-12 text-blue-500" />,
                  title: "Smart Notes",
                  description: "Transform any document into organized, AI-enhanced study notes"
                },
                {
                  icon: <Zap className="h-12 w-12 text-green-500" />,
                  title: "Instant Quizzes",
                  description: "Generate personalized quizzes from your study materials automatically"
                },
                {
                  icon: <BookOpen className="h-12 w-12 text-red-500" />,
                  title: "Smart Flashcards",
                  description: "Create adaptive flashcards that focus on what you need to learn"
                },
                {
                  icon: <Calculator className="h-12 w-12 text-orange-500" />,
                  title: "Math Solver",
                  description: "Step-by-step solutions for complex math problems with explanations"
                },
                {
                  icon: <Languages className="h-12 w-12 text-pink-500" />,
                  title: "Multilingual AI",
                  description: "Learn in your preferred language with global AI support"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
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

        {/* AI Demo Section */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12" data-aos="fade-up">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Try Our AI Right Now
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Paste any text and see AI summarization in action
              </p>
            </div>

            <div className="max-w-4xl mx-auto" data-aos="fade-up" data-aos-delay="200">
              <Card className="p-8 shadow-2xl border-2 border-purple-200 dark:border-purple-800">
                <CardContent className="space-y-6 p-0">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Paste your text here:
                    </label>
                    <textarea
                      className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      placeholder="Paste any lecture notes, article, or study material here..."
                      value={aiDemoText}
                      onChange={(e) => setAiDemoText(e.target.value)}
                    />
                  </div>
                  
                  <Button
                    onClick={generateAISummary}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3"
                    disabled={!aiDemoText.trim()}
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    Generate AI Summary
                  </Button>

                  {aiDemoResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">AI Result:</h4>
                      <p className="text-gray-700 dark:text-gray-300">{aiDemoResult}</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive Stats */}
        <section className="py-20 bg-white dark:bg-black">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                { number: 2300000, suffix: "+", label: "Flashcards Created" },
                { number: 780000, suffix: "+", label: "Notes Summarized" },
                { number: 1500000, suffix: "+", label: "Quizzes Generated" },
                { number: 95, suffix: "%", label: "Student Success Rate" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  data-aos="fade-up"
                  data-aos-delay={i * 150}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    <CountUp 
                      end={stat.number} 
                      duration={3}
                      separator=","
                      suffix={stat.suffix}
                    />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Tutorly?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                See how we compare to other platforms
              </p>
            </div>

            <div className="max-w-4xl mx-auto" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-4 gap-4 p-6 bg-gray-100 dark:bg-gray-700 font-semibold text-gray-900 dark:text-white">
                  <div>Features</div>
                  <div className="text-center">Tutorly</div>
                  <div className="text-center">Mindgrasp</div>
                  <div className="text-center">Quizlet</div>
                </div>

                {[
                  ["AI Chat Tutor", true, false, false],
                  ["Math Problem Solver", true, false, false],
                  ["Multi-format Upload", true, true, false],
                  ["Real-time Collaboration", true, false, true],
                  ["Offline Access", true, false, true],
                  ["Free Forever Plan", true, false, true]
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 p-6 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                    <div className="font-medium text-gray-900 dark:text-white">{row[0]}</div>
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="text-center">
                        {row[j] ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-white dark:bg-black">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16" data-aos="fade-up">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Start free, upgrade when you're ready
              </p>

              <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    pricingToggle === "monthly" 
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  onClick={() => setPricingToggle("monthly")}
                >
                  Monthly
                </button>
                <button
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    pricingToggle === "yearly" 
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  onClick={() => setPricingToggle("yearly")}
                >
                  Yearly
                  <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Save 20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: "Free",
                  price: { monthly: "$0", yearly: "$0" },
                  description: "Perfect for getting started",
                  features: ["5 AI summaries/month", "Basic flashcards", "Community support"],
                  cta: "Start Free",
                  popular: false
                },
                {
                  name: "Pro",
                  price: { monthly: "$9.99", yearly: "$7.99" },
                  description: "Best for serious students",
                  features: ["Unlimited AI features", "Advanced quiz generation", "Priority support", "Export options"],
                  cta: "Start Pro Trial",
                  popular: true
                },
                {
                  name: "Team",
                  price: { monthly: "$19.99", yearly: "$15.99" },
                  description: "For study groups & classes",
                  features: ["Everything in Pro", "Team collaboration", "Admin dashboard", "Custom integrations"],
                  cta: "Start Team Trial",
                  popular: false
                }
              ].map((plan, i) => (
                <motion.div
                  key={i}
                  data-aos="fade-up"
                  data-aos-delay={i * 150}
                  whileHover={{ y: -5 }}
                  className={`relative bg-white dark:bg-gray-800 p-8 rounded-xl border-2 ${
                    plan.popular 
                      ? "border-purple-500 shadow-xl" 
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Best Value
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.price[pricingToggle]}
                      <span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full py-3 ${
                      plan.popular 
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={handleGetStarted}
                    disabled={isLoading || (user && !paddleLoaded)}
                  >
                    {plan.cta}
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12" data-aos="fade-up" data-aos-delay="400">
              <div className="flex justify-center items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-black dark:via-purple-950 dark:to-black">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              data-aos="fade-up"
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join over 500,000 students who are already studying smarter with AI
              </p>
              
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xl px-12 py-4 rounded-xl font-semibold shadow-xl"
                onClick={handleGetStarted}
                disabled={isLoading || (user && !paddleLoaded)}
              >
                <Zap className="mr-2 h-6 w-6" />
                {isLoading ? "Opening Checkout..." : "Start Your Free Journey"}
              </Button>
              
              <p className="text-gray-400 mt-4 text-sm">
                No credit card required • Free forever plan available
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Video Modal */}
      {isVideoPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
              <div className="text-white text-center">
                <Play className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg">Demo Video Coming Soon!</p>
                <p className="text-sm opacity-75">See Tutorly in action</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsVideoPlaying(false)}
            >
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Index;

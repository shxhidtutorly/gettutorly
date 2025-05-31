import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  BookOpenText, 
  Sparkles, 
  Brain, 
  BookOpen, 
  BarChart3, 
  Zap, 
  MessageSquare, 
  FileText,
  CheckCircle,
  LogIn
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import LoginButton from "@/components/auth/LoginButton";
import UserProfileButton from "@/components/auth/UserProfileButton";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import SimpleAIDemo from "@/components/features/SimpleAIDemo";

// Animation variants for reusable animations
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const slideUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const slideInLeft = {
  hidden: { x: -60, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const slideInRight = {
  hidden: { x: 60, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Custom animation hook to trigger animations when in view
function useAnimateOnScroll(): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  
  return [ref, isInView];
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  // Manage scroll position for parallax and scroll-triggered effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleGetStarted = () => {
    // Temporarily redirect directly to dashboard without checking authentication
    navigate("/dashboard");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background">
      {/* Animated navbar */}
      <motion.header 
        className="bg-gray-900 text-white sticky top-0 z-50 shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <motion.div 
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl font-bold text-white">Tutorly</span>
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser ? (
              <UserProfileButton />
            ) : (
              <>
                <LoginButton variant="ghost" />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-purple-500 text-white hover:bg-purple-600 py-2 px-6 rounded-md font-semibold"
                    onClick={handleGetStarted}
                  >
                    Get Started
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.header>
      
      <main className="flex-1">
        {/* Hero Section with animated entry and parallax effect */}
        <section className="py-20 px-4 bg-gray-900 text-white relative overflow-hidden">
          {/* Subtle parallax background effect */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('/api/placeholder/1200/800')",
              backgroundSize: "cover",
              transform: `translateY(${scrollY * 0.1}px)`,
              zIndex: 0
            }}
          ></div>
          
          <div className="container max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <motion.div 
                className="w-full space-y-6 text-center"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.2
                    }
                  }
                }}
              >
                <motion.div 
                  variants={fadeIn}
                  className="inline-flex items-center gap-2 bg-purple-900/60 px-4 py-2 rounded-full mb-3"
                >
                  <Sparkles className="h-4 w-4 text-purple-300" />
                  <span className="text-sm font-semibold text-purple-300">Smart Learning Platform</span>
                </motion.div>
                
                <motion.h1 
                  variants={slideUp}
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white"
                >
                  Supercharge Your Studies with
                  <motion.span 
                    className="bg-gradient-to-r from-purple-400 to-purple-300 text-transparent bg-clip-text block mt-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    Intelligent Study Tools
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  variants={fadeIn}
                  className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto leading-relaxed"
                >
                  Upload notes, get instant summaries, personalized quizzes, and track your progress. Study smarter, not harder.
                </motion.p>
                
                <motion.div 
                  variants={slideUp}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                >
                  {currentUser ? (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white button-click-effect text-base font-semibold py-6 px-8 rounded-md shadow-lg"
                        onClick={() => navigate("/dashboard")}
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        Go to Dashboard
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LoginButton 
                        size="lg"
                        variant="default"
                      />
                    </motion.div>
                  )}
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full sm:w-auto text-base font-medium border-purple-400 text-purple-300 hover:bg-purple-900/40 py-6 px-8 rounded-md"
                      onClick={() => {
                        toast({
                          title: "Coming Soon!",
                          description: "Our product tour video will be available soon!"
                        });
                      }}
                    >
                      See How It Works
                    </Button>
                  </motion.div>
                </motion.div>
                
                {/* Social proof with counter animation */}
                <motion.div 
                  variants={fadeIn}
                  className="pt-4"
                >
                  <p className="text-sm font-medium text-gray-300">
                    Trusted by <CountUp end={1000000} className="font-bold text-purple-300" />+ students worldwide
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* AI Demo Section */}
        <section className="py-12 px-4 bg-muted">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Test AI Edge Function</h2>
              <p className="text-muted-foreground">Try our Supabase Edge Function integration</p>
            </div>
            <SimpleAIDemo />
          </div>
        </section>
        
        {/* Features Section with staggered animations */}
        <FeaturesSection />
        
        {/* Upload Section with improved visuals */}
        <UploadSection handleGetStarted={handleGetStarted} />
        
        {/* Why Tutorly Works Section with improved readability */}
        <BenefitsSection />
        
        {/* Testimonials Section with proper dark mode support */}
        <TestimonialsSection />
        
        {/* CTA Section with improved contrast and visible button */}
        <CTASection currentUser={currentUser} navigate={navigate} />
      </main>
      
      <Footer />
    </div>
  );
};

// Counter component for animated number counting
const CountUp = ({ end, className }: { end: number; className: string }) => {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useAnimateOnScroll();
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp: number;
    const duration = 2000; // 2 seconds
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, isInView]);
  
  return <span ref={ref} className={className}>{count.toLocaleString()}</span>;
};

// Features Section Component with staggered animations
const FeaturesSection = () => {
  const [ref, isInView] = useAnimateOnScroll();
  
  return (
    <section className="py-20 px-4 bg-background dark:bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={slideUp}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Everything You Need To Study Smarter
          </motion.h2>
          <motion.p 
            variants={fadeIn}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Our platform transforms the way you learn with these powerful features
          </motion.p>
        </motion.div>
        
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <motion.div variants={fadeIn}>
            <FeatureCard 
              icon={<Brain className="w-10 h-10 text-purple-500" />}
              title="AI Study Tutor"
              description="Chat with your personalized AI tutor about any topic in your study materials"
            />
          </motion.div>
          <motion.div variants={fadeIn}>
            <FeatureCard 
              icon={<BookOpen className="w-10 h-10 text-purple-500" />}
              title="Smart Study Tools"
              description="Accelerate your learning with effective study materials generated from your content"
            />
          </motion.div>
          <motion.div variants={fadeIn}>
            <FeatureCard 
              icon={<BarChart3 className="w-10 h-10 text-purple-500" />}
              title="Progress Tracking"
              description="Monitor your learning progress with detailed analytics"
            />
          </motion.div>
          <motion.div variants={fadeIn}>
            <FeatureCard 
              icon={<Zap className="w-10 h-10 text-purple-500" />}
              title="Instant Quizzes"
              description="Test your knowledge with AI-generated quizzes tailored to your materials"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Upload Section Component with scroll animations
const UploadSection = ({ handleGetStarted }: { handleGetStarted: () => void }) => {
  const [ref, isInView] = useAnimateOnScroll();
  
  return (
    <section className="py-20 bg-muted px-4 overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.h2 
            variants={slideUp}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Upload Any Study Material
          </motion.h2>
          <motion.p 
            variants={fadeIn}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Our AI instantly processes your documents and helps you learn faster
          </motion.p>
        </motion.div>
        
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="bg-card rounded-xl shadow-lg p-8 border"
        >
          <div className="grid grid-cols-1 gap-10">
            <div className="flex flex-col justify-center">
              <motion.h3 
                variants={slideUp}
                className="text-2xl font-bold mb-4"
              >
                Supports Multiple Formats
              </motion.h3>
              <motion.p 
                variants={fadeIn}
                className="text-muted-foreground mb-8 text-lg"
              >
                Upload PDFs, Word documents, images, or plain text. Our AI processes everything.
              </motion.p>
              
              <motion.div 
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
              >
                <motion.div variants={slideInLeft}>
                  <DocumentTypeCard 
                    icon={<FileText className="h-6 w-6 text-red-600" />}
                    title="PDF Files"
                    description="Textbooks, articles, papers"
                  />
                </motion.div>
                <motion.div variants={slideInRight}>
                  <DocumentTypeCard 
                    icon={<FileText className="h-6 w-6 text-blue-600" />}
                    title="Word Documents"
                    description="Notes, essays, assignments"
                  />
                </motion.div>
                <motion.div variants={slideInLeft}>
                  <DocumentTypeCard 
                    icon={<FileText className="h-6 w-6 text-green-600" />}
                    title="Images"
                    description="Diagrams, charts, screenshots"
                  />
                </motion.div>
                <motion.div variants={slideInRight}>
                  <DocumentTypeCard 
                    icon={<MessageSquare className="h-6 w-6 text-purple-600" />}
                    title="Text & URLs"
                    description="Copy-paste or link websites"
                  />
                </motion.div>
              </motion.div>
              
              <motion.div 
                variants={slideUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="w-full md:w-auto bg-purple-500 hover:bg-purple-600 text-white font-semibold text-base shadow-md py-3 px-6 rounded-md"
                  onClick={handleGetStarted}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Upload Your First Document
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Benefits Section Component with scroll animations
const BenefitsSection = () => {
  const [ref, isInView] = useAnimateOnScroll();
  
  return (
    <section className="py-20 bg-background dark:bg-background px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.h2 
            variants={slideUp}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Why Tutorly Works
          </motion.h2>
          <motion.p 
            variants={fadeIn}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Our science-based approach combines proven learning methods with cutting-edge AI
          </motion.p>
        </motion.div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={slideInLeft}>
            <BenefitCard 
              number="01"
              title="Active Recall"
              description="Our interactive tools force your brain to retrieve information, strengthening neural connections."
            />
          </motion.div>
          <motion.div variants={slideUp}>
            <BenefitCard 
              number="02"
              title="Spaced Repetition"
              description="Our system automatically schedules reviews at optimal intervals to maximize long-term retention."
            />
          </motion.div>
          <motion.div variants={slideInRight}>
            <BenefitCard 
              number="03"
              title="AI Personalization"
              description="Our advanced algorithms adapt to your learning style, focusing on areas where you need the most help."
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  // Remove scroll trigger for headings for instant rendering
  return (
    <section className="py-20 bg-muted px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Headings: Fade in and slide down instantly */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={false}
            animate={false}
          >
            Loved by Students Everywhere
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={false}
            animate={false}
          >
            See what our users are saying about their learning experience
          </motion.p>
        </motion.div>
        
        {/* Testimonials: Staggered fade-in, not scroll-based */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.2 }
            }
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
            }}
          >
            <TestimonialCard 
              quote="Tutorly completely changed how I study. I've improved my grades significantly!"
              author="Alex K."
              role="Computer Science Student"
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.2 } }
            }}
          >
            <TestimonialCard 
              quote="The AI tutor feels like having a professor available 24/7. It's incredible!"
              author="Sarah M."
              role="Medical Student"
            />
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.4 } }
            }}
          >
            <TestimonialCard 
              quote="The study tools generated from my notes have saved me countless hours of study time."
              author="James L."
              role="Law Student"
            />
          </motion.div>
        </motion.div>
        
        {/* Stats: Also fade in instantly for fast render */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 bg-card rounded-xl shadow-lg p-10 grid grid-cols-1 md:grid-cols-3 gap-10 border"
        >
          <div className="text-center stats-item">
            <div className="text-5xl font-bold text-purple-500 mb-3">
              <CountUp end={30} className="font-bold text-purple-500" />%
            </div>
            <p className="text-lg font-medium text-foreground">Average Exam Score Improvement</p>
          </div>
          <div className="text-center stats-item">
            <div className="text-5xl font-bold text-purple-500 mb-3">
              <CountUp end={1000000} className="font-bold text-purple-500" />+
            </div>
            <p className="text-lg font-medium text-foreground">Active Student Users</p>
          </div>
          <div className="text-center stats-item">
            <div className="text-5xl font-bold text-purple-500 mb-3">
              <CountUp end={40} className="font-bold text-purple-500" />%
            </div>
            <p className="text-lg font-medium text-foreground">Less Study Time Required</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// CTA Section Component with scroll animations
const CTASection = ({ currentUser, navigate }: { currentUser: any; navigate: any }) => {
  const [ref, isInView] = useAnimateOnScroll();
  
  return (
    <section className="py-20 bg-gray-900 text-white px-4">
      <div className="container mx-auto max-w-5xl text-center">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.h2 
            variants={slideUp}
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
          >
            Ready to Transform Your Learning?
          </motion.h2>
          <motion.p 
            variants={fadeIn}
            className="text-xl text-gray-300 max-w-2xl mx-auto mb-8"
          >
            Join thousands of students who are already studying smarter, not harder.
          </motion.p>
          <motion.div 
            variants={slideUp}
            className="flex justify-center"
          >
            {currentUser ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-purple-500 hover:bg-purple-600 text-white text-lg font-semibold shadow-lg py-3 px-8 rounded-md" 
                  onClick={() => navigate("/dashboard")}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Go to Your Dashboard
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LoginButton 
                  size="lg"
                  variant="default"
                />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Feature Card Component with hover animations
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    whileHover={{ y: -10, transition: { duration: 0.2 } }}
  >
    <Card className="border shadow-md hover:shadow-lg transition-all duration-300 h-full feature-card">
      <CardContent className="p-6 space-y-4 h-full">
        <motion.div 
          className="p-3 bg-purple-100 w-fit rounded-xl"
          whileHover={{ 
            rotate: [0, -10, 10, -10, 0],
            transition: { duration: 0.6 }
          }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

// Document Type Card with hover animations
const DocumentTypeCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    whileHover={{ 
      scale: 1.03,
      backgroundColor: "rgba(124, 58, 237, 0.1)",
      transition: { duration: 0.2 }
    }}
    className="bg-muted p-4 rounded-lg cursor-pointer"
  >
    <div className="flex items-start gap-3">
      <motion.div 
        className="mt-1"
        whileHover={{ 
          rotate: [0, -10, 10, -10, 0],
          transition: { duration: 0.5 }
        }}
      >
        {icon}
      </motion.div>
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </motion.div>
);

// Benefit Card with hover animations
const BenefitCard = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <motion.div
    whileHover={{ 
      y: -10,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.2 }
    }}
    className="bg-card border rounded-xl p-6 shadow-md transition-all duration-300 h-full"
  >
    <div className="text-sm font-bold text-purple-500 mb-3">{number}</div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
    <motion.div 
      className="mt-4 flex items-center text-purple-600 font-semibold"
      whileHover={{ x: 5, transition: { duration: 0.2 } }}
    >
      <CheckCircle className="h-5 w-5 mr-2" />
      <span>Proven Effective</span>
    </motion.div>
  </motion.div>
);

// Testimonial Card Component with hover animations
const TestimonialCard = ({ quote, author, role }: { quote: string; author: string; role: string }) => (
  <motion.div
    whileHover={{ 
      y: -10,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.2 }
    }}
  >
    <Card className="p-6 border shadow-md h-full testimonial-card">
      <CardContent className="p-0 space-y-4 h-full">
        <motion.div 
          className="text-4xl text-purple-500"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          "
        </motion.div>
        <p className="text-muted-foreground italic">{quote}</p>
        <div className="mt-auto pt-4">
          <p className="font-bold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default Index;

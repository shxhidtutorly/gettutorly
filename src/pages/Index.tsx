import { useState } from "react";
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

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const handleGetStarted = () => {
    // Temporarily redirect directly to dashboard without checking authentication
    navigate("/dashboard");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background">
      {/* Dark navbar with clear navigation elements */}
      <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 hover-lift">
              <span className="text-xl font-bold text-white">Tutorly</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser ? (
              <UserProfileButton />
            ) : (
              <>
                <LoginButton variant="ghost" />
                <Button 
                  className="bg-purple-500 text-white hover:bg-purple-600 py-2 px-6 rounded-md font-semibold"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section with improved text visibility */}
        <section className="py-20 px-4 bg-gray-900 text-white">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="w-full space-y-6 text-center">
                <div className="inline-flex items-center gap-2 bg-purple-900/60 px-4 py-2 rounded-full mb-3">
                  <Sparkles className="h-4 w-4 text-purple-300" />
                  <span className="text-sm font-semibold text-purple-300">Smart Learning Platform</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
                  Supercharge Your Studies with
                  <span className="bg-gradient-to-r from-purple-400 to-purple-300 text-transparent bg-clip-text block mt-3">
                    Intelligent Study Tools
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto leading-relaxed">
                  Upload notes, get instant summaries, personalized quizzes, and track your progress. Study smarter, not harder.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  {currentUser ? (
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white button-click-effect text-base font-semibold py-6 px-8 rounded-md shadow-lg"
                      onClick={() => navigate("/dashboard")}
                    >
                      <Zap className="mr-2 h-5 w-5" />
                      Go to Dashboard
                    </Button>
                  ) : (
                    <LoginButton 
                      size="lg"
                      variant="default"
                    />
                  )}
                  
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
                </div>
                
                {/* Social proof */}
                <div className="pt-4">
                  <p className="text-sm font-medium text-gray-300">Trusted by <span className="font-bold text-purple-300">10,000+</span> students worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Rest of the sections remain unchanged */}
        {/* Features Section with improved color contrast */}
        <section className="py-20 px-4 bg-background dark:bg-background">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need To Study Smarter</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform transforms the way you learn with these powerful features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<Brain className="w-10 h-10 text-purple-500" />}
                title="AI Study Tutor"
                description="Chat with your personalized AI tutor about any topic in your study materials"
              />
              <FeatureCard 
                icon={<BookOpen className="w-10 h-10 text-purple-500" />}
                title="Smart Study Tools"
                description="Accelerate your learning with effective study materials generated from your content"
              />
              <FeatureCard 
                icon={<BarChart3 className="w-10 h-10 text-purple-500" />}
                title="Progress Tracking"
                description="Monitor your learning progress with detailed analytics"
              />
              <FeatureCard 
                icon={<Zap className="w-10 h-10 text-purple-500" />}
                title="Instant Quizzes"
                description="Test your knowledge with AI-generated quizzes tailored to your materials"
              />
            </div>
          </div>
        </section>
        
        {/* Upload Section with improved visuals */}
        <section className="py-20 bg-muted px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Upload Any Study Material</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our AI instantly processes your documents and helps you learn faster
              </p>
            </div>
            
            <div className="bg-card rounded-xl shadow-lg p-8 border">
              <div className="grid grid-cols-1 gap-10">
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Supports Multiple Formats</h3>
                  <p className="text-muted-foreground mb-8 text-lg">
                    Upload PDFs, Word documents, images, or plain text. Our AI processes everything.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <DocumentTypeCard 
                      icon={<FileText className="h-6 w-6 text-red-600" />}
                      title="PDF Files"
                      description="Textbooks, articles, papers"
                    />
                    <DocumentTypeCard 
                      icon={<FileText className="h-6 w-6 text-blue-600" />}
                      title="Word Documents"
                      description="Notes, essays, assignments"
                    />
                    <DocumentTypeCard 
                      icon={<FileText className="h-6 w-6 text-green-600" />}
                      title="Images"
                      description="Diagrams, charts, screenshots"
                    />
                    <DocumentTypeCard 
                      icon={<MessageSquare className="h-6 w-6 text-purple-600" />}
                      title="Text & URLs"
                      description="Copy-paste or link websites"
                    />
                  </div>
                  
                  <Button 
                    className="w-full md:w-auto bg-purple-500 hover:bg-purple-600 text-white font-semibold text-base shadow-md py-3 px-6 rounded-md"
                    onClick={handleGetStarted}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Upload Your First Document
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why Tutorly Works Section with improved readability */}
        <section className="py-20 bg-background dark:bg-background px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Tutorly Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our science-based approach combines proven learning methods with cutting-edge AI
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <BenefitCard 
                number="01"
                title="Active Recall"
                description="Our interactive tools force your brain to retrieve information, strengthening neural connections."
              />
              <BenefitCard 
                number="02"
                title="Spaced Repetition"
                description="Our system automatically schedules reviews at optimal intervals to maximize long-term retention."
              />
              <BenefitCard 
                number="03"
                title="AI Personalization"
                description="Our advanced algorithms adapt to your learning style, focusing on areas where you need the most help."
              />
            </div>
          </div>
        </section>
        
        {/* Testimonials Section with proper dark mode support */}
        <section className="py-20 bg-muted px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Students Everywhere</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See what our users are saying about their learning experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard 
                quote="Tutorly completely changed how I study. I've improved my grades significantly!"
                author="Alex K."
                role="Computer Science Student"
              />
              <TestimonialCard 
                quote="The AI tutor feels like having a professor available 24/7. It's incredible!"
                author="Sarah M."
                role="Medical Student"
              />
              <TestimonialCard 
                quote="The study tools generated from my notes have saved me countless hours of study time."
                author="James L."
                role="Law Student"
              />
            </div>
            
            {/* Stats section with improved visibility */}
            <div className="mt-16 bg-card rounded-xl shadow-lg p-10 grid grid-cols-1 md:grid-cols-3 gap-10 border">
              <div className="text-center stats-item">
                <div className="text-5xl font-bold text-purple-500 mb-3">30%</div>
                <p className="text-lg font-medium text-foreground">Average Exam Score Improvement</p>
              </div>
              <div className="text-center stats-item">
                <div className="text-5xl font-bold text-purple-500 mb-3">10,000+</div>
                <p className="text-lg font-medium text-foreground">Active Student Users</p>
              </div>
              <div className="text-center stats-item">
                <div className="text-5xl font-bold text-purple-500 mb-3">40%</div>
                <p className="text-lg font-medium text-foreground">Less Study Time Required</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section with improved contrast and visible button */}
        <section className="py-20 bg-gray-900 text-white px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Join thousands of students who are already studying smarter, not harder.
            </p>
            <div className="flex justify-center">
              {currentUser ? (
                <Button 
                  size="lg" 
                  className="bg-purple-500 hover:bg-purple-600 text-white text-lg font-semibold shadow-lg py-3 px-8 rounded-md" 
                  onClick={() => navigate("/dashboard")}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Go to Your Dashboard
                </Button>
              ) : (
                <LoginButton 
                  size="lg"
                  variant="default"
                />
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

// Feature Card Component with improved visibility and dark mode support
const FeatureCard = ({ icon, title, description }) => (
  <Card className="border shadow-md hover:shadow-lg transition-all duration-300 h-full feature-card">
    <CardContent className="p-6 space-y-4 h-full">
      <div className="p-3 bg-purple-100 w-fit rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// Document Type Card with improved contrast and dark mode support
const DocumentTypeCard = ({ icon, title, description }) => (
  <div className="bg-muted p-4 rounded-lg">
    <div className="flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

// Benefit Card with improved visibility and dark mode support
const BenefitCard = ({ number, title, description }) => (
  <div className="bg-card border rounded-xl p-6 shadow-md transition-all duration-300 hover:-translate-y-1 h-full">
    <div className="text-sm font-bold text-purple-500 mb-3">{number}</div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
    <div className="mt-4 flex items-center text-purple-600 font-semibold">
      <CheckCircle className="h-5 w-5 mr-2" />
      <span>Proven Effective</span>
    </div>
  </div>
);

// Testimonial Card Component with improved contrast and dark mode support
const TestimonialCard = ({ quote, author, role }) => (
  <Card className="p-6 border shadow-md h-full testimonial-card">
    <CardContent className="p-0 space-y-4 h-full">
      <div className="text-4xl text-purple-500">"</div>
      <p className="text-muted-foreground italic">{quote}</p>
      <div className="mt-auto pt-4">
        <p className="font-bold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </CardContent>
  </Card>
);

export default Index;

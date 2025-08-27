import React from 'react';
import { MessageSquare, FileText, Headphones, BookOpen, HelpCircle, Calculator, CreditCard, BrainCircuit, FileSignature, ArrowRight } from "lucide-react";
import  Navbar  from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function App() {
  // Array of all features with brutalist styling properties
  const coreFeatures = [
    {
      icon: Calculator,
      title: "MATH SOLVER",
      desc: "Solve complex math problems with step-by-step AI explanations and visual solutions.",
      href: "/features/math-chat",
      color: "bg-fuchsia-400",
      iconBg: "bg-fuchsia-100",
      textColor: "text-black",
    },
    {
      icon: FileText,
      title: "AI NOTES",
      desc: "Generate smart, structured notes from any document, lecture, or study material instantly.",
      href: "/features/ai-notes",
      color: "bg-sky-400",
      iconBg: "bg-sky-100",
      textColor: "text-black",
    },
    {
      icon: Headphones,
      title: "AUDIO RECAP",
      desc: "Convert audio recordings and lectures into organized notes and summaries.",
      href: "/features/audio-recap",
      color: "bg-emerald-400",
      iconBg: "bg-emerald-100",
      textColor: "text-black",
    },
    {
      icon: BookOpen,
      title: "SUMMARIZER",
      desc: "Quickly summarize any text, article, or document into key points and insights.",
      href: "/features/summaries",
      color: "bg-amber-400",
      iconBg: "bg-amber-100",
      textColor: "text-black",
    },
    {
      icon: CreditCard,
      title: "FLASHCARDS",
      desc: "Create and review adaptive flashcards that evolve based on your learning progress.",
      href: "/features/flashcard",
      color: "bg-orange-500",
      iconBg: "bg-orange-100",
      textColor: "text-black",
    },
    {
      icon: HelpCircle,
      title: "TESTS & QUIZZES",
      desc: "Test your knowledge with AI-generated quizzes based on your study materials.",
      href: "/features/tests-quiz",
      color: "bg-rose-500",
      iconBg: "bg-rose-100",
      textColor: "text-black",
    },
    {
      icon: MessageSquare,
      title: "DOUBT CHAIN",
      desc: "Break down complex concepts into simple, connected steps for better understanding.",
      href: "/features/doubt-chain",
      color: "bg-indigo-500",
      iconBg: "bg-indigo-100",
      textColor: "text-black",
    },
    {
      icon: BrainCircuit,
      title: "STUDY TECHNIQUES",
      desc: "Discover and apply proven learning methods like Feynman & Pomodoro tailored to your content.",
      href: "/features/study-techniques",
      color: "bg-teal-400",
      iconBg: "bg-teal-100",
      textColor: "text-black",
    },
  
  // Reusable classes for brutalist elements
  const brutalistTransition = "transition-all duration-300 ease-in-out";
  const brutalistHover = "hover:shadow-none hover:-translate-x-1 hover:-translate-y-1";

  return (
    <div className="min-h-screen bg-stone-50 text-black font-mono selection:bg-amber-400 selection:text-black">
      <Navbar />
      
      {/* Hero Section with Gradient Background */}
      <section className="bg-teal-300 text-black border-b-4 border-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center py-24 md:py-32 relative">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none text-white my-8 animate-slide-in" style={{ textShadow: '4px 4px 0 #000, 8px 8px 0 #8b5cf6' }}>
         All Features
          </h1>
          <p style={{ animationDelay: '0.2s' }} className="animate-slide-in text-xl md:text-2xl font-bold text-stone-900 max-w-4xl mx-auto bg-white/50 backdrop-blur-sm p-4 border-4 border-black">
            Discover every tool you need to transform your learning experience with AI-powered assistance.
          </p>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="bg-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
             <h2 className="inline-block bg-amber-300 text-4xl md:text-6xl font-black mb-4 uppercase px-8 py-3 border-4 border-black">Core Tools</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {coreFeatures.map((feature, index) => (
              <a 
                key={index} 
                href={feature.href}
                className={`group block ${brutalistShadow} ${brutalistTransition} ${brutalistHover} bg-white`}
              >
                <div className={`h-full p-8 flex flex-col`}>
                  {/* Interactive Icon inspired by the image */}
                  <div className={`relative mb-6 w-20 h-20 flex items-center justify-center rounded-full ${feature.iconBg} border-4 border-black`}>
                     <div className={`absolute -top-2 -right-2 w-6 h-6 ${feature.color} rounded-full border-2 border-black`}></div>
                     <feature.icon className={`w-10 h-10 ${feature.textColor}`} strokeWidth={2.5} />
                  </div>
                  
                  <h3 className={`text-2xl font-black mb-4 uppercase ${feature.textColor}`}>{feature.title}</h3>
                  <p className="text-lg font-bold leading-snug mb-6 flex-grow text-stone-700">{feature.desc}</p>
                  
                  <div className={`mt-auto pt-4 border-t-2 border-dashed border-black/30 flex items-center justify-end ${feature.textColor}`}>
                    <span className="text-lg font-black uppercase">Explore</span>
                    <ArrowRight className="w-8 h-8 ml-3 transform group-hover:translate-x-2 transition-transform duration-200" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-amber-400 text-black py-20 border-y-4 border-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase">Ready to Start?</h2>
          <p className="text-2xl font-bold mb-10">
            Experience all these features with our free plan, or upgrade for unlimited access.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/signup" className={`block bg-black text-white font-black text-xl px-10 py-5 w-full sm:w-auto ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                START FOR FREE
            </a>
            <a href="/pricing" className={`block bg-white text-black font-black text-xl px-10 py-5 w-full sm:w-auto ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                VIEW PRICING
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

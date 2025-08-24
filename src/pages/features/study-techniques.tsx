"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Brain, Clock, Lightbulb, Network, ArrowRight, Upload, Download, Plus, Minus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function StudyTechniquesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const techniques = [
    {
      icon: Clock,
      title: "POMODORO TECHNIQUE",
      desc: "Work in focused 25-minute intervals with 5-minute breaks to maximize concentration and prevent burnout.",
      steps: [
        "Choose a task to work on",
        "Set timer for 25 minutes",
        "Work until timer rings",
        "Take a 5-minute break",
        "Repeat 3-4 times, then longer break",
      ],
    },
    {
      icon: Lightbulb,
      title: "FEYNMAN TECHNIQUE",
      desc: "Learn by teaching - explain concepts in simple terms to identify knowledge gaps and deepen understanding.",
      steps: [
        "Choose a concept to learn",
        "Explain it in simple terms",
        "Identify gaps in knowledge",
        "Review and simplify further",
        "Use analogies and examples",
      ],
    },
    {
      icon: Network,
      title: "MIND MAPPING",
      desc: "Create visual representations of information to improve memory, understanding, and creative thinking.",
      steps: [
        "Start with central topic",
        "Add main branches for key ideas",
        "Include sub-branches for details",
        "Use colors and images",
        "Review and expand regularly",
      ],
    },
  ]

  const howItHelps = [
    {
      title: "Boost Retention",
      desc: "Master proven methods like the Feynman Technique to deeply embed new concepts into your memory.",
      icon: Brain,
    },
    {
      title: "Increase Focus",
      desc: "Use the Pomodoro Technique to eliminate distractions and maintain high-intensity focus sessions.",
      icon: TrendingUp,
    },
    {
      title: "Organize Knowledge",
      desc: "Mind Mapping helps you structure complex information visually for better recall and comprehension.",
      icon: Network,
    },
  ]

  const otherFeatures = [
    { name: "Math Chat", href: "/features/math-chat", desc: "Solve problems with step-by-step help" },
    { name: "AI Notes", href: "/features/ai-notes", desc: "Generate smart notes from any content" },
    { name: "Flashcards", href: "/features/flashcard", desc: "Create adaptive study cards" },
    { name: "Tests & Quizzes", href: "/features/tests-quiz", desc: "Generate practice tests" },
    { name: "Summarizer", href: "/features/summaries", desc: "Summarize any document" },
    { name: "Doubt Chain", href: "/features/doubt-chain", desc: "Break down complex concepts" },
  ]
  const aiNotesFaqs = [
    {
      question: "What makes these techniques so effective?",
      answer:
        "These methods are based on cognitive science principles and are designed to optimize how your brain learns, remembers, and processes information.",
    },
    {
      question: "Can I use these with other AI features?",
      answer:
        "Absolutely. These techniques are designed to be used with tools like AI Notes, Math Chat, and Summarizer to create a powerful, integrated learning system.",
    },
    {
      question: "Are there techniques for different learning styles?",
      answer:
        "Yes, from the visual approach of Mind Mapping to the active recall of the Feynman Technique, you can find a method that suits your personal learning style.",
    },
    {
      question: "How do I know which technique is right for me?",
      answer:
        "Experiment! Start with one that interests you, follow the steps, and see how it impacts your study sessions. You can combine different techniques to find what works best.",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <Navbar />

      {/* Hero Section */}
      <section className="feature-hero py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-8 scroll-fade-in">
            <div className="flex justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center brutal-border floating">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "0.5s" }}
              >
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "1s" }}
              >
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>

            <Badge className="bg-purple-500 text-white font-black text-lg px-6 py-3 brutal-border">
              📚 STUDY TECHNIQUES
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black leading-none text-black">
              Study Techniques
            </h1>

            <p className="text-2xl md:text-3xl font-bold text-black max-w-4xl mx-auto">
              Master proven methods that make learning easier and more effective, helping you retain more information and study smarter.
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg">Our users improved their study efficiency by</span>
              <Badge className="bg-yellow-500 text-black font-black px-4 py-2">75%</Badge>
            </div>

            <Link href="/signup">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
                🚀 Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Helps Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black text-black mb-6">How It Helps You</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItHelps.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 brutal-border hover-scale transition-all scroll-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black">{item.title}</h3>
                </div>
                <p className="font-bold text-black-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Techniques Grid */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {techniques.map((technique, index) => (
              <div
                key={index}
                className={`p-8 brutal-border hover-scale transition-all ${
                  index === 0
                    ? "bg-purple-500 text-white"
                    : index === 1
                    ? "bg-blue-800 text-white"
                    : "bg-black text-white"
                }`}
              >
                <technique.icon className="w-16 h-16 mb-6" />
                <h3 className="text-2xl font-black mb-4">{technique.title}</h3>
                <p className="font-bold mb-6 leading-tight">{technique.desc}</p>

                <div className="space-y-3">
                  <h4 className="font-black text-lg">HOW TO DO IT:</h4>
                  {technique.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start">
                      <div className="w-6 h-6 bg-white text-black brutal-border flex items-center justify-center font-black text-sm mr-3 flex-shrink-0 mt-1">
                        {stepIndex + 1}
                      </div>
                      <span className="font-bold">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">FAQs</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>
          <div className="space-y-4">
            {aiNotesFaqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 brutal-border">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center font-black text-lg text-left"
                >
                  {faq.question}
                  {openFaq === index ? (
                    <Minus className="w-6 h-6" />
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                </button>
                {openFaq === index && (
                  <p className="mt-4 font-bold text-gray-700">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Explore Other Features</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div
                  className="bg-gray-50 p-6 brutal-border hover-lift hover-scale transition-all cursor-pointer scroll-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-xl font-black mb-2">{feature.name}</h3>
                  <p className="font-bold text-black-700">{feature.desc}</p>
                  <ArrowRight className="w-5 h-5 mt-4 text-purple-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">
            Ready to Master Your Studies?
          </h2>
          <div className="w-32 h-2 bg-purple-500 mx-auto mb-8"></div>
          <p className="text-xl font-bold text-gray-300 mb-8">
            Combine these powerful study techniques with Tutorly's AI tools to unlock your full academic potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
                START LEARNING FREE
              </Button>
            </Link>
            <Link href="/features">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
                EXPLORE FEATURES
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

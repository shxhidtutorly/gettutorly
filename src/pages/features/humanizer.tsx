"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Feather, ShieldCheck, Zap, ArrowRight, Plus, Minus, Search } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer"

export default function Humanizer() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [demoStep, setDemoStep] = useState(0)

  // This effect cycles through the steps of the interactive demo
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 4) // We have 4 steps now
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const humanizerFaqs = [
    {
      question: "How does the AI detection work?",
      answer:
        "Our tool analyzes text for patterns, syntax, and word choices common in AI-generated content to provide an accurate authenticity score.",
    },
    {
      question: "Will the humanized text pass plagiarism checks?",
      answer:
        "Yes! The Humanizer rewrites content to be unique and original, ensuring it passes both plagiarism and AI detection scans.",
    },
    {
      question: "Can I choose different writing styles or tones?",
      answer:
        "Absolutely. You can select from various tones like 'Formal,' 'Casual,' 'Academic,' or 'Creative' to match your specific needs.",
    },
    {
      question: "What types of content can I humanize?",
      answer:
        "You can humanize essays, articles, emails, reports, marketing copy, and virtually any other type of text you need.",
    },
  ]

  const otherFeatures = [
    { name: "AI Humanizer", href: "/features/humanizer", desc: "Convert AI text to human-like content" },
    { name: "Math Chat", href: "/features/math-chat", desc: "Solve problems with step-by-step help" },
    { name: "AI Notes", href: "/features/ai-notes", desc: "Generate smart notes from any content" },
    { name: "Flashcards", href: "/features/flashcard", desc: "Create adaptive study cards" },
    { name: "Tests & Quizzes", href: "/features/tests-quiz", desc: "Generate practice tests" },
    { name: "Doubt Chain", href: "/features/doubt-chain", desc: "Break down complex concepts" },
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
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "0.5s" }}
              >
                <Feather className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "1s" }}
              >
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>

            <Badge className="bg-purple-500 text-white font-black text-lg px-6 py-3 brutal-border">
              ✍️ AI HUMANIZER
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black leading-none text-black">AI Humanizer</h1>

            <p className="text-2xl md:text-3xl font-bold text-blue-700 max-w-4xl mx-auto">
              Transform robotic AI text into authentic, human-like content instantly
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <Zap className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg">Bypass AI detectors with a</span>
              <Badge className="bg-yellow-500 text-black font-black px-4 py-2">99.9%</Badge>
              <span className="font-black text-lg">success rate</span>
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Why You'll Love the AI Humanizer</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "DETECT AI CONTENT",
                desc: "Instantly scan any text to check for AI-generated patterns and get a detailed authenticity score before you publish.",
                bg: "bg-purple-500",
                textColor: "text-white",
              },
              {
                icon: Feather,
                title: "HUMANIZE WITH ONE CLICK",
                desc: "Our advanced algorithm rewrites robotic text, infusing it with natural language, authentic tone, and human-like style.",
                bg: "bg-blue-600",
                textColor: "text-white",
              },
              {
                icon: Zap,
                title: "BYPASS AI DETECTORS",
                desc: "Generate content that sails past leading AI detectors, ensuring your work is seen as original and authentic every time.",
                bg: "bg-green-600",
                textColor: "text-white",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className={`${benefit.bg} ${benefit.textColor} p-8 brutal-border hover-lift scroll-scale-in`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <benefit.icon className="w-16 h-16 mb-6" />
                <h3 className="text-2xl font-black mb-4">{benefit.title}</h3>
                <p className="font-bold leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-white mb-6 text-white">See the Humanizer in Action</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="bg-white brutal-border p-8 interactive-demo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-black">Interactive Transformation</h3>
                <div className="bg-gray-100 p-6 brutal-border min-h-[300px]">
                  {demoStep === 0 && (
                    <div className="scroll-fade-in">
                      <p className="font-black text-purple-600 mb-2">Step 1: Original AI Text</p>
                      <p className="font-bold text-gray-700">"The utilization of artificial intelligence has effectuated a paradigm shift in numerous industrial sectors, optimizing operational efficiencies."</p>
                    </div>
                  )}
                  {demoStep === 1 && (
                    <div className="scroll-fade-in">
                      <p className="font-black text-red-600 mb-2">Step 2: AI Detection</p>
                      <p className="font-bold text-gray-700">Scanning text...</p>
                      <div className="mt-4 text-center p-4 bg-red-100 brutal-border">
                        <span className="text-2xl font-black text-red-600">98% AI DETECTED</span>
                      </div>
                    </div>
                  )}
                  {demoStep === 2 && (
                    <div className="scroll-fade-in">
                      <p className="font-black text-blue-600 mb-2">Step 3: Humanizing...</p>
                      <p className="font-bold text-gray-700">"Using AI has completely changed many industries, making them work a lot better."</p>
                    </div>
                  )}
                  {demoStep === 3 && (
                    <div className="scroll-fade-in">
                      <p className="font-black text-green-600 mb-2">Step 4: Final Result</p>
                       <p className="font-bold text-gray-700">"Using AI has completely changed many industries, making them work a lot better."</p>
                      <div className="mt-4 text-center p-4 bg-green-100 brutal-border">
                        <span className="text-2xl font-black text-green-700">99% HUMAN CONTENT</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-purple-500 rounded-full flex items-center justify-center brutal-border mx-auto">
                    <Feather className="w-16 h-16 text-white" />
                  </div>
                  <p className="font-black text-xl text-black">Transform your text in seconds!</p>
                  <Link href="/signup">
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black brutal-button">
                      Try It Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature FAQ Section */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Humanizer FAQs</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="space-y-0">
            {humanizerFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 brutal-border scroll-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  className="w-full p-6 text-left flex items-center justify-between font-black text-lg hover:bg-gray-100 transition-colors text-black"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  {faq.question}
                  <div className={`faq-icon ${openFaq === index ? "open" : ""}`}>
                    {openFaq === index ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  </div>
                </button>
                <div className={`faq-content ${openFaq === index ? "open" : ""}`}>
                  <div className="px-6 pb-6">
                    <p className="font-bold text-gray-700">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Explore Other Features</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div
                  className="bg-white p-6 brutal-border hover-lift hover-scale transition-all cursor-pointer scroll-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-xl font-black mb-2 text-black">{feature.name}</h3>
                  <p className="font-bold text-gray-700">{feature.desc}</p>
                  <ArrowRight className="w-5 h-5 mt-4 text-purple-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

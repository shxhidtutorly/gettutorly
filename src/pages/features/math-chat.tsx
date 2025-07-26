"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, Brain, ArrowRight, Plus, Minus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function MathChatPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [demoStep, setDemoStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const mathChatFaqs = [
    {
      question: "What types of math problems can Math Chat solve?",
      answer:
        "Math Chat can solve algebra, calculus, geometry, statistics, trigonometry, and more. From basic arithmetic to advanced university-level mathematics.",
    },
    {
      question: "Does it show step-by-step solutions?",
      answer:
        "Yes! Math Chat provides detailed step-by-step explanations for every problem, helping you understand the process, not just the answer.",
    },
    {
      question: "Can I upload images of math problems?",
      answer:
        "You can upload photos of handwritten problems, textbook pages, or screenshots, and Math Chat will solve them instantly.",
    },
    {
      question: "Is Math Chat available 24/7?",
      answer: "Yes, Math Chat is available round the clock. Get help with your math homework anytime, anywhere.",
    },
  ]

  const otherFeatures = [
    { name: "AI Notes", href: "/features/ai-notes", desc: "Generate smart notes from any content" },
    { name: "Audio Recap", href: "/features/audio-recap", desc: "Convert lectures to organized notes" },
    { name: "Flashcards", href: "/features/flashcards", desc: "Create adaptive study cards" },
    { name: "Tests & Quizzes", href: "/features/tests-and-quizzes", desc: "Generate practice tests" },
    { name: "Summarizer", href: "/features/summarizer", desc: "Summarize any document" },
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
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "0.5s" }}
              >
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "1s" }}
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>

            <Badge className="bg-purple-500 text-white font-black text-lg px-6 py-3 brutal-border">
              🧮 MATH SOLVER
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black leading-none text-black">Math Chat</h1>

            <p className="text-2xl md:text-3xl font-bold text-gray-700 max-w-4xl mx-auto">
              Solve math problems with AI step-by-step explanations and instant help
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg">This feature increased problem-solving speed by</span>
              <Badge className="bg-yellow-500 text-black font-black px-4 py-2">85%</Badge>
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">How Math Chat Helps You</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Calculator,
                title: "INSTANT SOLUTIONS",
                desc: "Get immediate answers to any math problem with detailed step-by-step explanations that help you understand the process.",
                bg: "bg-purple-500",
                textColor: "text-white",
              },
              {
                icon: Brain,
                title: "LEARN THE PROCESS",
                desc: "Don't just get answers—understand the methodology. Math Chat teaches you how to approach similar problems in the future.",
                bg: "bg-blue-600",
                textColor: "text-white",
              },
              {
                icon: TrendingUp,
                title: "IMPROVE GRADES",
                desc: "Students using Math Chat see an average 85% improvement in problem-solving speed and 92% better test scores.",
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">See Math Chat in Action</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="bg-white brutal-border p-8 interactive-demo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-black">Try a Sample Problem</h3>
                <div className="bg-gray-100 p-6 brutal-border">
                  <p className="font-bold text-lg mb-4">Problem: Solve for x: 2x² + 5x - 3 = 0</p>

                  {demoStep >= 0 && (
                    <div className="mb-4 scroll-fade-in">
                      <p className="font-black text-purple-600">Step 1: Identify the quadratic formula</p>
                      <p className="font-bold">x = (-b ± √(b² - 4ac)) / 2a</p>
                    </div>
                  )}

                  {demoStep >= 1 && (
                    <div className="mb-4 scroll-fade-in">
                      <p className="font-black text-blue-600">Step 2: Substitute values</p>
                      <p className="font-bold">a = 2, b = 5, c = -3</p>
                    </div>
                  )}

                  {demoStep >= 2 && (
                    <div className="scroll-fade-in">
                      <p className="font-black text-green-600">Step 3: Calculate</p>
                      <p className="font-bold">x = (-5 ± √(25 + 24)) / 4 = (-5 ± 7) / 4</p>
                      <p className="font-bold text-lg">x = 0.5 or x = -3</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-purple-500 rounded-full flex items-center justify-center brutal-border mx-auto">
                    <Calculator className="w-16 h-16 text-white" />
                  </div>
                  <p className="font-black text-xl">Math Chat solves this in seconds!</p>
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

      {/* Feature FAQ */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Math Chat FAQs</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="space-y-0">
            {mathChatFaqs.map((faq, index) => (
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

      {/* Other Features */}
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
                  <h3 className="text-xl font-black mb-2">{feature.name}</h3>
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

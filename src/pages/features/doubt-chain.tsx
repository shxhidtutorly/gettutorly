"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, Brain, Link2, TrendingUp, Plus, Minus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import  Navbar  from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function DoubtChainPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const doubtChainFaqs = [
    {
      question: "What is Doubt Chain and how does it work?",
      answer:
        "Doubt Chain breaks down complex concepts into simple, connected steps. It identifies knowledge gaps and builds understanding progressively from basic to advanced concepts.",
    },
    {
      question: "Can I use Doubt Chain for any subject?",
      answer:
        "Yes! Doubt Chain works across all subjects - from mathematics and science to literature and history. It adapts to any topic you're studying.",
    },
    {
      question: "How does it identify my knowledge gaps?",
      answer:
        "Our AI analyzes your questions, study materials, and performance to identify areas where you need more foundational understanding before tackling advanced topics.",
    },
    {
      question: "Can I customize the learning path?",
      answer:
        "You can adjust the pace, skip concepts you already understand, or dive deeper into specific areas that need more attention.",
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

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <Navbar />

      {/* Hero Section */}
      <section className="feature-hero py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-8 scroll-fade-in">
            <div className="flex justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center brutal-border floating">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "0.5s" }}
              >
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "1s" }}
              >
                <Link2 className="w-8 h-8 text-white" />
              </div>
            </div>

            <Badge className="bg-green-600 text-white font-black text-lg px-6 py-3 brutal-border">
              🔗 CONCEPT BREAKDOWN
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black leading-none text-black">Doubt Chain</h1>

            <p className="text-2xl md:text-3xl font-bold text-gray-700 max-w-4xl mx-auto">
              Break down complex concepts into simple, connected steps for better understanding
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg">Students improved comprehension by</span>
              <Badge className="bg-yellow-500 text-black font-black px-4 py-2">95%</Badge>
            </div>

            <Link href="/signup">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">How Doubt Chain Builds Understanding</h2>
            <div className="w-32 h-2 bg-green-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: HelpCircle,
                title: "IDENTIFY GAPS",
                desc: "AI analyzes your questions and identifies fundamental concepts you need to understand before tackling advanced topics.",
                bg: "bg-green-600",
                textColor: "text-white",
              },
              {
                icon: Link2,
                title: "CONNECT CONCEPTS",
                desc: "Creates logical connections between basic and advanced concepts, showing you exactly how ideas build upon each other.",
                bg: "bg-purple-500",
                textColor: "text-white",
              },
              {
                icon: Brain,
                title: "PROGRESSIVE LEARNING",
                desc: "Guides you through a personalized learning path that builds knowledge step-by-step for lasting comprehension.",
                bg: "bg-blue-600",
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

      {/* Feature FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Doubt Chain FAQs</h2>
            <div className="w-32 h-2 bg-green-600 mx-auto"></div>
          </div>

          <div className="space-y-0">
            {doubtChainFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white brutal-border scroll-fade-in"
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
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Explore Other Features</h2>
            <div className="w-32 h-2 bg-green-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div
                  className="bg-gray-50 p-6 brutal-border hover-lift hover-scale transition-all cursor-pointer scroll-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-xl font-black mb-2">{feature.name}</h3>
                  <p className="font-bold text-gray-700 mb-4">{feature.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-purple-600">EXPLORE {feature.name.toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4 text-purple-600" />
                  </div>
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

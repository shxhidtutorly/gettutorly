"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Brain, Zap, TrendingUp, Plus, Minus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import  Navbar  from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function SummariesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const summarizeFaqs = [
    {
      question: "What types of content can I summarize?",
      answer:
        "You can summarize articles, research papers, textbooks, web pages, PDFs, and any text-based content. Just paste the text or upload the file.",
    },
    {
      question: "How long should my content be for summarization?",
      answer:
        "There's no strict limit. Our AI can summarize anything from short articles to lengthy research papers, adjusting the summary length accordingly.",
    },
    {
      question: "Can I control the length of summaries?",
      answer:
        "Yes! You can choose between brief summaries (key points only), detailed summaries, or custom length summaries based on your needs.",
    },
    {
      question: "Does it work with academic papers?",
      answer:
        "Our AI is trained on academic content and can effectively summarize research papers, highlighting methodology, findings, and conclusions.",
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
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center brutal-border floating">
                <FileText className="w-8 h-8 text-white" />
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
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>

            <Badge className="bg-yellow-500 text-black font-black text-lg px-6 py-3 brutal-border">
              📄 TEXT SUMMARIZER
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black leading-none text-black">Summarize</h1>

            <p className="text-2xl md:text-3xl font-bold text-gray-700 max-w-4xl mx-auto">
              Quickly summarize any text, article, or document into key points and insights
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg">Students save</span>
              <Badge className="bg-yellow-500 text-black font-black px-4 py-2">80% reading time</Badge>
            </div>

            <Link href="/signup">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">How Summarize Saves Your Time</h2>
            <div className="w-32 h-2 bg-yellow-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "INSTANT PROCESSING",
                desc: "Upload or paste any text content and get comprehensive summaries in seconds, not hours of reading.",
                bg: "bg-yellow-500",
                textColor: "text-black",
              },
              {
                icon: Brain,
                title: "KEY INSIGHTS",
                desc: "AI identifies the most important points, main arguments, and critical information you need to know.",
                bg: "bg-purple-500",
                textColor: "text-white",
              },
              {
                icon: Zap,
                title: "MULTIPLE FORMATS",
                desc: "Get bullet points, paragraph summaries, or structured outlines - whatever format works best for you.",
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Summarize FAQs</h2>
            <div className="w-32 h-2 bg-yellow-500 mx-auto"></div>
          </div>

          <div className="space-y-0">
            {summarizeFaqs.map((faq, index) => (
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
            <div className="w-32 h-2 bg-yellow-500 mx-auto"></div>
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

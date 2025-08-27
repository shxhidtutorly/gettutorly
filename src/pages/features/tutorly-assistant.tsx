"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MessagesSquare, FileQuestion, ArrowRight, Plus, Minus, User, Bot } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer"

export default function TutorlyAssistantPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [demoStep, setDemoStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 3) // 3 steps: question, thinking, answer
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const faqs = [
    {
      question: "How does the AI understand my documents?",
      answer: "Our assistant uses advanced language models to read, index, and comprehend the content of your uploaded files, allowing it to answer questions based on the specific information within them.",
    },
    {
      question: "Is my data and my documents secure?",
      answer: "Absolutely. We prioritize your privacy. Your documents are encrypted and stored securely, and are never used for training models or shared with third parties.",
    },
    {
      question: "Can I chat with multiple documents at once?",
      answer: "Yes! You can select multiple documents in your library to create a single chat session, allowing the assistant to synthesize information from various sources to give you comprehensive answers.",
    },
    {
      question: "What makes this different from other AI chatbots?",
      answer: "Unlike general-purpose chatbots, Tutorly Assistant's knowledge is grounded in *your* specific study materials. This ensures the answers are highly relevant, accurate, and free from public web noise.",
    },
  ]

  const otherFeatures = [
    { name: "Tutorly Assistant", href: "/features/tutorly-assistant", desc: "Chat with your notes and documents" },
    { name: "Tutor Me", href: "/features/tutor-me", desc: "Your all-in-one AI study dashboard" },
    { name: "AI Content Processor", href: "/features/ai-content-processor", desc: "Scrape websites and YouTube videos" },
    { name: "AI Humanizer", href: "/features/humanizer", desc: "Convert AI text to human-like content" },
    { name: "Math Chat", href: "/features/math-chat", desc: "Solve problems with step-by-step help" },
    { name: "AI Notes", href: "/features/ai-notes", desc: "Generate smart notes from any content" },
  ]

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <Navbar />

      {/* Hero Section */}
      <section className="feature-hero py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-8 scroll-fade-in-up">
            <div className="flex justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center brutal-border floating">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "0.5s" }}
              >
                <MessagesSquare className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "1s" }}
              >
                <FileQuestion className="w-8 h-8 text-white" />
              </div>
            </div>

            <Badge className="bg-blue-500 text-white font-black text-lg px-6 py-3 brutal-border">
              AI ASSISTANT
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black leading-none text-black">Tutorly Assistant</h1>

            <p className="text-2xl md:text-3xl font-bold text-blue-700 max-w-4xl mx-auto">
              Chat with your documents and get instant, accurate answers from your own notes.
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <Sparkles className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg">Understand complex topics</span>
              <Badge className="bg-yellow-500 text-black font-black px-4 py-2">4x Faster</Badge>
            </div>

            <Link href="/signup">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
                🚀 Start Chatting
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Helps Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in-up">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Your Personal Study Expert</h2>
            <div className="w-32 h-2 bg-blue-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FileQuestion,
                title: "CHAT WITH YOUR DOCS",
                desc: "Upload any document and start a conversation. Ask questions, get definitions, and explore topics without leaving your notes.",
                bg: "bg-blue-500",
              },
              {
                icon: MessagesSquare,
                title: "GET INSTANT ANSWERS",
                desc: "No more endless searching. Get immediate, context-aware answers pulled directly from your study materials.",
                bg: "bg-purple-600",
              },
              {
                icon: Sparkles,
                title: "SIMPLIFY COMPLEX IDEAS",
                desc: "Ask the assistant to explain difficult concepts in simple terms, provide examples, or outline key arguments from your texts.",
                bg: "bg-green-600",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className={`${benefit.bg} text-white p-8 brutal-border hover-lift scroll-fade-in-up`}
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
          <div className="text-center mb-16 scroll-fade-in-up">
            <h2 className="text-4xl md:text-6xl font-white mb-6 text-white">See a Conversation in Action</h2>
            <div className="w-32 h-2 bg-blue-500 mx-auto"></div>
          </div>

          <div className="bg-white brutal-border p-8">
            <h3 className="text-2xl font-black mb-4 text-center">Chatting with: `History_of_Rome.pdf`</h3>
            <div className="bg-gray-100 brutal-border p-6 min-h-[300px] flex flex-col space-y-4">
              {/* User Question */}
              {demoStep >= 0 && (
                <div className="flex justify-end chat-bubble-in">
                  <div className="bg-blue-500 text-white font-bold p-3 rounded-lg max-w-sm">
                    Explain the main reasons for the fall of the Roman Republic.
                  </div>
                </div>
              )}
              
              {/* AI Typing or Answer */}
              {demoStep === 1 && (
                 <div className="flex justify-start chat-bubble-in" style={{ animationDelay: '0.5s' }}>
                  <div className="bg-gray-300 p-3 rounded-lg flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-600 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-gray-600 rounded-full typing-dot"></div>
                  </div>
                </div>
              )}
              {demoStep >= 2 && (
                <div className="flex justify-start chat-bubble-in" style={{ animationDelay: '0.5s' }}>
                  <div className="bg-gray-200 text-black font-bold p-3 rounded-lg max-w-sm">
                    According to your document, the main reasons were political instability, economic inequality with vast slave-run estates, and military upheaval led by powerful generals like Caesar.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in-up">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Your Questions, Answered</h2>
            <div className="w-32 h-2 bg-blue-500 mx-auto"></div>
          </div>
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 brutal-border scroll-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
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
                  <div className="px-6 pb-6"><p className="font-bold text-gray-700">{faq.answer}</p></div>
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
            <h2 className="text-4xl md:text-6xl font-white mb-6 text-white">Explore Other Features</h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div
                  className="bg-white p-6 brutal-border hover-lift hover-scale transition-all cursor-pointer scroll-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-xl font-black mb-2">{feature.name}</h3>
                  <p className="font-bold text-black-700 mb-4">{feature.desc}</p>
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

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Brain, Repeat, TrendingUp, Plus, Minus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import  Navbar  from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function FlashcardsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const flashcardsFaqs = [
    {
      question: "How are flashcards automatically generated?",
      answer:
        "Our AI analyzes your study materials and creates flashcards with key concepts, definitions, and questions. You can also create custom cards manually.",
    },
    {
      question: "What makes these flashcards 'smart'?",
      answer:
        "Smart flashcards adapt to your learning progress. Cards you struggle with appear more frequently, while mastered cards appear less often using spaced repetition.",
    },
    {
      question: "Can I share flashcard decks with classmates?",
      answer:
        "Yes! You can share entire decks with classmates, collaborate on deck creation, and access community-created flashcard sets.",
    },
    {
      question: "Do flashcards work offline?",
      answer:
        "Yes, you can download flashcard decks for offline study. Your progress syncs automatically when you're back online.",
    },
  ]

  const sampleCards = [
    { front: "What is photosynthesis?", back: "The process by which plants convert light energy into chemical energy" },
    { front: "Define mitochondria", back: "The powerhouse of the cell - organelles that produce ATP energy" },
    { front: "What is DNA?", back: "Deoxyribonucleic acid - the molecule that carries genetic information" },
  ]

  const otherFeatures = [
    { name: "Math Chat", href: "/features/math-chat", desc: "Solve problems with step-by-step help" },
    { name: "AI Notes", href: "/features/ai-notes", desc: "Generate smart notes from any content" },
    { name: "Audio Recap", href: "/features/audio-recap", desc: "Convert lectures to organized notes" },
    { name: "Tests & Quizzes", href: "/features/tests-and-quizzes", desc: "Generate practice tests" },
    { name: "Summarizer", href: "/features/summarizer", desc: "Summarize any document" },
    { name: "Doubt Chain", href: "/features/doubt-chain", desc: "Break down complex concepts" },
  ]

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 brutal-border flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-black">LOADING FLASHCARDS...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      {/* Hero Section */}
      <section
        className="feature-hero py-20 md:py-32 relative overflow-hidden"
        style={{ minHeight: "500px", padding: "80px 0" }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-8">
            <div className="flex justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center brutal-border floating">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "0.5s" }}
              >
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "1s" }}
              >
                <Repeat className="w-8 h-8 text-white" />
              </div>
            </div>

            <Badge className="bg-orange-500 text-white font-black text-lg px-6 py-3 brutal-border">
              🃏 SMART CARDS
            </Badge>

            <h1
              className="text-5xl md:text-7xl font-black leading-none text-black"
              style={{ color: "#000000", fontWeight: "900", display: "block" }}
            >
              Flashcards
            </h1>

            <p
              className="text-2xl md:text-3xl font-bold text-gray-700 max-w-4xl mx-auto"
              style={{ color: "#374151", fontWeight: "700", display: "block" }}
            >
              Create adaptive flashcards that evolve with your learning progress
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg text-black">Students improved retention by</span>
              <Badge className="bg-yellow-500 text-black font-black px-4 py-2">90%</Badge>
            </div>

            <Link href="/signup">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
                🚀 Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Helps Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-6xl font-black mb-6 text-black"
              style={{ color: "#000000", fontWeight: "900", display: "block" }}
            >
              How Smart Flashcards Boost Memory
            </h2>
            <div className="w-32 h-2 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CreditCard,
                title: "AUTO-GENERATED",
                desc: "AI creates flashcards from your notes, textbooks, and study materials automatically. No manual card creation needed.",
                bg: "bg-orange-500",
                textColor: "text-white",
              },
              {
                icon: Brain,
                title: "ADAPTIVE LEARNING",
                desc: "Cards adapt to your performance. Difficult concepts appear more often, while mastered topics appear less frequently.",
                bg: "bg-purple-500",
                textColor: "text-white",
              },
              {
                icon: Repeat,
                title: "SPACED REPETITION",
                desc: "Uses scientifically-proven spaced repetition algorithms to optimize long-term memory retention and recall.",
                bg: "bg-green-600",
                textColor: "text-white",
              },
            ].map((benefit, index) => (
              <div key={index} className={`${benefit.bg} ${benefit.textColor} p-8 brutal-border hover-lift`}>
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
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-6xl font-black mb-6 text-black"
              style={{ color: "#000000", fontWeight: "900", display: "block" }}
            >
              Try Interactive Flashcards
            </h2>
            <div className="w-32 h-2 bg-orange-500 mx-auto"></div>
          </div>

          <div className="bg-white brutal-border p-8 interactive-demo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-black">Sample Biology Deck</h3>
                <div className="relative">
                  <div
                    className={`w-full h-64 bg-gradient-to-br from-orange-500 to-orange-600 brutal-border cursor-pointer transition-all duration-500 ${
                      isFlipped ? "transform rotateY-180" : ""
                    }`}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div className="p-8 h-full flex items-center justify-center text-center">
                      <div className={`${isFlipped ? "hidden" : "block"}`}>
                        <h4 className="text-2xl font-black text-white mb-4">QUESTION</h4>
                        <p className="text-xl font-bold text-white">{sampleCards[currentCard].front}</p>
                      </div>
                      <div className={`${isFlipped ? "block" : "hidden"}`}>
                        <h4 className="text-2xl font-black text-white mb-4">ANSWER</h4>
                        <p className="text-lg font-bold text-white">{sampleCards[currentCard].back}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-center mt-4 font-bold text-gray-600">
                    Click card to flip • {currentCard + 1} of {sampleCards.length}
                  </p>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => {
                      setCurrentCard((prev) => (prev > 0 ? prev - 1 : sampleCards.length - 1))
                      setIsFlipped(false)
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-black brutal-button"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentCard((prev) => (prev + 1) % sampleCards.length)
                      setIsFlipped(false)
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black brutal-button"
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center brutal-border mx-auto">
                    <CreditCard className="w-16 h-16 text-white" />
                  </div>
                  <p className="font-black text-xl text-black">Master any subject with smart flashcards!</p>
                  <Link href="/signup">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white font-black brutal-button">
                      Create Your Deck
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
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-6xl font-black mb-6 text-black"
              style={{ color: "#000000", fontWeight: "900", display: "block" }}
            >
              Flashcards FAQs
            </h2>
            <div className="w-32 h-2 bg-orange-500 mx-auto"></div>
          </div>

          <div className="space-y-0">
            {flashcardsFaqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 brutal-border">
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
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-6xl font-black mb-6 text-black"
              style={{ color: "#000000", fontWeight: "900", display: "block" }}
            >
              Explore Other Features
            </h2>
            <div className="w-32 h-2 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div className="bg-white p-6 brutal-border hover-lift hover-scale transition-all cursor-pointer">
                  <h3 className="text-xl font-black mb-2 text-black">{feature.name}</h3>
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

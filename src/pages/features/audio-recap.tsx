"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Headphones, Brain, Mic, FileText, Plus, Minus, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import  Navbar  from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AudioRecapPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const audioRecapFaqs = [
    {
      question: "What audio formats does Audio Recap support?",
      answer:
        "Audio Recap supports MP3, WAV, M4A, and most common audio formats. You can also upload video files and we'll extract the audio automatically.",
    },
    {
      question: "How long can my audio recordings be?",
      answer:
        "You can upload audio files up to 3 hours long. For longer recordings, we recommend breaking them into smaller segments for better processing.",
    },
    {
      question: "Does it work with different accents and languages?",
      answer:
        "Yes! Our AI is trained on diverse speech patterns and supports multiple languages and accents for accurate transcription and note generation.",
    },
    {
      question: "Can I edit the generated notes from audio?",
      answer:
        "All generated notes are fully editable. You can add your own insights, correct any transcription errors, and format as needed.",
    },
  ]

  const otherFeatures = [
    { name: "Math Chat", href: "/features/math-chat", desc: "Solve problems with step-by-step help" },
    { name: "AI Notes", href: "/features/ai-notes", desc: "Generate smart notes from any content" },
    { name: "Flashcards", href: "/features/flashcards", desc: "Create adaptive study cards" },
    { name: "Tests & Quizzes", href: "/features/tests-and-quizzes", desc: "Generate practice tests" },
    { name: "Summarizer", href: "/features/summarizer", desc: "Summarize any document" },
    { name: "Doubt Chain", href: "/features/doubt-chain", desc: "Break down complex concepts" },
  ]

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 brutal-border flex items-center justify-center mx-auto mb-4">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-black">LOADING AUDIO RECAP...</h1>
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
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center brutal-border floating">
                <Headphones className="w-8 h-8 text-white" />
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
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>

            <Badge className="bg-blue-600 text-white font-black text-lg px-6 py-3 brutal-border">
              🎧 AUDIO PROCESSOR
            </Badge>

            <h1
              className="text-5xl md:text-7xl font-black leading-none text-black"
              style={{ color: "#000000", fontWeight: "900", display: "block" }}
            >
              Audio Recap
            </h1>

            <p
              className="text-2xl md:text-3xl font-bold text-gray-700 max-w-4xl mx-auto"
              style={{ color: "#374151", fontWeight: "700", display: "block" }}
            >
              Convert lectures and audio recordings into organized notes automatically
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg text-black">This feature saved students</span>
              <Badge className="bg-yellow-500 text-black font-black px-4 py-2">60% study time</Badge>
            </div>

            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
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
              How Audio Recap Transforms Your Learning
            </h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Mic,
                title: "RECORD OR UPLOAD",
                desc: "Record live lectures, upload audio files, or even extract audio from video recordings. Our AI processes any audio content.",
                bg: "bg-blue-600",
                textColor: "text-white",
              },
              {
                icon: Brain,
                title: "AI TRANSCRIPTION",
                desc: "Advanced AI transcribes your audio with high accuracy, identifying key concepts, speakers, and important information automatically.",
                bg: "bg-purple-500",
                textColor: "text-white",
              },
              {
                icon: FileText,
                title: "STRUCTURED NOTES",
                desc: "Get perfectly organized notes with headings, bullet points, and key takeaways. Export or continue editing in our platform.",
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
              See Audio Recap in Action
            </h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
          </div>

          <div className="bg-white brutal-border p-8 interactive-demo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-black">Audio Demo</h3>
                <div className="bg-gray-100 p-8 text-center brutal-border">
                  <button
                    className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${
                      isRecording ? "bg-red-500 animate-pulse" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    <Mic className="w-12 h-12 text-white" />
                  </button>
                  <p className="font-black text-lg text-black">
                    {isRecording ? "Recording..." : "Click to simulate recording"}
                  </p>
                  <p className="font-bold text-gray-600">Upload MP3, WAV, M4A, or record live</p>
                </div>

                {isRecording && (
                  <div className="bg-green-50 p-6 brutal-border">
                    <h4 className="font-black text-green-800 mb-2">🎯 Processing Audio...</h4>
                    <p className="font-bold text-green-700">
                      Converting your 45-minute chemistry lecture into organized notes:
                    </p>
                    <ul className="list-disc list-inside mt-2 font-bold text-green-700">
                      <li>Chemical Bonding Concepts</li>
                      <li>Molecular Structure Examples</li>
                      <li>Key Formulas & Equations</li>
                      <li>Professor's Important Points</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center brutal-border mx-auto">
                    <Headphones className="w-16 h-16 text-white" />
                  </div>
                  <p className="font-black text-xl text-black">Never miss important lecture content again!</p>
                  <Link href="/signup">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black brutal-button">
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
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-6xl font-black mb-6 text-black"
              style={{ color: "#000000", fontWeight: "900", display: "block" }}
            >
              Audio Recap FAQs
            </h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
          </div>

          <div className="space-y-0">
            {audioRecapFaqs.map((faq, index) => (
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
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
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

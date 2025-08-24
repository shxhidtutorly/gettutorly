"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Headphones, Brain, Mic, FileText, Plus, Minus, TrendingUp, ArrowRight, Upload } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function AudioRecapPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [uploadDemo, setUploadDemo] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const benefits = [
    {
      title: "Effortless Note-Taking",
      desc: "Automatically convert any audio into structured, editable notes so you never have to scramble to write things down again.",
      icon: FileText,
    },
    {
      title: "Enhanced Retention",
      desc: "Revisit lectures and discussions by reading key takeaways and summaries instead of re-listening to long recordings.",
      icon: Brain,
    },
    {
      title: "Time Saver",
      desc: "Save hours of manual transcription and note organization, letting you focus on studying and understanding the material.",
      icon: TrendingUp,
    },
  ]

  const audioRecapFaqs = [
    {
      question: "What audio formats does Audio Recap support?",
      answer:
        "Audio Recap supports MP3, WAV, M4A, and most common audio formats. You can also upload video files, and we'll extract the audio automatically.",
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
    { name: "Flashcards", href: "/features/flashcard", desc: "Create adaptive study cards" },
    { name: "Tests & Quizzes", href: "/features/tests-quiz", desc: "Generate practice tests" },
    { name: "Summarizer", href: "/features/summaries", desc: "Summarize any document" },
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
    <div className="min-h-screen bg-white text-black font-mono selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="feature-hero py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-8 scroll-fade-in">
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

          <h1 className="text-5xl md:text-7xl font-black leading-none text-black">
            Audio Recap
          </h1>

          <p className="text-2xl md:text-3xl font-bold text-black max-w-4xl mx-auto">
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
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">How It Transforms Your Learning</h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 brutal-border hover-scale transition-all scroll-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black">{benefit.title}</h3>
                </div>
                <p className="font-bold text-black-700">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">
              See Audio Recap in Action
            </h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
          </div>

          <div className="bg-white brutal-border p-8 interactive-demo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left side: Upload/Record UI */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-black">
                  Record Live or Upload Audio
                </h3>
                <p className="font-bold text-gray-700">
                  Click the button to simulate recording or upload your own file to see the power of our AI.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => setUploadDemo(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black brutal-button"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Simulate Upload
                  </Button>
                  <Button
                    onClick={() => setUploadDemo(false)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black brutal-button"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Simulate Recording
                  </Button>
                </div>
              </div>

              {/* Right side: Interactive output */}
              <div className="bg-gray-100 p-8 brutal-border text-center">
                <div className="text-left font-black text-lg mb-4 text-black">
                  {uploadDemo ? "Uploaded Lecture" : "Live Recording"}
                </div>
                {uploadDemo ? (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center mx-auto animate-pulse brutal-border">
                      <FileText className="w-12 h-12 text-white" />
                    </div>
                    <p className="font-black text-lg text-black">
                      Analyzing and structuring your notes...
                    </p>
                    <ul className="text-left list-disc list-inside font-bold text-gray-700">
                      <li>Identifying key terms</li>
                      <li>Creating topic summaries</li>
                      <li>Organizing into sections</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse brutal-border">
                      <Mic className="w-12 h-12 text-white" />
                    </div>
                    <p className="font-black text-lg text-black">
                      Listening and transcribing...
                    </p>
                    <p className="font-bold text-gray-700">
                      Processing live audio to capture every important detail.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature FAQ */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">
              Audio Recap FAQs
            </h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
          </div>

          <div className="space-y-4">
            {audioRecapFaqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 p-6 brutal-border">
                <button
                  className="w-full text-left flex items-center justify-between font-black text-lg hover:text-blue-600 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  {faq.question}
                  {openFaq === index ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">
              Explore Other Features
            </h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div
                  className="bg-gray-50 p-6 brutal-border hover-lift hover-scale transition-all cursor-pointer scroll-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-xl font-black mb-2 text-black">{feature.name}</h3>
                  <p className="font-bold text-black-700 mb-4">{feature.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-blue-600">EXPLORE {feature.name.toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
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
            Ready to Streamline Your Studies?
          </h2>
          <div className="w-32 h-2 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-xl font-bold text-gray-300 mb-8">
            Start saving time and improving your notes instantly with Audio Recap.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
                START LEARNING FREE
              </Button>
            </Link>
            <Link href="/features">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
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

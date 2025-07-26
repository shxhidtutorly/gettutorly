"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Brain, Upload, Download, Plus, Minus, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import  Navbar  from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AINotesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [uploadDemo, setUploadDemo] = useState(false)

  const aiNotesFaqs = [
    {
      question: "What file formats can I upload for AI Notes?",
      answer:
        "AI Notes supports PDFs, DOCX, PowerPoint presentations, images, and even audio/video files. Upload any study material and get organized notes instantly.",
    },
    {
      question: "How accurate are the AI-generated notes?",
      answer:
        "Our AI is trained on educational content and provides 95%+ accuracy. However, we always recommend reviewing important information for your specific needs.",
    },
    {
      question: "Can I edit the generated notes?",
      answer:
        "Yes! All AI-generated notes are fully editable. You can add your own insights, highlight important sections, and customize the format.",
    },
    {
      question: "How long does it take to generate notes?",
      answer:
        "Most notes are generated within 30-60 seconds, depending on the length and complexity of your source material.",
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
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center brutal-border floating">
                <FileText className="w-8 h-8 text-white" />
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
                <Download className="w-8 h-8 text-white" />
              </div>
            </div>

            <Badge className="bg-blue-600 text-white font-black text-lg px-6 py-3 brutal-border">
              📝 NOTE GENERATOR
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black leading-none text-black">AI Notes</h1>

            <p className="text-2xl md:text-3xl font-bold text-gray-700 max-w-4xl mx-auto">
              Create AI generated notes from PDFs, PowerPoints, and lecture videos, automatically!
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg">This feature increased study productivity by</span>
              <Badge className="bg-yellow-500 text-black font-black px-4 py-2">75%</Badge>
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
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">How AI Notes Transforms Your Study</h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "UPLOAD ANYTHING",
                desc: "Upload PDFs, PowerPoints, lecture videos, or even handwritten notes. Our AI processes any format and extracts key information.",
                bg: "bg-blue-600",
                textColor: "text-white",
              },
              {
                icon: Brain,
                title: "AI PROCESSING",
                desc: "Advanced AI analyzes your content, identifies key concepts, and organizes information into structured, easy-to-read notes.",
                bg: "bg-purple-500",
                textColor: "text-white",
              },
              {
                icon: Download,
                title: "INSTANT NOTES",
                desc: "Get perfectly formatted notes in seconds. Export to PDF, share with classmates, or continue editing in our platform.",
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">See AI Notes in Action</h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
          </div>

          <div className="bg-white brutal-border p-8 interactive-demo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-black">Upload Demo</h3>
                <div
                  className={`border-4 border-dashed border-gray-300 p-8 text-center transition-all cursor-pointer hover:border-blue-600 ${uploadDemo ? "bg-blue-50 border-blue-600" : ""}`}
                  onClick={() => setUploadDemo(!uploadDemo)}
                >
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="font-black text-lg">Click to simulate upload</p>
                  <p className="font-bold text-gray-600">PDF, DOCX, PPT, Images, Videos</p>
                </div>

                {uploadDemo && (
                  <div className="bg-green-50 p-6 brutal-border scroll-fade-in">
                    <h4 className="font-black text-green-800 mb-2">✅ Processing Complete!</h4>
                    <p className="font-bold text-green-700">
                      Your 45-page biology textbook has been converted into organized notes covering:
                    </p>
                    <ul className="list-disc list-inside mt-2 font-bold text-green-700">
                      <li>Cell Structure & Function</li>
                      <li>Photosynthesis Process</li>
                      <li>DNA Replication</li>
                      <li>Key Vocabulary & Definitions</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center brutal-border mx-auto">
                    <FileText className="w-16 h-16 text-white" />
                  </div>
                  <p className="font-black text-xl">Transform any content into perfect notes!</p>
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
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">AI Notes FAQs</h2>
            <div className="w-32 h-2 bg-blue-600 mx-auto"></div>
          </div>

          <div className="space-y-0">
            {aiNotesFaqs.map((faq, index) => (
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

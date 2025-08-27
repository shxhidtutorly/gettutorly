"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Workflow, Youtube, Globe, ArrowRight, Plus, Minus, Loader } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer"

export default function AiContentProcessorPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [demoStep, setDemoStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 3) // 3 steps: input, processing, result
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const faqs = [
    {
      question: "Which websites are supported for scraping?",
      answer: "Our tool works with most static websites, blogs, and news articles. It's designed to extract the main body of content while filtering out ads, headers, and footers.",
    },
    {
      question: "Is it legal to scrape websites and get YouTube transcripts?",
      answer: "Our tool is designed for personal and educational use, which generally falls under fair use. We encourage users to respect copyright and the terms of service of the source websites.",
    },
    {
      question: "How accurate are the YouTube transcripts?",
      answer: "The accuracy is very high, especially for videos with clear audio. We use state-of-the-art speech-to-text technology to provide the best possible transcripts.",
    },
    {
      question: "What can I do with the extracted content?",
      answer: "Once processed, you can directly import the text into 'Tutor Me' to create notes, summaries, flashcards, or start a conversation with it using the 'Tutorly Assistant'.",
    },
  ]

  const otherFeatures = [
    { name: "AI Content Processor", href: "/features/ai-content-processor", desc: "Scrape websites and YouTube videos" },
    { name: "Tutor Me", href: "/features/tutor-me", desc: "Your all-in-one AI study dashboard" },
    { name: "Tutorly Assistant", href: "/features/tutorly-assistant", desc: "Chat with your notes and documents" },
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
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center brutal-border floating">
                <Workflow className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "0.5s" }}
              >
                <Youtube className="w-8 h-8 text-white" />
              </div>
              <div
                className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center brutal-border floating"
                style={{ animationDelay: "1s" }}
              >
                <Globe className="w-8 h-8 text-white" />
              </div>
            </div>

            <Badge className="bg-green-500 text-white font-black text-lg px-6 py-3 brutal-border">
              CONTENT EXTRACTOR
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black leading-none text-black">AI Content Processor</h1>

            <p className="text-2xl md:text-3xl font-bold text-green-700 max-w-4xl mx-auto">
              Get YouTube transcripts and scrape any website with just a URL.
            </p>

            <div className="flex items-center justify-center space-x-4 bg-yellow-100 px-6 py-3 rounded-full brutal-border">
              <Workflow className="w-6 h-6 text-green-600" />
              <span className="font-black text-lg">Save 10+ hours of manual work</span>
              <Badge className="bg-yellow-500 text-black font-black px-4 py-2">WEEKLY</Badge>
            </div>

            <Link href="/signup">
              <Button className="bg-green-500 hover:bg-green-600 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
                🚀 Start Processing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Helps Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in-up">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Turn the Web Into Study Material</h2>
            <div className="w-32 h-2 bg-green-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Youtube,
                title: "YOUTUBE TRANSCRIPTS",
                desc: "Paste any YouTube video link to get a full, timestamped transcript in seconds. Perfect for lectures and educational content.",
                bg: "bg-red-600",
              },
              {
                icon: Globe,
                title: "WEBSITE SCRAPING",
                desc: "Enter a URL to pull clean, readable text from articles and web pages, stripping away all the clutter.",
                bg: "bg-sky-500",
              },
              {
                icon: Workflow,
                title: "ACTIONABLE OUTPUTS",
                desc: "The extracted text isn't just for reading. Seamlessly convert it into notes, summaries, and quizzes with our other tools.",
                bg: "bg-green-500",
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
            <h2 className="text-4xl md:text-6xl font-white mb-6 text-white">See it Process a URL</h2>
            <div className="w-32 h-2 bg-green-500 mx-auto"></div>
          </div>

          <div className="bg-white brutal-border p-8">
             <div className="bg-gray-100 brutal-border p-4 mb-6">
                <p className="font-bold text-gray-500 truncate">URL: https://www.youtube.com/watch?v=some-lecture-video</p>
             </div>
             <div className="bg-gray-100 brutal-border p-6 min-h-[300px]">
                {demoStep < 2 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Loader className="w-16 h-16 text-green-500 animate-spin-slow mb-4" />
                        <p className="text-2xl font-black text-green-600">
                            {demoStep === 0 ? "Connecting..." : "Extracting Content..."}
                        </p>
                    </div>
                )}
                {demoStep === 2 && (
                    <div className="scroll-fade-in-up">
                        <h4 className="font-black text-green-600 mb-2">Transcript Result:</h4>
                        <p className="font-bold text-gray-700 text-sm">
                            [00:01] Hello everyone, and welcome back to our series on cellular biology.
                            [00:05] Today, we're diving deep into the mitochondria, often called the powerhouse of the cell...
                            [00:12] As you can see in this diagram, the inner membrane is folded into cristae, which increases the surface area for ATP synthesis...
                        </p>
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Processor FAQs</h2>
            <div className="w-32 h-2 bg-green-500 mx-auto"></div>
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

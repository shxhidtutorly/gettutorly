"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  MessageSquare,
  FileText,
  Headphones,
  HelpCircle,
  Check,
  ArrowRight,
  Plus,
  Minus,
  Star,
  BookOpen,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Navbar from "@/components/navbar" // Ensure this import matches your file name and export
import { Footer } from "@/components/footer"

export default function TutorlyLanding() {
  const [stickyNav, setStickyNav] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [counters, setCounters] = useState({ students: 0, countries: 0, institutions: 0 })
  const titles = ["Smart", "Next-Gen", "AI-Powered", "Effortless", "Trusted", "Supercharged"]
  const [titleNumber, setTitleNumber] = useState(0)
  const [heroLoaded, setHeroLoaded] = useState(false)

  useEffect(() => {
    // Immediate hero load with fade-in animation
    setHeroLoaded(true)

    const interval = setInterval(() => {
      setTitleNumber((n) => (n + 1) % titles.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setStickyNav(window.scrollY > 100)

      // Scroll-triggered animations
      const elements = document.querySelectorAll(
        ".scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in",
      )
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top
        const elementVisible = 150

        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add("visible")
        }
      })
    }

    const animateCounters = () => {
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      let step = 0
      const timer = setInterval(() => {
        step++
        const progress = step / steps

        setCounters({
          students: Math.floor(500 * progress),
          countries: Math.floor(128 * progress),
          institutions: Math.floor(200 * progress),
        })

        if (step >= steps) {
          clearInterval(timer)
          setCounters({ students: 500, countries: 128, institutions: 200 })
        }
      }, stepDuration)
    }

    window.addEventListener("scroll", handleScroll)
    setTimeout(animateCounters, 500)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const faqData = [
    {
      question: "What can Tutorly help me with?",
      answer:
        "Tutorly helps with math problems, note-taking, creating flashcards, generating quizzes, summarizing content, audio transcription, and providing personalized study assistance across all subjects.",
    },
    {
      question: "Are the notes accurate?",
      answer:
        "Yes! Our AI is trained on educational content and provides highly accurate notes. However, we always recommend reviewing and verifying important information.",
    },
    {
      question: "Can I upload PDF/DOCX?",
      answer:
        "You can upload PDFs, DOCX files, images, and even audio recordings. Tutorly will process them and help you create study materials.",
    },
    {
      question: "Is Tutorly free?",
      answer:
        "We offer a basic plan starting at $9/month with essential features. For unlimited access and advanced features, check out our Pro and Team plans.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use enterprise-grade encryption and security measures. Your data is never shared with third parties and is stored securely.",
    },
    {
      question: "Does it work on mobile?",
      answer: "Yes! Tutorly works perfectly on mobile devices, tablets, and desktops. Study anywhere, anytime.",
    },
    {
      question: "What is Doubt Chain?",
      answer:
        "Doubt Chain breaks down complex concepts into simple, connected steps, helping you understand difficult topics by building knowledge progressively.",
    },
    {
      question: "How are quizzes created?",
      answer:
        "Our AI analyzes your study materials and automatically generates relevant questions, multiple choice options, and explanations based on the content.",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <Navbar />

      {/* Sticky Navigation - If you're using the Navbar component, this sticky nav might be redundant.
          I'll keep it as per your code, but usually, the main Navbar handles stickiness.
          FIX 1: Ensure text color is black.
      */}
      <nav className={`nav-sticky ${stickyNav ? "visible" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-500 brutal-border flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-black">TUTORLY</span>
            </Link>
            <div className="flex items-center space-x-6">
              <a href="#hero" className="font-black hover:text-purple-500 transition-colors text-sm text-black">
                HOME
              </a>
              {/* FIX 2: FEATURES link in sticky nav is also black */}
              <Link href="/features" className="font-black hover:text-purple-500 transition-colors text-sm text-black">
                FEATURES
              </Link>
              <a href="#pricing" className="font-black hover:text-purple-500 transition-colors text-sm text-black">
                PRICING
              </a>
              <a href="#faq" className="font-black hover:text-purple-500 transition-colors text-sm text-black">
                FAQ
              </a>
              <Link href="/study-techniques" className="font-black hover:text-purple-500 transition-colors text-sm text-black">
                STUDY METHODS
              </Link>
              <Link href="/support" className="font-black hover:text-purple-500 transition-colors text-sm text-black">
                SUPPORT
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white font-black brutal-button">
                  TRY FOR FREE
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Immediate render with fade-in */}
      <section
        id="hero"
        className={`bg-white py-20 md:py-32 relative transition-opacity duration-1000 ${
          heroLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="floating">
                <Badge className="bg-purple-500 text-white font-black text-lg px-6 py-3 brutal-border">
                  🧠 AI-POWERED LEARNING
                </Badge>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none text-black">
                MEET YOUR
                <br />
                <span className="text-purple-500">{titles[titleNumber]}</span>
                <br />
                AI TUTOR
              </h1>
              <div className="max-w-4xl mx-auto">
                <p className="text-xl md:text-2xl font-bold text-black leading-tight">
                  Transform how you learn — generate notes, flashcards, quizzes, math solutions, summaries, audio
                  recaps, and insights with Tutorly's all-in-one AI.
                </p>
              </div>
            </div>

            {/* Centered Single Button */}
            <div className="flex justify-center">
              <Link href="/signup">
                <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
                  START LEARNING FREE
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-3xl mx-auto mt-16">
              <div className="bg-gray-800 text-white p-8 brutal-border count-animation">
                <div className="text-4xl font-black">{counters.students}K+</div>
                <div className="text-lg font-bold">STUDENTS</div>
              </div>
              <div
                className="bg-purple-500 text-white p-8 brutal-border count-animation"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="text-4xl font-black">{counters.countries}+</div>
                <div className="text-lg font-bold">COUNTRIES</div>
              </div>
              <div
                className="bg-blue-600 text-white p-8 brutal-border count-animation"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="text-4xl font-black">{counters.institutions}+</div>
                <div className="text-lg font-bold">INSTITUTIONS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Preview */}
      <section className="bg-gray-50 py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            {/* FIX 3: Text color for "Everything You Need to Excel" - already black on light background */}
            <h2 className="text-4xl md:text-6xl font-white mb-6 text-white">Everything You Need to Excel</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto mb-6"></div>
            <p className="text-xl font-bold text-gray-700 max-w-3xl mx-auto">
              Powerful AI tools designed for modern learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: FileText,
                title: "AI NOTES",
                desc: "Smart note generation from any content",
                bg: "bg-white",
                textColor: "text-black", // Already black, good for light background
                href: "/features/ai-notes",
              },
              {
                icon: MessageSquare,
                title: "MATH CHAT",
                desc: "Solve problems with step-by-step help",
                bg: "bg-purple-500",
                textColor: "text-white", // Already white, good for purple background
                href: "/features/math-chat",
              },
              {
                icon: Headphones,
                title: "AUDIO RECAP",
                desc: "Convert lectures to organized notes",
                bg: "bg-blue-600",
                textColor: "text-white", // Already white, good for blue background
                href: "/features/audio-recap",
              },
              {
                icon: HelpCircle,
                title: "DOUBT CHAIN",
                desc: "Break down complex concepts easily",
                bg: "bg-green-600",
                textColor: "text-white", // Already white, good for green background
                href: "/features/doubt-chain",
              },
              {
                icon: CreditCard,
                title: "SMART FLASHCARDS",
                desc: "Adaptive cards that evolve with you",
                bg: "bg-orange-500",
                textColor: "text-white", // Already white, good for orange background
                href: "/features/flashcards",
              },
              {
                icon: BookOpen,
                title: "INSTANT QUIZZES",
                desc: "Auto-generate tests from materials",
                bg: "bg-red-500",
                textColor: "text-white", // Already white, good for red background
                href: "/features/tests-quiz",
              },
            ].map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div
                  className={`${feature.bg} ${feature.textColor} p-8 brutal-border hover-scale hover-lift transition-all cursor-pointer scroll-scale-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <feature.icon className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-black mb-2">{feature.title}</h3>
                  <p className="font-bold text-sm mb-4">{feature.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm">EXPLORE {feature.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center scroll-fade-in">
            <Link href="/features">
              <Button className="bg-gray-800 text-white font-black text-lg px-8 py-4 brutal-button hover:bg-gray-700">
                SEE ALL FEATURES
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

     {/* Trusted By Universities Section */}
<section className="bg-white py-20 overflow-hidden">
  <div className="max-w-7xl mx-auto px-4">
    <div className="text-center mb-16 scroll-fade-in">
      <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">
        Loved by students from top global universities
      </h2>
      <div className="w-32 h-2 bg-purple-500 mx-auto mb-8"></div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {[
        {
          name: "MIT",
          logo:
            "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/mit-logo.webp",
        },
        {
          name: "Stanford University",
          logo:
            "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/standford-logo%20(1).webp",
        },
        {
          name: "University of Pennsylvania",
          logo:
            "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/penn-uop-logo.webp",
        },
        {
          name: "Yale University",
          logo:
            "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/yu-logo.webp",
        },
        {
          name: "University of Cambridge (UOC)",
          logo:
            "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/uoc-logo.webp",
        },
        {
          name: "Tokyo University of Medicine",
          logo:
            "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/tuom-logo.webp",
        },
        {
          name: "University of Toronto",
          logo:
            "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/tos-uni-logo%20(1).svg",
        },
        {
          name: "Harvard University",
          logo:
            "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Harvard-University-Logo.png",
        },
      ].map((university, index) => (
        <div
          key={index}
          className="flex items-center justify-center p-6 bg-white brutal-border hover-scale hover-lift transition-all duration-300 scroll-slide-left"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <img
            src={university.logo}
            alt={university.name}
            className="h-16 w-auto object-contain transition-all duration-300 hover:scale-110"
          />
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Enhanced Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            {/* FIX 4: Text color for "Trusted by Students Worldwide" - already black on light background */}
            <h2 className="text-4xl md:text-6xl font-white mb-6 text-white">Trusted by Students Worldwide</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Alice Chen",
                role: "Computer Science Student",
                quote: "Feels like a real tutor 24/7",
                avatar: "A",
                bg: "bg-white",
                textColor: "text-black",
              },
              {
                name: "Bob Martinez",
                role: "Engineering Student",
                quote: "AI summaries saved me hours",
                avatar: "B",
                bg: "bg-purple-500",
                textColor: "text-white",
              },
              {
                name: "Charlie Kim",
                role: "Pre-Med Student",
                quote: "Flashcards helped me retain better",
                avatar: "C",
                bg: "bg-blue-600",
                textColor: "text-white",
              },
              {
                name: "Diana Patel",
                role: "Business Student",
                quote: "Turns lectures into notes instantly",
                avatar: "D",
                bg: "bg-green-600",
                textColor: "text-white",
              },
              {
                name: "Eve Johnson",
                role: "Psychology Student",
                quote: "Audio recaps saved my study time",
                avatar: "E",
                bg: "bg-orange-500",
                textColor: "text-white",
              },
              {
                name: "Frank Wilson",
                role: "Math Student",
                quote: "Math explanations are super clear",
                avatar: "F",
                bg: "bg-red-500",
                textColor: "text-white",
              },
              {
                name: "Grace Liu",
                role: "Biology Student",
                quote: "Everything is organized in one place",
                avatar: "G",
                bg: "bg-indigo-600",
                textColor: "text-white",
              },
              {
                name: "Henry Davis",
                role: "Physics Student",
                quote: "Love the personalized help!",
                avatar: "H",
                bg: "bg-pink-500",
                textColor: "text-white",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className={`${testimonial.bg} ${testimonial.textColor} p-6 brutal-border hover-scale hover-lift scroll-slide-right`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-purple-500 text-white brutal-border flex items-center justify-center font-black text-xl mr-4 rounded-full">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-black text-base">{testimonial.name}</div>
                    <div className="font-bold text-xs opacity-75">{testimonial.role}</div>
                  </div>
                </div>
                <p className="font-bold mb-3 text-sm">"{testimonial.quote}"</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fixed Pricing Section */}
      <section id="pricing" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Made Simple. Just Like It Should Be</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {[
              {
                name: "BASIC",
                desc: "Essential tools to get started",
                price: "$9",
                features: ["Basic AI Chat", "10 Notes/Month", "20 Flashcards", "Community Support"],
                notIncluded: ["Unlimited Usage", "Priority Support", "Advanced Features"],
                bg: "bg-white text-black",
                cta: "TRY FREE",
              },
              {
                name: "PRO",
                desc: "Full features + unlimited usage",
                price: "$19",
                features: [
                  "Unlimited Everything",
                  "Priority Support",
                  "Advanced Analytics",
                  "Export Options",
                  "Audio Recap",
                  "Math Solver",
                ],
                notIncluded: [],
                bg: "bg-purple-500 text-white", // Card background is purple, text is white
                popular: true,
                cta: "TRY FREE",
              },
              {
                name: "TEAM",
                desc: "For groups/institutions",
                price: "$49",
                features: ["Everything in Pro", "Team Management", "Bulk Import", "Admin Dashboard", "Custom Branding"],
                notIncluded: [],
                bg: "bg-blue-600 text-white", // Card background is blue, text is white
                cta: "TRY FREE",
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`${plan.bg} p-8 brutal-border relative pricing-flash hover-scale hover-lift h-full flex flex-col scroll-scale-in`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {plan.popular && (
                  // FIX: Popular tag alignment
                  
                )}
                {/* Added pt-8 to push content down for popular tag, creating space */}
                <div className="text-center mb-6 pt-8">
                  <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                  <p className="font-bold mb-4 text-base">{plan.desc}</p>
                  <div className="text-5xl font-black">{plan.price}</div>
                  <div className="text-base font-bold">/month</div>
                </div>
                <div className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <Check className="w-5 h-5 mr-3 flex-shrink-0 text-green-400" />
                      <span className="font-bold text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, idx) => (
                    <div key={idx} className="flex items-center opacity-50">
                      <div className="w-5 h-5 mr-3 flex-shrink-0 text-red-400 font-black">✕</div>
                      <span className="font-bold line-through text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" className="block"> {/* Added block to Link for full width */}
                  {/* FIX: Pricing Plan "TRY FREE" button visibility - all buttons now match BASIC plan's style */}
                  <Button
                    className={`w-full font-black py-4 brutal-button mt-auto bg-purple-500 text-white hover:bg-purple-600`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">FAQs</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="space-y-0">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 brutal-border scroll-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  className="w-full p-6 text-left flex items-center justify-between font-black text-lg text-black transition-colors" // FIX 6: Removed hover:bg-gray-100
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

      {/* Final CTA */}
      <section className="bg-gray-800 text-white py-20 relative">
        <div className="max-w-4xl mx-auto px-4 text-center scroll-fade-in">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">🚀 READY TO EXCEL?</h2>
          <p className="text-xl font-bold mb-8 text-gray-300">
            Join 500K+ students who are already learning smarter with Tutorly.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
                START LEARNING FREE
              </Button>
            </Link>
            <Button
              variant="outline"
              className="bg-transparent border-white text-white font-black text-xl px-12 py-6 brutal-button hover:bg-white hover:text-black"
            >
              CONTACT SALES
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

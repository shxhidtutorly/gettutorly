"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import  Navbar  from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PricingPage() {
  const [counters, setCounters] = useState({ students: 0, countries: 0, institutions: 0 })

  useEffect(() => {
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

    setTimeout(animateCounters, 500)
  }, [])

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-white py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center space-y-8 scroll-fade-in">
            <div className="space-y-6">
              <div className="floating">
                <Badge className="bg-purple-500 text-white font-black text-lg px-6 py-3 brutal-border">
                  💰 SIMPLE PRICING
                </Badge>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none text-black">
                CHOOSE YOUR
                <br />
                <span className="text-purple-500">PLAN</span>
              </h1>
              <div className="max-w-4xl mx-auto">
                <p className="text-xl md:text-2xl font-bold text-black leading-tight">
                  Start learning smarter today with our flexible pricing options designed for every student's needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-20">
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
                bg: "bg-purple-500 text-white",
                popular: true,
                cta: "TRY FREE",
              },
              {
                name: "TEAM",
                desc: "For groups/institutions",
                price: "$49",
                features: ["Everything in Pro", "Team Management", "Bulk Import", "Admin Dashboard", "Custom Branding"],
                notIncluded: [],
                bg: "bg-blue-600 text-white",
                cta: "TRY FREE",
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`${plan.bg} p-8 brutal-border relative pricing-flash hover-scale hover-lift h-full flex flex-col scroll-scale-in`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className="bg-gray-800 text-white font-black px-6 py-2 brutal-border text-sm">
                      🔥 POPULAR
                    </Badge>
                  </div>
                )}
                <div className="text-center mb-6 pt-4">
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
                <Link href="/signup">
                  <Button
                    className={`w-full font-black py-4 brutal-button mt-auto ${
                      plan.popular || plan.name === "TEAM"
                        ? "bg-white text-black hover:bg-gray-100"
                        : "bg-purple-500 text-white hover:bg-purple-600"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
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
                  src={university.logo || "/placeholder.svg"}
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Trusted by Students Worldwide</h2>
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

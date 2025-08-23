"use client"

import { Button } from "@/components/ui/button"
import { Brain, Clock, Lightbulb, Network, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function StudyTechniquesPage() {
  const techniques = [
    {
      icon: Clock,
      title: "POMODORO TECHNIQUE",
      desc: "Work in focused 25-minute intervals with 5-minute breaks to maximize concentration and prevent burnout.",
      steps: [
        "Choose a task to work on",
        "Set timer for 25 minutes",
        "Work until timer rings",
        "Take a 5-minute break",
        "Repeat 3-4 times, then longer break",
      ],
    },
    {
      icon: Lightbulb,
      title: "FEYNMAN TECHNIQUE",
      desc: "Learn by teaching - explain concepts in simple terms to identify knowledge gaps and deepen understanding.",
      steps: [
        "Choose a concept to learn",
        "Explain it in simple terms",
        "Identify gaps in knowledge",
        "Review and simplify further",
        "Use analogies and examples",
      ],
    },
    {
      icon: Network,
      title: "MIND MAPPING",
      desc: "Create visual representations of information to improve memory, understanding, and creative thinking.",
      steps: [
        "Start with central topic",
        "Add main branches for key ideas",
        "Include sub-branches for details",
        "Use colors and images",
        "Review and expand regularly",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-stone-50 text-black font-mono selection:bg-amber-400 selection:text-black">
            <Navbar />


      {/* Hero */}
      <section className="bg-gray-50 py-20">
  <div className="max-w-7xl mx-auto px-4 text-center">
    <h1 className="text-5xl md:text-7xl font-white mb-6 text-white">
      📚 STUDY TECHNIQUES
    </h1>
    <div className="w-32 h-2 bg-purple-500 mx-auto mb-8"></div>
    <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-4xl mx-auto">
      Master proven study methods that enhance learning efficiency and retention.
    </p>
  </div>
</section>


      {/* Techniques Grid */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {techniques.map((technique, index) => (
              <div
                key={index}
                className={`p-8 brutal-border hover-scale transition-all ${
                  index === 0
                    ? "bg-purple-500 text-white"
                    : index === 1
                      ? "bg-blue-800 text-white"
                      : "bg-black text-white"
                }`}
              >
                <technique.icon className="w-16 h-16 mb-6" />
                <h3 className="text-2xl font-black mb-4">{technique.title}</h3>
                <p className="font-bold mb-6 leading-tight">{technique.desc}</p>

                <div className="space-y-3">
                  <h4 className="font-black text-lg">HOW TO DO IT:</h4>
                  {technique.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start">
                      <div className="w-6 h-6 bg-white text-black brutal-border flex items-center justify-center font-black text-sm mr-3 flex-shrink-0 mt-1">
                        {stepIndex + 1}
                      </div>
                      <span className="font-bold">{step}</span>
                    </div>
                  ))}
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
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div
                  className="bg-white p-6 brutal-border hover-lift hover-scale transition-all cursor-pointer scroll-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-xl font-black mb-2">{feature.name}</h3>
                  <p className="font-bold text-black-700">{feature.desc}</p>
                  <ArrowRight className="w-5 h-5 mt-4 text-purple-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Integration CTA */}
     <section className="bg-gray-50 py-20">
  <div className="max-w-4xl mx-auto px-4 text-center">
    <h2 className="text-4xl md:text-6xl font-white mb-6 text-white">
      🤖 COMBINE WITH AI
    </h2>
    <div className="w-32 h-2 bg-purple-500 mx-auto mb-8"></div>
    <p className="text-xl font-bold text-gray-700 mb-8">
      Use these techniques alongside Tutorly's AI features for maximum learning efficiency.
    </p>
    <div className="flex flex-col sm:flex-row gap-6 justify-center">
      <Link href="/signup">
        <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xl px-12 py-6 brutal-button">
          START LEARNING FREE
        </Button>
      </Link>
      <Link href="/features">
        <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xl px-12 py-6 brutal-button">
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

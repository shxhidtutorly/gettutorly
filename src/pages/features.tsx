import { Button } from "@/components/ui/button"
import { MessageSquare, FileText, Headphones, BookOpen, HelpCircle, Calculator, CreditCard } from "lucide-react"
import  Navbar  from "@/components/navbar"
import { Footer } from "@/components/Footer"

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: Calculator,
      title: "MATH CHAT",
      desc: "Solve complex math problems with step-by-step AI explanations and visual solutions.",
      href: "/features/math-chat",
      bg: "bg-purple-500",
      textColor: "text-white",
    },
    {
      icon: FileText,
      title: "AI NOTES",
      desc: "Generate smart, structured notes from any document, lecture, or study material instantly.",
      href: "/features/ai-notes",
      bg: "bg-blue-600",
      textColor: "text-white",
    },
    {
      icon: Headphones,
      title: "AUDIO RECAP",
      desc: "Convert audio recordings and lectures into organized notes and summaries.",
      href: "/features/audio-recap",
      bg: "bg-green-600",
      textColor: "text-white",
    },
    {
      icon: BookOpen,
      title: "SUMMARIZER",
      desc: "Quickly summarize any text, article, or document into key points and insights.",
      href: "/features/summarizer",
      bg: "bg-yellow-500",
      textColor: "text-black",
    },
    {
      icon: CreditCard,
      title: "FLASHCARDS",
      desc: "Create and review adaptive flashcards that evolve based on your learning progress.",
      href: "/features/flashcards",
      bg: "bg-orange-500",
      textColor: "text-white",
    },
    {
      icon: HelpCircle,
      title: "TESTS & QUIZZES",
      desc: "Test your knowledge with AI-generated quizzes based on your study materials.",
      href: "/features/tests-and-quizzes",
      bg: "bg-red-500",
      textColor: "text-white",
    },
    {
      icon: MessageSquare,
      title: "DOUBT CHAIN",
      desc: "Break down complex concepts into simple, connected steps for better understanding.",
      href: "/features/doubt-chain",
      bg: "bg-indigo-600",
      textColor: "text-white",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <Navbar />

      {/* Hero */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6">🧩 ALL FEATURES</h1>
          <div className="w-32 h-2 bg-purple-500 mx-auto mb-8"></div>
          <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-4xl mx-auto">
            Discover every tool you need to transform your learning experience with AI-powered assistance.
          </p>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4">⚡ CORE FEATURES</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <a key={index} href={feature.href}>
                <div
                  className={`${feature.bg} ${feature.textColor} p-8 brutal-border hover-scale hover-lift transition-all cursor-pointer`}
                >
                  <feature.icon className="w-16 h-16 mb-6" />
                  <h3 className="text-xl font-black mb-4">{feature.title}</h3>
                  <p className="font-bold leading-tight mb-4">{feature.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm">EXPLORE {feature.title}</span>
                    <span className="text-2xl">→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">READY TO START?</h2>
          <p className="text-xl font-bold mb-8 text-gray-300">
            Experience all these features with our basic plan, or upgrade for unlimited access.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/signup">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xl px-12 py-6 brutal-button">
                START LEARNING FREE
              </Button>
            </a>
            <a href="/pricing">
              <Button
                variant="outline"
                className="bg-transparent border-white text-white font-black text-xl px-12 py-6 brutal-button hover:bg-white hover:text-black"
              >
                VIEW PRICING
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

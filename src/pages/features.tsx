import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  FileText,
  Headphones,
  BookOpen,
  HelpCircle,
  Calculator,
  CreditCard,
  Lightbulb,
  PenLine,
} from "lucide-react"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: Calculator,
      title: "Math Chat",
      desc: "Solve complex math problems with step-by-step AI explanations and visual solutions.",
      href: "/features/math-chat",
      bg: "bg-purple-600",
      textColor: "text-white",
    },
    {
      icon: FileText,
      title: "AI Notes",
      desc: "Generate smart, structured notes from any document, lecture, or study material instantly.",
      href: "/features/ai-notes",
      bg: "bg-blue-600",
      textColor: "text-white",
    },
    {
      icon: Headphones,
      title: "Audio Recap",
      desc: "Convert audio recordings and lectures into organized notes and summaries.",
      href: "/features/audio-recap",
      bg: "bg-green-600",
      textColor: "text-white",
    },
    {
      icon: BookOpen,
      title: "Summarizer",
      desc: "Quickly summarize any text, article, or document into key points and insights.",
      href: "/features/summaries",
      bg: "bg-yellow-400",
      textColor: "text-black",
    },
    {
      icon: CreditCard,
      title: "Flashcards",
      desc: "Create and review adaptive flashcards that evolve based on your learning progress.",
      href: "/features/flashcard",
      bg: "bg-orange-500",
      textColor: "text-white",
    },
    {
      icon: HelpCircle,
      title: "Tests & Quizzes",
      desc: "Test your knowledge with AI-generated quizzes based on your study materials.",
      href: "/features/tests-quiz",
      bg: "bg-red-500",
      textColor: "text-white",
    },
    {
      icon: MessageSquare,
      title: "Doubt Chain",
      desc: "Break down complex concepts into simple, connected steps for better understanding.",
      href: "/features/doubt-chain",
      bg: "bg-indigo-600",
      textColor: "text-white",
    },
    {
      icon: Lightbulb,
      title: "Study Techniques",
      desc: "Learn powerful strategies and frameworks to optimize how you learn.",
      href: "/features/study-techniques",
      bg: "bg-emerald-600",
      textColor: "text-white",
    },
    {
      icon: PenLine,
      title: "Essay Assistant",
      desc: "Plan, structure, and enhance your essays with AI-powered suggestions and formatting.",
      href: "#essay-assistant-path",
      bg: "bg-pink-500",
      textColor: "text-white",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 flex items-center justify-center gap-4">
            <Lightbulb className="w-12 h-12 text-purple-600 animate-pulse" />
            All Features
          </h1>
          <div className="w-32 h-2 bg-purple-500 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl md:text-2xl font-medium text-gray-700 max-w-4xl mx-auto">
            Discover every tool you need to transform your learning experience with AI-powered assistance.
          </p>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4">Core Features</h2>
            <div className="w-32 h-2 bg-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <a key={index} href={feature.href}>
                <div
                  className={`rounded-xl p-8 ${feature.bg} ${feature.textColor} shadow-xl hover:scale-[1.03] transition-transform duration-300 hover:shadow-2xl`}
                >
                  <feature.icon className="w-14 h-14 mb-6" />
                  <h3 className="text-2xl font-extrabold mb-3">{feature.title}</h3>
                  <p className="text-md font-medium mb-4">{feature.desc}</p>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>Explore {feature.title}</span>
                    <span className="text-xl">→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to Start?</h2>
          <p className="text-xl font-medium mb-8 text-white/80">
            Try our essential tools for free — or upgrade for unlimited learning superpowers.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/signup">
              <Button className="bg-white text-purple-700 font-black text-lg px-10 py-5 rounded-xl hover:bg-gray-100 transition-all">
                Start Learning Free
              </Button>
            </a>
            <a href="/pricing">
              <Button
                variant="outline"
                className="border-white text-white font-black text-lg px-10 py-5 rounded-xl hover:bg-white hover:text-black transition-all"
              >
                View Pricing
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

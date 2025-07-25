"use client"

import { Button } from "@/components/ui/button"
import { Brain, Menu, X, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)

  const features = [
    { name: "Math Chat", href: "/features/math-chat" },
    { name: "AI Notes", href: "/features/ai-notes" },
    { name: "Audio Recap", href: "/features/audio-recap" },
    { name: "Summarizer", href: "/features/summarizer" },
    { name: "Flashcards", href: "/features/flashcards" },
    { name: "Tests & Quizzes", href: "/features/tests-and-quizzes" },
    { name: "Doubt Chain", href: "/features/doubt-chain" },
  ]

  return (
    <header className="bg-white brutal-border border-b-4 border-black relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 brutal-border flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">TUTORLY</h1>
              <p className="text-sm font-bold text-gray-600">STUDY SMARTER. LEARN FASTER.</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-black hover:text-purple-500 transition-colors">
              HOME
            </Link>

            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setFeaturesOpen(true)}
              onMouseLeave={() => setFeaturesOpen(false)}
            >
              <button className="font-black hover:text-purple-500 transition-colors flex items-center">
                FEATURES
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {featuresOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white brutal-border shadow-lg z-50">
                  <Link href="/features" className="block px-4 py-2 font-bold hover:bg-gray-100">
                    All Features
                  </Link>
                  {features.map((feature) => (
                    <Link
                      key={feature.href}
                      href={feature.href}
                      className="block px-4 py-2 font-bold hover:bg-gray-100"
                    >
                      {feature.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/pricing" className="font-black hover:text-purple-500 transition-colors">
              PRICING
            </Link>
            <a href="/#faq" className="font-black hover:text-purple-500 transition-colors">
              FAQ
            </a>
            <Link href="/study-techniques" className="font-black hover:text-purple-500 transition-colors">
              STUDY METHODS
            </Link>
            <Link href="/support" className="font-black hover:text-purple-500 transition-colors">
              SUPPORT
            </Link>
            <Link href="/signup">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black brutal-button">
                TRY FOR FREE
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t-2 border-black bg-white">
            <div className="flex flex-col space-y-4 pb-4">
              <Link href="/" className="font-black hover:text-purple-500 transition-colors">
                HOME
              </Link>
              <Link href="/features" className="font-black hover:text-purple-500 transition-colors">
                ALL FEATURES
              </Link>
              {features.map((feature) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="font-bold hover:text-purple-500 transition-colors pl-4"
                >
                  {feature.name}
                </Link>
              ))}
              <Link href="/pricing" className="font-black hover:text-purple-500 transition-colors">
                PRICING
              </Link>
              <a href="/#faq" className="font-black hover:text-purple-500 transition-colors">
                FAQ
              </a>
              <Link href="/study-techniques" className="font-black hover:text-purple-500 transition-colors">
                STUDY METHODS
              </Link>
              <Link href="/support" className="font-black hover:text-purple-500 transition-colors">
                SUPPORT
              </Link>
              <Link href="/signup" className="pt-2">
                <Button className="bg-purple-500 hover:bg-purple-600 text-white font-black brutal-button w-full">
                  TRY FOR FREE
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

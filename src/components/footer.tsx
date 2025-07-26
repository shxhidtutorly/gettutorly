"use client"

import { Brain, Instagram, Music } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-500 brutal-border flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-black text-lg">TUTORLY</div>
                <div className="text-xs font-bold text-gray-400">STUDY SMARTER. LEARN FASTER.</div>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-300 mb-6">IT'S TIME TO REVOLUTIONIZE YOUR STUDY GAME.</p>
            <div className="flex space-x-4">
              <a
                href="https://www.tiktok.com/@_mary_manuel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors"
                aria-label="TikTok"
              >
                <Music className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://www.instagram.com/gettutorly"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Website Links */}
          <div>
            <h3 className="font-black text-lg mb-4">Website</h3>
            <div className="space-y-3">
              <Link href="/" className="block font-bold hover:text-purple-400 transition-colors">
                Home
              </Link>
              <Link href="/features" className="block font-bold hover:text-purple-400 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="block font-bold hover:text-purple-400 transition-colors">
                Pricing
              </Link>
              <Link href="/study-techniques" className="block font-bold hover:text-purple-400 transition-colors">
                Study Methods
              </Link>
              <Link href="/signup" className="block font-bold hover:text-purple-400 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-black text-lg mb-4">Company</h3>
            <div className="space-y-3">
              <a href="/#faq" className="block font-bold hover:text-purple-400 transition-colors">
                FAQ
              </a>
              <Link href="/privacy" className="block font-bold hover:text-purple-400 transition-colors">
                Privacy Policy
              </Link>
              <a
                href="https://gettutorly.com/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-bold hover:text-purple-400 transition-colors"
              >
                Terms of Service
              </a>
              <Link href="/support" className="block font-bold hover:text-purple-400 transition-colors">
                Support
              </Link>
            </div>
          </div>

          {/* Our Features */}
          <div>
            <h3 className="font-black text-lg mb-4">Our Features</h3>
            <div className="space-y-3">
              <Link href="/features/ai-notes" className="block font-bold hover:text-purple-400 transition-colors">
                AI Notes
              </Link>
              <Link href="/features/math-chat" className="block font-bold hover:text-purple-400 transition-colors">
                Math Chat
              </Link>
              <Link href="/features/flashcard" className="block font-bold hover:text-purple-400 transition-colors">
                Flashcards
              </Link>
              <Link href="/features/audio-recap" className="block font-bold hover:text-purple-400 transition-colors">
                Audio Recap
              </Link>
              <Link
                href="/features/tests-quiz"
                className="block font-bold hover:text-purple-400 transition-colors"
              >
                Tests & Quizzes
              </Link>
              <Link href="/features/summaries" className="block font-bold hover:text-purple-400 transition-colors">
                Summarizer
              </Link>
              <Link href="/features/doubt-chain" className="block font-bold hover:text-purple-400 transition-colors">
                Doubt Chain
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-bold text-gray-400 text-sm">© 2024 TUTORLY. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-xs font-bold text-gray-500">Trusted by 500K+ students worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;

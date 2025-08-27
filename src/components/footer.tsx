"use client"

import { Brain, Instagram, Music } from "lucide-react"
import Link from "next/link"

// Data for the links to keep the JSX clean
const websiteLinks = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Sign In', href: '/signin' },
  { name: 'Sign Up', href: '/signup' },
];

const companyLinks = [
  { name: 'FAQ', href: '/#faq' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: 'https://gettutorly.com/terms-of-service' },
  { name: 'Support', href: '/support' },
];

// All features including the new ones
const allFeatures = [
  { name: 'AI Notes', href: '/features/ai-notes' },
  { name: 'Math Chat', href: '/features/math-chat' },
  { name: 'Flashcards', href: '/features/flashcard' },
  { name: 'Audio Recap', href: '/features/audio-recap' },
  { name: 'Tests & Quizzes', href: '/features/tests-quiz' },
  { name: 'Summarizer', href: '/features/summaries' },
  { name: 'Doubt Chain', href: '/features/doubt-chain' },
  { name: 'Humanizer', href: '/features/humanizer' },
  { name: 'Tutor me', href: '/features/tutor-me' },
  { name: 'Tutorly Assistant', href: '/features/tutorly-assistant' },
  { name: 'AI Content Processor', href: '/features/ai-content-processor' },
];

// Split features into two columns for the UI
const midIndex = Math.ceil(allFeatures.length / 2);
const featuresCol1 = allFeatures.slice(0, midIndex);
const featuresCol2 = allFeatures.slice(midIndex);


export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Brand Section - Takes more space on larger screens */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-purple-600 border-2 border-white flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-black text-2xl tracking-tight">TUTORLY</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Study Smarter</div>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-300 mb-6 max-w-xs">
              It's time to revolutionize your study game. Join over 500K+ students worldwide.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.tiktok.com/@_mary_manuel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center transform transition-all duration-300 hover:bg-purple-600 hover:scale-110"
                aria-label="TikTok"
              >
                <Music className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://www.instagram.com/gettutorly"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center transform transition-all duration-300 hover:bg-purple-600 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-4">Navigate</h3>
            <div className="space-y-3">
              {websiteLinks.map((link) => (
                <Link key={link.name} href={link.href} className="block font-medium text-gray-200 hover:text-purple-400 transition-all duration-300 hover:translate-x-1">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Features Section (Two Columns) */}
          <div className="md:col-span-2 lg:col-span-2">
            <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-4">Our Features</h3>
            <div className="grid grid-cols-2 gap-x-6">
              {/* Column 1 */}
              <div className="space-y-3">
                {featuresCol1.map((feature) => (
                  <Link key={feature.name} href={feature.href} className="block font-medium text-gray-200 hover:text-purple-400 transition-all duration-300 hover:translate-x-1">
                    {feature.name}
                  </Link>
                ))}
              </div>
              {/* Column 2 */}
              <div className="space-y-3">
                {featuresCol2.map((feature) => (
                  <Link key={feature.name} href={feature.href} className="block font-medium text-gray-200 hover:text-purple-400 transition-all duration-300 hover:translate-x-1">
                    {feature.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-medium text-gray-400 text-sm">© {new Date().getFullYear()} TUTORLY. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
               {companyLinks.map((link, index) => (
                 <>
                   <a
                     key={link.name}
                     href={link.href}
                     target={link.href.startsWith('http') ? '_blank' : '_self'}
                     rel="noopener noreferrer"
                     className="text-xs font-bold text-gray-500 hover:text-purple-400 transition-colors"
                   >
                     {link.name}
                   </a>
                   {index < companyLinks.length - 1 && <span className="text-gray-600">|</span>}
                 </>
               ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;

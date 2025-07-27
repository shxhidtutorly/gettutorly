"use client"

// components/Navbar.jsx
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Brain } from "lucide-react"; // Assuming Brain icon is from lucide-react

const Navbar = () => {
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsFeaturesDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsFeaturesDropdownOpen(false);
    }, 200); // Small delay to prevent accidental closing
  };

  const featuresDropdownItems = [
    { name: 'All Features', href: '/features' },
    { name: 'Math Chat', href: '/features/math-chat' },
    { name: 'AI Notes', href: '/features/ai-notes' },
    { name: 'Audio Recap', href: '/features/audio-recap' },
    { name: 'Summarizer', href: '/features/summaries' },
    { name: 'Flashcards', href: '/features/flashcard' },
    { name: 'Tests & Quizzes', href: '/features/tests-quiz' },
    { name: 'Doubt Chain', href: '/features/doubt-chain' },
    { name: 'study-methods', href: '/features/study-techniques' },

  ];

  return (
    <nav className="relative border-b-2 border-black bg-white">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo and Tagline */}
        <div className="flex items-center">
          <div className="bg-purple-600 p-2 rounded brutal-border-square">
            <Brain className="w-8 h-8 text-white" /> {/* Ensure Brain icon is white */}
          </div>
          <div>
            <Link href="/" className="text-2xl font-black text-black ml-2">
              TUTORLY
            </Link>
            {/* FIX 1: Change tagline color to black */}
            <p className="text-black text-sm ml-2">STUDY SMARTER. LEARN FASTER.</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8 text-lg font-bold">
          <Link href="/" className="hover:text-purple-600 transition-colors">HOME</Link>

          {/* FIX 2: FEATURES Dropdown + delay on mouse leave */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Make sure the FEATURES text is black */}
            <span className="cursor-pointer text-black hover:text-purple-600 transition-colors">FEATURES</span>
            {isFeaturesDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border-2 border-black brutal-border z-10 shadow-lg">
                {featuresDropdownItems.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <div className="block px-4 py-2 text-black hover:bg-gray-100 border-b border-gray-200 last:border-b-0">
                      {item.name}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/pricing" className="hover:text-purple-600 transition-colors">PRICING</Link>
          <Link href="/faq" className="hover:text-purple-600 transition-colors">FAQ</Link>
          <Link href="/signin" className="hover:text-purple-600 transition-colors">SIGNIN</Link>
          <Link href="/support" className="hover:text-purple-600 transition-colors">SUPPORT</Link>
        </div>

        {/* Call to Action Button */}
        <Link href="/signup">
          <button className="bg-purple-600 text-white font-bold py-2 px-6 rounded brutal-button hover:bg-purple-700 transition-colors border-2 border-black">
            TRY FOR FREE
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

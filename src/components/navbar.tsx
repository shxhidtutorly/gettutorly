// components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Brain, Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  // State for the mobile menu (hamburger)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for the desktop features dropdown
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  // State for the mobile features accordion
  const [isFeaturesMobileOpen, setIsFeaturesMobileOpen] = useState(false);

  // Effect to lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to ensure scroll is restored on component unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  // Handlers for desktop dropdown menu
  const handleDesktopFeaturesEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsFeaturesDropdownOpen(true);
  };

  const handleDesktopFeaturesLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsFeaturesDropdownOpen(false);
    }, 200);
  };

  // Data for navigation links for easier management
  const navLinks = [
    { name: 'HOME', href: '/' },
    // Features is handled separately due to dropdown functionality
    { name: 'PRICING', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
  ];

  const featuresDropdownItems = [
    { name: 'All Features', href: '/features' },
    { name: 'Math Chat', href: '/features/math-chat' },
    { name: 'AI Notes', href: '/features/ai-notes' },
    { name: 'Audio Recap', href: '/features/audio-recap' },
    { name: 'Summarizer', href: '/features/summaries' },
    { name: 'Flashcards', href: '/features/flashcard' },
    { name: 'Tests & Quizzes', href: '/features/tests-quiz' },
    { name: 'Doubt Chain', href: '/features/doubt-chain' },
    { name: 'Study Methods', href: '/features/study-techniques' }, // Corrected capitalization
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b-2 border-black bg-white">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo and Brand Name */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <div className="bg-purple-600 p-2 rounded-md border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-2xl font-black text-black">TUTORLY</h1>
            <p className="hidden sm:block text-black text-xs font-bold tracking-wider">
              STUDY SMARTER. LEARN FASTER.
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center space-x-8 text-lg font-bold">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-black hover:text-purple-600 transition-colors duration-200">
              {link.name}
            </Link>
          ))}
          {/* Desktop Features Dropdown */}
          <div
            className="relative"
            onMouseEnter={handleDesktopFeaturesEnter}
            onMouseLeave={handleDesktopFeaturesLeave}
          >
            <span className="cursor-pointer text-black hover:text-purple-600 transition-colors duration-200 flex items-center">
              FEATURES
              <ChevronDown className="w-5 h-5 ml-1" />
            </span>
            {isFeaturesDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-md">
                {featuresDropdownItems.map((item) => (
                  <Link key={item.name} href={item.href} className="block px-4 py-3 text-sm font-bold text-black hover:bg-purple-100 transition-colors duration-200 border-b-2 border-black last:border-b-0">
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Desktop Sign In and CTA (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link href="/signin" className="font-bold text-black hover:text-purple-600 transition-colors duration-200">
            SIGN IN
          </Link>
          <Link href="/signup">
            <button className="bg-purple-600 text-white font-bold py-3 px-6 rounded-md border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-purple-700 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all duration-200">
              START LEARNING FREE
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button (Hamburger Icon) */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* --- Mobile Menu Panel --- */}
      <div
        className={`fixed inset-0 z-50 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="container mx-auto flex flex-col h-full p-4">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-black">
                 <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
                    <div className="bg-purple-600 p-2 rounded-md border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-black ml-3">TUTORLY</h1>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                    <X size={32} />
                </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col text-2xl font-black mt-8 space-y-2">
                {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="p-4 w-full text-left hover:bg-gray-100 rounded-md">
                        {link.name}
                    </Link>
                ))}
                {/* Mobile Features Accordion */}
                <div>
                    <button onClick={() => setIsFeaturesMobileOpen(!isFeaturesMobileOpen)} className="p-4 w-full text-left flex justify-between items-center hover:bg-gray-100 rounded-md">
                        FEATURES
                        <ChevronDown className={`w-8 h-8 transition-transform duration-300 ${isFeaturesMobileOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isFeaturesMobileOpen ? 'max-h-screen' : 'max-h-0'}`}>
                        <div className="pl-8 pt-2 flex flex-col space-y-2">
                            {featuresDropdownItems.map((item) => (
                                <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)} className="p-3 text-xl font-bold w-full text-left hover:bg-gray-100 rounded-md">
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Mobile CTA and Sign In */}
            <div className="mt-auto pt-8 border-t-2 border-black space-y-4">
                 <Link href="/signin" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-gray-100 text-black font-bold py-4 px-6 rounded-md border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-200 transition-all duration-200">
                    SIGN IN
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-purple-600 text-white font-bold py-4 px-6 rounded-md border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-purple-700 transition-all duration-200">
                    START LEARNING FREE
                </Link>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

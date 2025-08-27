// components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Brain, Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  // Mobile hamburger
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Desktop features dropdown (unchanged behavior)
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  // Mobile features accordion
  const [isFeaturesMobileOpen, setIsFeaturesMobileOpen] = useState(false);

  // lock scroll behind mobile drawer
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMenuOpen]);

  // desktop dropdown hover handlers
  const handleDesktopFeaturesEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setIsFeaturesDropdownOpen(true);
  };
  const handleDesktopFeaturesLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsFeaturesDropdownOpen(false);
    }, 200);
  };

  // top-level nav (desktop)
  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: 'PRICING', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
  ];

  // features list (used by desktop dropdown & mobile accordion)
  const featuresDropdownItems = [
    { name: 'All Features', href: '/features' },
    { name: 'Math Chat', href: '/features/math-chat' },
    { name: 'AI Notes', href: '/features/ai-notes' },
    { name: 'Audio Recap', href: '/features/audio-recap' },
    { name: 'Summarizer', href: '/features/summaries' },
    { name: 'Flashcards', href: '/features/flashcard' },
    { name: 'Tests & Quizzes', href: '/features/tests-quiz' },
    { name: 'Doubt Chain', href: '/features/doubt-chain' },
    { name: 'Study Methods', href: '/features/study-techniques' },
     { name: 'Humanizer', href: '/features/humanizer' },
    { name: 'Tutor me', href: '/features/tutor-me' },
     { name: 'Tutorly assistant', href: '/features/tutorly-assistant' },
     { name: 'Ai Content processor', href: '/features/ai-content-processor' },


  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b-2 border-black bg-white">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
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

        {/* ---- DESKTOP NAV (untouched) ---- */}
        <div className="hidden lg:flex items-center space-x-8 text-lg font-bold">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-black hover:text-purple-600 transition-colors duration-200"
            >
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
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 text-sm font-bold text-black hover:bg-purple-100 transition-colors duration-200 border-b-2 border-black last:border-b-0"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---- DESKTOP CTA (untouched) ---- */}
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

        {/* ---- MOBILE HAMBURGER (visibility fixed) ---- */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="border-2 border-black rounded-md bg-white p-2 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
          >
            {isMenuOpen ? (
              <X size={26} strokeWidth={3} className="text-black" />
            ) : (
              <Menu size={26} strokeWidth={3} className="text-black" />
            )}
          </button>
        </div>
      </div>

      {/* ---- MOBILE SLIDE-IN MENU ---- */}
      <div
        className={`fixed inset-0 z-50 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="container mx-auto flex flex-col h-full p-4 overflow-auto">
          {/* Header row */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-black">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
              <div className="bg-purple-600 p-2 rounded-md border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-black ml-3">TUTORLY</h1>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="border-2 border-black rounded-md bg-white p-2 shadow-[3px_3px_0px_rgba(0,0,0,1)]"
            >
              <X size={24} strokeWidth={3} />
            </button>
          </div>

          {/* Main mobile links */}
          <div className="flex flex-col text-2xl font-black mt-8 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="p-4 w-full text-left hover:bg-gray-100 rounded-md"
              >
                {link.name}
              </Link>
            ))}

            {/* FEATURES: top-level link + chevron to expand sub-features */}
            <div className="rounded-md">
              <div className="flex items-stretch">
                {/* Left: clickable text navigates to /features */}
                <Link
                  href="/features"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 p-4 text-left hover:bg-gray-100 rounded-l-md"
                >
                  FEATURES
                </Link>

                {/* Right: chevron toggles accordion */}
                <button
                  type="button"
                  aria-label="Expand features"
                  onClick={() => setIsFeaturesMobileOpen(!isFeaturesMobileOpen)}
                  className="px-4 border-l-2 border-black rounded-r-md hover:bg-gray-100"
                >
                  <ChevronDown
                    className={`w-7 h-7 transition-transform duration-300 ${
                      isFeaturesMobileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Accordion body */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out border-2 border-t-0 border-black rounded-b-md ${
                  isFeaturesMobileOpen ? 'max-h-[800px]' : 'max-h-0'
                }`}
              >
                <div className="bg-white">
                  {featuresDropdownItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-6 py-3 text-xl font-bold hover:bg-gray-100 border-b-2 border-black last:border-b-0"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-auto pt-8 border-t-2 border-black space-y-4">
            <Link
              href="/signin"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center bg-gray-100 text-black font-bold py-4 px-6 rounded-md border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:bg-gray-200 transition-all duration-200"
            >
              SIGN IN
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center bg-purple-600 text-white font-bold py-4 px-6 rounded-md border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-purple-700 transition-all duration-200"
            >
              START LEARNING FREE
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

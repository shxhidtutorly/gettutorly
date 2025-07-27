"use client"

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import Navbar from "@/components/navbar"; // Assuming you have this component
import { Footer } from "@/components/footer"; // Assuming you have this component

// --- FAQ Data ---
const faqData = [
    {
        question: "What is Tutorly and how does it work?",
        answer: "Tutorly is an AI-powered study companion that transforms your learning materials—text, PDFs, images, or audio—into interactive notes, flashcards, quizzes, math solutions, and more. Simply upload or paste your content, choose the tool you need, and Tutorly’s intelligent pipeline analyzes, summarizes, and presents customized study outputs in seconds.",
        color: "bg-sky-300",
    },
    {
        question: "Which subjects and content types does Tutorly support?",
        answer: "Tutorly covers virtually any academic topic—from math (algebra, calculus, geometry) and science (physics, chemistry, biology) to humanities (history, literature, languages). You can upload textbooks, lecture slides, hand-written notes, screenshots, or audio lectures, and our system will handle them all seamlessly.",
        color: "bg-rose-300",
    },
    {
        question: "How does Tutorly’s AI tutor adapt to my individual learning style?",
        answer: "Through continuous feedback loops. As you interact—answering quizzes, reviewing flashcards, or requesting deeper explanations—Tutorly tracks your performance and preferences, then adjusts question difficulty, explanation depth, and content pacing to maximize retention and engagement.",
        color: "bg-amber-300",
    },
    {
        question: "Can I upload PDFs, images, or audio lectures, and how are they processed?",
        answer: "Yes. PDFs and images are run through OCR to extract text; audio lectures are transcribed into clean text using our speech-to-text engine. The extracted content is then parsed by our AI models to generate notes, summaries, flashcards, or math solutions—no manual conversion needed.",
        color: "bg-teal-300",
    },
    {
        question: "Is there a limit to how many notes, flashcards, quizzes, or summaries I can generate?",
        answer: "We offer a 4-day full-access trial, during which you can generate unlimited notes, flashcards, quizzes, summaries, and all other features. After your trial ends, you’ll need to choose one of our paid plans to continue.",
        color: "bg-indigo-300",
    },
    {
        question: "What’s included in the trial versus the paid plans?",
        answer: "4-Day Trial: Unlocks every Tutorly feature—AI Notes, Flashcards, Quizzes, Math Solver, Audio Recaps, Essay Assistant, Doubt Chain, and more—without limits.\nPro Plan: Unlimited core features, plus priority processing and access to advanced summarization tools.\nPremium Plan: Everything in Pro, plus dedicated 1-on-1 support, early-access to new AI modules, and institutional licensing options.",
        color: "bg-lime-300",
    },
    {
        question: "How does billing work? Can I pause, cancel, or downgrade my subscription anytime?",
        answer: "Billing is handled monthly or annually via credit card or PayPal. You have full control—pause, cancel, or switch plans at any point from your account dashboard. If you cancel mid-cycle, you retain your plan’s benefits until the end of your billing period.",
        color: "bg-fuchsia-300",
    },
    {
        question: "How secure is my data? Are my uploads and personal details kept private?",
        answer: "Your privacy is our top priority. All uploads are encrypted in transit and at rest. We never share or sell your data—only you can access your study materials. Personal account information is stored securely under GDPR- and CCPA-compliant protocols.",
        color: "bg-cyan-300",
    },
    {
        question: "Does Tutorly integrate with third-party tools like Google Drive, Dropbox, or Canvas?",
        answer: "Yes! You can connect your Google Drive or Dropbox account to import/export documents. We also offer LTI integration for Canvas and other LMS platforms so instructors can seamlessly assign AI-powered study tools to their classes.",
        color: "bg-emerald-300",
    },
    {
        question: "Can I collaborate or share my generated study materials with classmates?",
        answer: "Absolutely. Each note, flashcard set, or quiz can be shared via a private link, classroom group, or export (PDF/CSV). You control permissions—view only, comment, or full editing rights—so group study has never been easier.",
        color: "bg-orange-300",
    },
    {
        question: "Is Tutorly available on mobile devices or as a native app?",
        answer: "Tutorly works responsively in any modern mobile or tablet browser. We’re also rolling out native iOS and Android apps—coming Q4 2025—with offline study modes and push-notification reminders.",
        color: "bg-violet-300",
    },
    {
        question: "What support options are available if I run into technical issues?",
        answer: "In-app Chatbot: 24/7 instant help for common questions.\nEmail Support: support@gettutorly.com (response within 24 hours).\nHelp Center: Self-service guides, video tutorials, and community forums.\nPriority Support: Included in Premium Plan for one-on-one video assistance.",
        color: "bg-red-300",
    },
    {
        question: "How often does Tutorly roll out new features and updates?",
        answer: "We release minor improvements and bug fixes weekly, and major feature updates (new AI tools, integrations) every 6–8 weeks. Premium users get early-access beta previews of upcoming modules.",
        color: "bg-green-300",
    },
    {
        question: "Do you offer educational or volume discounts for schools and institutions?",
        answer: "Yes—we provide bulk licensing discounts and specialized onboarding for educational institutions, tutoring centers, and corporate training programs. Contact sales@gettutorly.com for custom pricing and implementation plans.",
        color: "bg-blue-300",
    },
    {
        question: "What’s the best way to get started and see immediate results?",
        answer: "Sign up and start your 4-day full-access trial.\nUpload one course PDF or lecture recording.\nGenerate notes and flashcards instantly.\nReview your personalized study dashboard.\nWithin minutes, you’ll experience how Tutorly streamlines your entire learning workflow.",
        color: "bg-yellow-300",
    },
];


// --- Accordion Item Component ---
const FaqItem = ({ faq, isOpen, onClick, brutalistShadow, brutalistTransition }) => {
    return (
        <div className={`border-4 border-black bg-white ${brutalistShadow} animate-slide-in`}>
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left p-6 font-black text-xl md:text-2xl uppercase focus:outline-none"
            >
                <span>{faq.question}</span>
                <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center border-4 border-black ml-4 ${faq.color} ${brutalistShadow}`}>
                    {isOpen ? <Minus className="w-8 h-8 text-black" strokeWidth={4}/> : <Plus className="w-8 h-8 text-black" strokeWidth={4}/>}
                </div>
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="p-6 border-t-4 border-black font-bold text-lg whitespace-pre-line leading-relaxed">
                    {faq.answer}
                </div>
            </div>
        </div>
    );
};


// --- Main FAQ Page Component ---
export default function FaqPage() {
    const [openFaq, setOpenFaq] = useState(null);

    const handleToggle = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // --- Brutalist Style Constants ---
    const brutalistShadow = "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
    const brutalistTransition = "transition-all duration-300 ease-in-out";

    return (
        <div className="min-h-screen bg-stone-50 text-black font-mono selection:bg-rose-400 selection:text-black">
            {/* Custom CSS for animations */}
            <style>{`
                @keyframes slideInUp {
                  from {
                    opacity: 0;
                    transform: translateY(30px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                .animate-slide-in {
                  animation: slideInUp 0.7s ease-out forwards;
                  opacity: 0;
                }
            `}</style>

            <Navbar />

            {/* Hero Section */}
            <section className="bg-yellow-300 text-black border-b-4 border-black relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center py-24 md:py-32 relative">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none text-white my-8 animate-slide-in" style={{ textShadow: '4px 4px 0 #000, 8px 8px 0 #ef4444' }}>
                        ANSWERS HERE
                    </h1>
                    <p style={{ animationDelay: '0.2s' }} className="animate-slide-in text-xl md:text-2xl font-bold text-stone-900 max-w-4xl mx-auto bg-white/50 backdrop-blur-sm p-4 border-4 border-black">
                        Find everything you need to know about Tutorly. Your questions, answered.
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="space-y-8">
                        {faqData.map((faq, index) => (
                            <FaqItem
                                key={index}
                                faq={faq}
                                isOpen={openFaq === index}
                                onClick={() => handleToggle(index)}
                                brutalistShadow={brutalistShadow}
                                brutalistTransition={brutalistTransition}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

"use client"

import React, { useState } from "react";
import { Mail, MessageSquare, HelpCircle, Clock, CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar"; // Assuming you have this component
import { Footer } from "@/components/footer"; // Assuming you have this component
import { Button } from "@/components/ui/button"; // Assuming you have this component
import { Input } from "@/components/ui/input"; // Assuming you have this component
import { Badge } from "@/components/ui/badge"; // Assuming you have this component

// --- Main Support Page Component ---

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- Brutalist Style Constants ---
  const brutalistShadow = "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
  const brutalistTransition = "transition-all duration-300 ease-in-out";
  const brutalistHover = "hover:shadow-none hover:translate-x-1 hover:translate-y-1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct the email body
    const emailBody = `
Name: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}
    `;

    // Create the mailto link
    const mailtoLink = `mailto:support@gettutorly.com?subject=${encodeURIComponent(
      formData.subject
    )}&body=${encodeURIComponent(emailBody)}`;

    // Open the user's default email client
    window.location.href = mailtoLink;

    // Show the submission success message on the page
    setIsSubmitted(true);
  };

  const supportTopics = [
    {
      title: "Getting Started",
      desc: "New to the platform? Find setup guides and basic tutorials here.",
      icon: HelpCircle,
      color: "bg-teal-400",
      items: ["Account Setup", "First Steps", "Feature Overview", "Mobile App"],
    },
    {
      title: "Technical Issues",
      desc: "Trouble with uploads, processing, or app performance? We can help.",
      icon: MessageSquare,
      color: "bg-rose-400",
      items: ["Upload Problems", "Processing Errors", "App Crashes", "Login Issues"],
    },
    {
      title: "Billing & Plans",
      desc: "Questions about your subscription, pricing, or payment methods.",
      icon: CheckCircle,
      color: "bg-indigo-400",
      items: ["Plan Comparison", "Upgrade/Downgrade", "Payment Issues", "Refund Policy"],
    },
    {
      title: "Feature Help",
      desc: "Need help with specific tools like AI Notes or Math Solver?",
      icon: Clock,
      color: "bg-lime-400",
      items: ["AI Notes", "Flashcards", "Audio Recap", "Math Solver"],
    },
  ];

  // --- Animation for cards ---
  const cardAnimation = {
    animation: `slideInUp 0.5s ease-out forwards`,
  };

  return (
    <div className="min-h-screen bg-stone-50 text-black font-mono selection:bg-yellow-400 selection:text-black">
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
          animation: slideInUp 0.5s ease-out forwards;
        }
      `}</style>

      <Navbar />

      {/* Hero Section */}
      <section className="bg-teal-300 text-black border-b-4 border-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center py-24 md:py-32 relative">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none text-white my-8 animate-slide-in" style={{ textShadow: '4px 4px 0 #000, 8px 8px 0 #8b5cf6' }}>
            HOW CAN WE HELP?
          </h1>
          <p style={{ animationDelay: '0.2s' }} className="animate-slide-in text-xl md:text-2xl font-bold text-stone-900 max-w-4xl mx-auto bg-white/50 backdrop-blur-sm p-4 border-4 border-black">
            We're here to solve your problems and get you back to learning smarter.
          </p>
        </div>
      </section>

      {/* Support Topics Section */}
      <section className="bg-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-slide-in">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase">Explore Common Topics</h2>
            <div className="w-32 h-2 bg-black mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {supportTopics.map((topic, index) => (
              <div
                key={topic.title}
                style={{ animationDelay: `${0.2 * (index + 1)}s`, opacity: 0 }}
                className={`flex flex-col p-8 bg-white text-black ${brutalistShadow} ${brutalistTransition} animate-slide-in`}
              >
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 ${topic.color} flex-shrink-0 flex items-center justify-center ${brutalistShadow}`}>
                    <topic.icon className="w-9 h-9 text-black" strokeWidth={3} />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-3xl font-black uppercase">{topic.title}</h3>
                    <p className="font-bold text-base text-stone-600">{topic.desc}</p>
                  </div>
                </div>
                <ul className="space-y-3 flex-grow mb-8">
                  {topic.items.map((item) => (
                    <li key={item} className="flex items-center font-bold text-md">
                      <ArrowRight className="w-5 h-5 mr-3 flex-shrink-0 text-black" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className={`mt-auto text-center border-t-4 border-black pt-6`}>
                    <a href="mailto:support@gettutorly.com" className={`inline-block w-full font-black py-4 text-lg border-4 border-black bg-black text-white ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                        EMAIL SUPPORT
                    </a>
                    <p className="font-bold text-sm text-stone-500 mt-4">support@gettutorly.com</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 bg-rose-300 border-y-4 border-black">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12 animate-slide-in">
            <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase">Still Have Questions?</h2>
            <p className="text-xl font-bold">Send us a message and we'll get back to you within 24 hours.</p>
          </div>

          <div className={`p-8 md:p-12 bg-white ${brutalistShadow} animate-slide-in`} style={{ animationDelay: '0.2s' }}>
            {isSubmitted ? (
              <div className="text-center p-8 border-4 border-black bg-lime-300">
                <h3 className="text-3xl font-black mb-4">EMAIL CLIENT OPENED!</h3>
                <p className="font-bold text-lg mb-6">Please send the pre-filled email from your mail app. We'll get back to you shortly!</p>
                <Button 
                    onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: "", email: "", subject: "", message: "" });
                    }} 
                    className={`font-black py-4 px-8 text-lg border-4 border-black bg-black text-white ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}
                >
                  START A NEW MESSAGE
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-black mb-2 uppercase">Name</label>
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className={`font-bold text-lg p-4 bg-white border-2 border-black focus:bg-yellow-200 focus:outline-none focus:border-4 ${brutalistTransition}`}
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-black mb-2 uppercase">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className={`font-bold text-lg p-4 bg-white border-2 border-black focus:bg-yellow-200 focus:outline-none focus:border-4 ${brutalistTransition}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-black mb-2 uppercase">Subject</label>
                  <Input
                    type="text"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className={`font-bold text-lg p-4 bg-white border-2 border-black focus:bg-yellow-200 focus:outline-none focus:border-4 ${brutalistTransition}`}
                  />
                </div>
                <div>
                  <label className="block text-lg font-black mb-2 uppercase">Message</label>
                  <textarea
                    placeholder="Describe your issue here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className={`w-full font-bold text-lg p-4 bg-white border-2 border-black resize-y focus:bg-yellow-200 focus:outline-none focus:border-4 ${brutalistTransition}`}
                  />
                </div>
                <Button type="submit" className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xl py-5 border-4 border-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                  SEND MESSAGE
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

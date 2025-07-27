"use client"

import React, { useState } from 'react';
import { Check, Star, X } from "lucide-react";

// --- Helper Components (Exported as requested) ---

export const Navbar = () => (
  <nav className="bg-white text-black font-mono border-b-4 border-black sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex-shrink-0">
          <a href="/" className="text-3xl font-black">AI-Learn</a>
        </div>
        <div className="hidden md:block">
          <div className="ml-10 flex items-baseline space-x-4">
            <a href="#" className="text-black hover:bg-black hover:text-white px-3 py-2 text-lg font-bold transition-all duration-200">Home</a>
            <a href="#" className="text-black hover:bg-black hover:text-white px-3 py-2 text-lg font-bold transition-all duration-200">Features</a>
            <a href="#" className="bg-black text-white px-3 py-2 text-lg font-bold">Pricing</a>
            <a href="#" className="text-black hover:bg-black hover:text-white px-3 py-2 text-lg font-bold transition-all duration-200">Contact</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

export const Footer = () => (
    <footer className="bg-white text-black font-mono border-t-4 border-black">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-black mb-4">AI-Learn</h2>
            <p className="text-lg font-bold mb-6">Supercharge Your Learning.</p>
            <div className="flex justify-center space-x-6">
                <a href="#" className="text-black hover:underline font-bold">Privacy Policy</a>
                <a href="#" className="text-black hover:underline font-bold">Terms of Service</a>
            </div>
            <p className="mt-8 text-center text-base font-bold text-gray-600">&copy; 2025 AI-Learn. All rights reserved.</p>
        </div>
    </footer>
);

// A simple Button component to replicate one from a UI library
const CustomButton = ({ className, children, ...props }) => (
    <button className={className} {...props}>
        {children}
    </button>
);

// --- Main Pricing Page Component ---

export default function App() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const brutalistShadow = "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
  const brutalistTransition = "transition-all duration-300 ease-in-out";
  const brutalistHover = "hover:shadow-none hover:-translate-x-1 hover:-translate-y-1";

  const pricingPlans = [
    {
      name: "BASIC",
      desc: "Essential tools to get started",
      priceMonthly: "$9",
      priceAnnually: "$90",
      features: ["Basic AI Chat", "10 Notes/Month", "20 Flashcards", "Community Support"],
      notIncluded: ["Unlimited Usage", "Priority Support", "Advanced Features"],
      color: "bg-sky-400",
      buttonClass: "bg-black text-white hover:bg-gray-800",
      cta: "GET STARTED",
    },
    {
      name: "PRO",
      desc: "Full features + unlimited usage",
      priceMonthly: "$19",
      priceAnnually: "$190",
      features: ["Unlimited Everything", "Priority Support", "Advanced Analytics", "Export Options", "Audio Recap", "Math Solver"],
      notIncluded: [],
      color: "bg-fuchsia-400",
      popular: true,
      buttonClass: "bg-black text-white hover:bg-gray-800",
      cta: "GO PRO",
    },
    {
      name: "TEAM",
      desc: "For groups & institutions",
      priceMonthly: "$49",
      priceAnnually: "$490",
      features: ["Everything in Pro", "Team Management", "Bulk Import", "Admin Dashboard", "Custom Branding"],
      notIncluded: [],
      color: "bg-amber-400",
      buttonClass: "bg-black text-white hover:bg-gray-800",
      cta: "CONTACT US",
    },
  ];

  const testimonials = [
      { name: "Alice Chen", role: "CS @ MIT", quote: "Feels like a real tutor 24/7. The AI Notes feature is a lifesaver for my lectures.", avatarUrl: "https://placehold.co/100x100/7c3aed/ffffff?text=AC&font=mono" },
      { name: "Bob Martinez", role: "Engineering @ Stanford", quote: "AI summaries saved me hours of reading. I can focus on the core concepts now.", avatarUrl: "https://placehold.co/100x100/2563eb/ffffff?text=BM&font=mono" },
      { name: "Charlie Kim", role: "Pre-Med @ Yale", quote: "The adaptive flashcards are incredible. They helped me retain so much more for my bio exams.", avatarUrl: "https://placehold.co/100x100/16a34a/ffffff?text=CK&font=mono" },
      { name: "Diana Patel", role: "Business @ Penn", quote: "Turns my rambling voice notes from lectures into perfectly structured text. It's magic.", avatarUrl: "https://placehold.co/100x100/f97316/ffffff?text=DP&font=mono" },
  ];

  const universities = [
      { name: "MIT", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/mit-logo.webp" },
      { name: "Stanford University", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/standford-logo%20(1).webp" },
      { name: "University of Pennsylvania", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/penn-uop-logo.webp" },
      { name: "Yale University", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/yu-logo.webp" },
      { name: "University of Cambridge (UOC)", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/uoc-logo.webp" },
      { name: "Tokyo University of Medicine", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/tuom-logo.webp" },
      { name: "University of Toronto", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/tos-uni-logo%20(1).svg" },
      { name: "Harvard University", logo: "https://cdn.jsdelivr.net/gh/shxhidtutorly/university-logos/Harvard-University-Logo.png" },
  ];

  const FloatingShape = ({ className, animationDelay }) => (
    <div className={`absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 ${className}`} style={{ animation: `float 6s ease-in-out infinite`, animationDelay }}></div>
  );

  return (
    <div className="min-h-screen bg-stone-50 text-black font-mono selection:bg-amber-400 selection:text-black">
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(30px, -40px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
      <Navbar />

      {/* Hero Section */}
      <section className="bg-sky-200 text-black border-b-4 border-black relative overflow-hidden">
        <FloatingShape className="w-72 h-72 bg-fuchsia-300 top-40 -left-20" animationDelay="0s" />
        <FloatingShape className="w-72 h-72 bg-amber-300 bottom-40 -right-20" animationDelay="2s" />
        <div className="max-w-7xl mx-auto px-4 text-center py-24 md:py-32 relative z-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none text-white my-8" style={{ textShadow: '4px 4px 0 #000, 8px 8px 0 #4f46e5' }}>
            CHOOSE YOUR PLAN
          </h1>
          <p className="text-xl md:text-2xl font-bold text-stone-900 max-w-4xl mx-auto bg-white/50 backdrop-blur-sm p-4 border-4 border-black">
            Start learning smarter today with our flexible pricing options designed for every student's needs.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase">Made Simple. Just Like It Should Be.</h2>
            <div className="w-32 h-2 bg-black mx-auto"></div>
          </div>
          <div className="flex justify-center items-center my-12">
              <span className={`font-bold text-lg mr-4 ${billingCycle === 'monthly' ? 'text-black' : 'text-stone-400'}`}>Monthly</span>
              <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')} />
                  <div className={`w-20 h-10 bg-stone-200 rounded-full border-4 border-black peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-[4px] after:bg-black after:border after:border-black after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-fuchsia-400`}></div>
              </label>
              <span className={`font-bold text-lg ml-4 ${billingCycle === 'annually' ? 'text-black' : 'text-stone-400'}`}>Annually</span>
              <div className="ml-4 bg-amber-300 text-black font-bold text-sm py-1 px-3 border-2 border-black -rotate-6">SAVE 20%</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`relative h-full flex flex-col p-8 text-black bg-white ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-black text-white font-black px-6 py-2 border-2 border-black text-sm">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                <div className={`w-full h-4 ${plan.color} absolute top-0 left-0 border-b-4 border-black`}></div>
                <div className="text-center mb-6 pt-8">
                  <h3 className="text-3xl font-black mb-2 uppercase">{plan.name}</h3>
                  <p className="font-bold mb-4 text-base text-stone-600">{plan.desc}</p>
                  <div className="text-6xl font-black">{billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnually}</div>
                  <div className="text-base font-bold text-stone-600">/{billingCycle === 'monthly' ? 'month' : 'year'}</div>
                </div>
                <div className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <Check className="w-6 h-6 mr-3 flex-shrink-0 text-green-500" />
                      <span className="font-bold text-md">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-center opacity-60">
                      <X className="w-6 h-6 mr-3 flex-shrink-0 text-red-500" />
                      <span className="font-bold line-through text-md">{feature}</span>
                    </div>
                  ))}
                </div>
                <a href="/signup" className="mt-auto block">
                  <CustomButton className={`w-full font-black py-4 text-lg border-4 border-black ${plan.buttonClass} ${brutalistShadow} ${brutalistTransition} hover:shadow-none hover:-translate-x-1 hover:-translate-y-1`}>
                    {plan.cta}
                  </CustomButton>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-stone-100 py-20 border-y-4 border-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase">Trusted by Students Worldwide</h2>
            <div className="w-32 h-2 bg-black mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className={`p-6 bg-white text-black ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                <div className="flex items-center mb-4">
                  <img src={testimonial.avatarUrl} alt={testimonial.name} className={`w-16 h-16 rounded-full border-4 border-black ${brutalistShadow}`} />
                  <div className="ml-4">
                    <div className="font-black text-xl">{testimonial.name}</div>
                    <div className="font-bold text-md text-stone-600">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="font-bold text-lg leading-tight">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Universities Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase">Trusted By Top Universities</h2>
             <div className="w-32 h-2 bg-black mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {universities.map((uni) => (
              <div key={uni.name} className={`p-6 bg-stone-100 flex justify-center items-center h-32 ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                <img src={uni.logo} alt={uni.name} className="max-h-12 w-auto object-contain transition-all duration-300" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x60/e5e5e5/000000?text=Logo&font=mono'; }}/>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* Final CTA */}
      <section className="bg-amber-400 text-black py-20 border-y-4 border-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase">Ready to Excel?</h2>
          <p className="text-2xl font-bold mb-10">
            Join 500K+ students who are already learning smarter with AI-Learn.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/signup" className={`block bg-black text-white font-black text-xl px-10 py-5 w-full sm:w-auto ${brutalistShadow} ${brutalistTransition} ${brutalistHover}`}>
                START FOR FREE
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

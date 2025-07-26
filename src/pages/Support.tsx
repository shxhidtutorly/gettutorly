"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, HelpCircle, Clock, CheckCircle } from "lucide-react"
import { useState } from "react"
import  Navbar  from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [openTopic, setOpenTopic] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Support request:", formData)
    alert("Thank you! We'll get back to you within 24 hours.")
  }

  const supportTopics = [
    {
      title: "Getting Started",
      desc: "New to Tutorly? Learn the basics and set up your account",
      icon: HelpCircle,
      items: ["Account Setup", "First Steps", "Feature Overview", "Mobile App"],
    },
    {
      title: "Technical Issues",
      desc: "Having trouble with uploads, processing, or app performance?",
      icon: MessageSquare,
      items: ["Upload Problems", "Processing Errors", "App Crashes", "Login Issues"],
    },
    {
      title: "Billing & Plans",
      desc: "Questions about pricing, upgrades, or payment methods",
      icon: CheckCircle,
      items: ["Plan Comparison", "Upgrade/Downgrade", "Payment Issues", "Refund Requests"],
    },
    {
      title: "Feature Help",
      desc: "Need help with specific features like Math Chat or AI Notes?",
      icon: Clock,
      items: ["Math Chat", "AI Notes", "Flashcards", "Audio Recap"],
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black font-mono">
      <Navbar />

      {/* Hero Section */}
      <section className="feature-hero py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-8 scroll-fade-in">
            <Badge className="bg-green-600 text-white font-black text-lg px-6 py-3 brutal-border">💬 HELP CENTER</Badge>

            <h1 className="text-5xl md:text-7xl font-black leading-none text-black">Support</h1>

            <p className="text-2xl md:text-3xl font-bold text-gray-700 max-w-4xl mx-auto">
              We're here to help you succeed with Tutorly
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="mailto:support@gettutorly.com">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-black text-xl px-12 py-6 brutal-button brutal-button-glow">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Support
                </Button>
              </a>
              <Button
                variant="outline"
                className="bg-white text-black font-black text-xl px-12 py-6 brutal-button hover:bg-gray-100 border-black"
                onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                Contact Form
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Support Topics */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Common Support Topics</h2>
            <div className="w-32 h-2 bg-green-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {supportTopics.map((topic, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 brutal-border hover-lift scroll-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-600 brutal-border flex items-center justify-center mr-4">
                    <topic.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{topic.title}</h3>
                    <p className="font-bold text-gray-600 text-sm">{topic.desc}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {topic.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="font-bold text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 scroll-fade-in">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-black">Get in Touch</h2>
            <div className="w-32 h-2 bg-green-600 mx-auto mb-6"></div>
            <p className="text-xl font-bold text-gray-700">
              Can't find what you're looking for? Send us a message and we'll help you out!
            </p>
          </div>

          <div className="bg-white p-8 brutal-border scroll-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-black text-sm mb-2">NAME</label>
                  <Input
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="font-bold brutal-border h-12"
                    required
                  />
                </div>
                <div>
                  <label className="block font-black text-sm mb-2">EMAIL</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="font-bold brutal-border h-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-sm mb-2">SUBJECT</label>
                <Input
                  type="text"
                  placeholder="What can we help you with?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="font-bold brutal-border h-12"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-sm mb-2">MESSAGE</label>
                <textarea
                  placeholder="Please describe your issue or question in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-4 font-bold brutal-border h-32 resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-lg py-4 brutal-button"
              >
                SEND MESSAGE
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t-2 border-black text-center">
              <p className="font-bold text-gray-600 mb-4">Or reach us directly at:</p>
              <a
                href="mailto:support@gettutorly.com"
                className="font-black text-green-600 hover:text-green-700 text-lg"
              >
                support@gettutorly.com
              </a>
              <p className="font-bold text-gray-500 text-sm mt-2">We typically respond within 24 hours</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

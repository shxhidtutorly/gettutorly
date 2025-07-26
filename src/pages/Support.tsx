"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, HelpCircle, Clock, CheckCircle } from "lucide-react"
import { useState } from "react"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-black text-black dark:text-white font-sans transition-colors duration-500">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center animate-fade-in">
          <Badge className="bg-green-600 text-white font-bold text-lg px-6 py-2 rounded-full shadow-lg">
            HELP CENTER
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mt-6">Support</h1>

          <p className="text-xl md:text-2xl font-medium text-gray-700 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
            We're here to help you succeed with Tutorly
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
            <a href="mailto:support@gettutorly.com">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-4 shadow-md transition-transform hover:scale-105">
                <Mail className="w-5 h-5 mr-2" /> Email Support
              </Button>
            </a>
            <Button
              variant="outline"
              className="bg-white dark:bg-black text-black dark:text-white border border-black dark:border-white font-bold text-lg px-8 py-4 hover:bg-gray-100 dark:hover:bg-gray-900 transition-transform hover:scale-105"
              onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              Contact Form
            </Button>
          </div>
        </div>
      </section>

      {/* Support Topics */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-extrabold text-center mb-12">Common Support Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {supportTopics.map((topic, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4 shadow-md">
                    <topic.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{topic.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{topic.desc}</p>
                  </div>
                </div>
                <ul className="space-y-1 mt-4">
                  {topic.items.map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-800 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-extrabold text-center mb-4">Get in Touch</h2>
          <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-10">
            Can't find what you're looking for? Send us a message and we'll help you out!
          </p>

          <div className="bg-white dark:bg-black p-8 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-1">Name</label>
                  <Input
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Subject</label>
                <Input
                  type="text"
                  placeholder="What can we help you with?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Message</label>
                <textarea
                  placeholder="Please describe your issue or question in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white resize-none h-32"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 rounded-lg shadow-md transition-transform hover:scale-105"
              >
                Send Message
              </Button>
            </form>
            <div className="mt-10 text-center border-t pt-6 text-sm text-gray-600 dark:text-gray-400">
              Or email us directly at{' '}
              <a
                href="mailto:support@gettutorly.com"
                className="text-green-600 hover:text-green-700 dark:hover:text-green-400 font-bold"
              >
                support@gettutorly.com
              </a>
              <p className="mt-2">We typically respond within 24 hours.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

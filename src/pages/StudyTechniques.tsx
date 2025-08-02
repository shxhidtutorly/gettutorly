"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import {
  Clock, Brain, FileText, MapPin, Repeat,
  CheckCircle2, LayoutList, SplitSquareVertical,
  NotebookPen, BookOpenText, ClipboardList
} from "lucide-react";
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Accordion, AccordionContent,
  AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";

const brutalistShadow = "border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]";
const brutalistHover = "hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300 ease-in-out";

const techniques = [
  {
    id: "pomodoro",
    title: "Pomodoro Technique",
    icon: Clock,
    color: "bg-red-600",
    textColor: "text-white",
    description: "Time-boxed focus sessions with strategic breaks.",
    steps: [
      "Pick a task and set 25-minute timer",
      "Work intensely until timer ends",
      "Take 5-minute break",
      "Repeat cycle",
      "Every 4 cycles, take 30-minute break"
    ],
    benefits: [
      "Prevents burnout", "Boosts deep focus", "Easy to follow", "Flexible for any workload"
    ]
  },
  {
    id: "feynman",
    title: "Feynman Technique",
    icon: Brain,
    color: "bg-blue-600",
    textColor: "text-white",
    description: "Explain ideas simply to understand deeply.",
    steps: [
      "Pick a topic", "Teach it to a child", "Review gaps", "Simplify language"
    ],
    benefits: [
      "Deepens comprehension", "Reveals knowledge gaps", "Builds communication skills"
    ]
  },
  {
    id: "mind-mapping",
    title: "Mind Mapping",
    icon: MapPin,
    color: "bg-green-600",
    textColor: "text-white",
    description: "Visualize concepts using branches and bubbles.",
    steps: [
      "Write main topic in center",
      "Add related topics as branches",
      "Use icons/colors for memory",
      "Expand subtopics",
      "Review and rearrange"
    ],
    benefits: [
      "Visual clarity", "Organizes complex topics", "Encourages creative links"
    ]
  },
  {
    id: "spaced-repetition",
    title: "Spaced Repetition",
    icon: Repeat,
    color: "bg-purple-600",
    textColor: "text-white",
    description: "Learn gradually with increasing intervals.",
    steps: [
      "Learn content", "Review after 1 day", "Review after 3 days", "Then a week", "Then monthly"
    ],
    benefits: [
      "Strengthens memory", "Avoids forgetting curve", "Improves long-term retention"
    ]
  },
  {
    id: "active-recall",
    title: "Active Recall",
    icon: CheckCircle2,
    color: "bg-yellow-400",
    textColor: "text-black",
    description: "Test yourself without looking at the material.",
    steps: [
      "Read material", "Close book and recall", "Compare with notes", "Review errors"
    ],
    benefits: [
      "Powerful memory reinforcement", "Simulates real exams", "Efficient revision"
    ]
  },
  {
    id: "cornell",
    title: "Cornell Note-taking",
    icon: LayoutList,
    color: "bg-pink-600",
    textColor: "text-white",
    description: "Structured notes with cues and summaries.",
    steps: [
      "Divide page: cue, notes, summary",
      "Take detailed notes",
      "Add cues/questions later",
      "Summarize at bottom"
    ],
    benefits: [
      "Organized notes", "Built-in review", "Easy recall structure"
    ]
  },
  {
    id: "interleaved",
    title: "Interleaved Practice",
    icon: SplitSquareVertical,
    color: "bg-orange-500",
    textColor: "text-black",
    description: "Switch topics instead of blocking.",
    steps: [
      "Select multiple related topics",
      "Study them in rotation",
      "Force brain to adapt",
      "Reflect on transitions"
    ],
    benefits: [
      "Encourages flexible thinking", "Improves real-world prep"
    ]
  },
  {
    id: "notebook-summarizing",
    title: "Notebook Summarizing",
    icon: NotebookPen,
    color: "bg-cyan-500",
    textColor: "text-black",
    description: "Rewrite complex topics in a summary notebook.",
    steps: [
      "Pick a topic", "Write simplified notes", "Use colors/images", "Organize topics thematically"
    ],
    benefits: [
      "Great for revision", "Boosts synthesis", "Helps exam review"
    ]
  }
];

const features = [
  {
    icon: FileText,
    title: "AI Flashcard Generator",
    desc: "Convert notes or PDFs into smart flashcards."
  },
  {
    icon: BookOpenText,
    title: "Audio Recaps",
    desc: "Listen to AI-generated voice summaries of any topic."
  },
  {
    icon: ClipboardList,
    title: "Daily Smart Planner",
    desc: "AI-curated study schedule based on your learning history."
  }
];

export default function StudyTechniques() {
  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-yellow-400 selection:text-black">
      <Navbar />

      <main className="py-16 px-4 md:px-10">
        <div className="text-center mb-14">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4" style={{ textShadow: '4px 4px 0 #fff' }}>
            MASTER YOUR STUDY FLOW
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-yellow-300 font-bold border-4 border-white p-4 bg-black">
            Explore interactive, science-backed study techniques built to enhance focus and memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
          {techniques.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.id}
                className={`bg-black text-white p-6 ${brutalistShadow} ${brutalistHover}`}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 ${tech.color} ${brutalistShadow}`}>
                    <Icon className={`h-6 w-6 ${tech.textColor}`} />
                  </div>
                  <h2 className="ml-4 text-xl font-black uppercase">{tech.title}</h2>
                </div>
                <p className="mb-4 text-yellow-200">{tech.description}</p>
                <Accordion type="single" collapsible>
                  <AccordionItem value="how">
                    <AccordionTrigger className="text-white">How to use</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-decimal pl-5 space-y-1 text-stone-200">
                        {tech.steps.map((step, i) => <li key={i}>{step}</li>)}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="benefits">
                    <AccordionTrigger className="text-white">Benefits</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 space-y-1 text-stone-200">
                        {tech.benefits.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            );
          })}
        </div>

        {/* Extra Features Section */}
        <section className="py-16 border-t-4 border-white">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center uppercase">
            Study Power Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className={`p-6 bg-white text-black ${brutalistShadow} ${brutalistHover}`}
              >
                <div className="flex items-center mb-4">
                  <Icon className="h-6 w-6 mr-3" strokeWidth={3} />
                  <h3 className="text-xl font-black uppercase">{title}</h3>
                </div>
                <p className="font-bold">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  FileText,
  ClipboardCheck,
  GraduationCap,
  Bot,
  PenLine,
} from "lucide-react";

const tools = [
  {
    icon: <Brain className="w-10 h-10 text-purple-500" />,
    title: "AI Tutor",
    desc: "Get instant help with any topic using our powerful AI tutor.",
  },
  {
    icon: <FileText className="w-10 h-10 text-purple-500" />,
    title: "Smart Summaries",
    desc: "Summarize lengthy PDFs and documents in seconds.",
  },
  {
    icon: <ClipboardCheck className="w-10 h-10 text-purple-500" />,
    title: "Flashcards",
    desc: "Auto-generate flashcards from your study material.",
  },
  {
    icon: <PenLine className="w-10 h-10 text-purple-500" />,
    title: "AI Notes",
    desc: "Organized, readable notes from any content you upload.",
  },
  {
    icon: <GraduationCap className="w-10 h-10 text-purple-500" />,
    title: "Test & Quizzes",
    desc: "Practice with AI-generated quizzes based on your syllabus.",
  },
  {
    icon: <Bot className="w-10 h-10 text-purple-500" />,
    title: "Doubt Chain",
    desc: "Ask follow-up questions and clarify your doubts instantly.",
  },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen w-full bg-[#0A0A0A] text-white font-mono px-6 py-12">
      <section className="max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter uppercase">
            Your AI Learning Dashboard
          </h1>
          <p className="text-md mt-4 text-gray-300 max-w-xl mx-auto">
            Brutalist UI. Fast tools. Everything you need to master your
            subjects.
          </p>
          <Button className="mt-6 bg-purple-500 text-black font-bold text-sm uppercase px-8 py-3 border-2 border-white rounded-none shadow-[4px_4px_0px_0px_#fff] hover:bg-black hover:text-white hover:border-purple-500 transition-all">
            Launch AI Assistant
          </Button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -8,
                rotate: -1,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="bg-black border-2 border-white rounded-none p-6 shadow-[6px_6px_0px_0px_#C084FC] transition-all"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {tool.icon}
                <h3 className="text-xl font-bold">{tool.title}</h3>
                <p className="text-sm text-gray-300">{tool.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}

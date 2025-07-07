"use client"

import type React from "react"
import { motion } from "framer-motion"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

interface ThinkingIndicatorProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ size = "md", text = "Thinking", className }) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div className={cn("flex items-center gap-2", sizeClasses[size], className)}>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-current rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <span>{text}</span>
    </div>
  )
}

export const ThinkingBubble: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-4"
    >
      <div className="max-w-[80%] p-4 rounded-2xl bg-gray-800/80 text-white rounded-bl-md backdrop-blur-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          <span className="text-sm">Thinking...</span>
        </div>
      </div>
    </motion.div>
  )
}

export const CenteredThinkingOverlay: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-gray-700/50"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-white rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <p className="text-white text-sm font-medium">Thinking...</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

interface ThinkingIndicatorProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ size = "md", text = "Thinking", className }) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  const dotSizes = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  }

  return (
    <div className={cn("flex items-center gap-2 text-gray-400", sizeClasses[size], className)}>
      <span>{text}</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("rounded-full bg-gray-400", dotSizes[size])}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
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
    </div>
  )
}

interface ThinkingBubbleProps {
  className?: string
}

export const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("flex justify-start mb-4", className)}
    >
      <div className="max-w-[80%] p-4 rounded-2xl bg-gray-800/80 text-white rounded-bl-md backdrop-blur-sm">
        <ThinkingIndicator size="sm" />
      </div>
    </motion.div>
  )
}

// ChatGPT-style centered thinking overlay
interface CenteredThinkingOverlayProps {
  isVisible: boolean
}

export const CenteredThinkingOverlay: React.FC<CenteredThinkingOverlayProps> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-black/20 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
              />
              <motion.div
                initial={{ opacity: 0.7 }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="text-white text-lg font-medium"
              >
                Thinking
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

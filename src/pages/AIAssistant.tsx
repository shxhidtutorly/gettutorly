import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowUp,
  Paperclip,
  Square,
  X,
  BrainCog,
  FileText,
} from "lucide-react"
import MessageBubble from "./MessageBubble"

// Utility function for className merging
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

// Embedded CSS for minimal custom styles
const styles = `
  *:focus-visible {
    outline-offset: 0 !important;
    --ring-offset: 0 !important;
  }
  textarea::-webkit-scrollbar {
    width: 6px;
  }
  textarea::-webkit-scrollbar-track {
    background: transparent;
  }
  textarea::-webkit-scrollbar-thumb {
    background-color: #444444;
    border-radius: 3px;
  }
  textarea::-webkit-scrollbar-thumb:hover {
    background-color: #555555;
  }
  
  /* Custom scrollbar for chat area */
  .chat-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .chat-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  .chat-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  .chat-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

// Inject styles into document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-base text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none",
      className,
    )}
    ref={ref}
    rows={1}
    {...props}
  />
))
Textarea.displayName = "Textarea"

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-white hover:bg-white/80 text-black",
      outline: "border border-[#444444] bg-transparent hover:bg-[#3A3A40]",
      ghost: "bg-transparent hover:bg-[#3A3A40]",
    }
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
      icon: "h-8 w-8 rounded-full aspect-[1/1]",
    }
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

// Typing Animation Component
interface TypingAnimationProps {
  text: string
  duration?: number
  className?: string
  onComplete?: () => void
  stopTyping?: boolean
}
const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  duration = 200,
  className,
  onComplete,
  stopTyping = false,
}) => {
  const [displayedText, setDisplayedText] = useState<string>("")
  const [i, setI] = useState<number>(0)
  const typingEffectRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (stopTyping) {
      if (typingEffectRef.current) {
        clearInterval(typingEffectRef.current)
      }
      setDisplayedText(text)
      onComplete?.()
      return
    }

    setDisplayedText("")
    setI(0)

    typingEffectRef.current = setInterval(() => {
      setI((prevI) => {
        if (prevI < text.length) {
          setDisplayedText(text.substring(0, prevI + 1))
          return prevI + 1
        } else {
          if (typingEffectRef.current) {
            clearInterval(typingEffectRef.current)
          }
          onComplete?.()
          return prevI
        }
      })
    }, duration)

    return () => {
      if (typingEffectRef.current) {
        clearInterval(typingEffectRef.current)
      }
    }
  }, [text, duration, stopTyping, onComplete])

  return (
    <h1
      className={cn(
        "font-display text-center text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-[-0.02em] drop-shadow-sm",
        className,
      )}
    >
      {displayedText}
    </h1>
  )
}

// Loading Dots Component
const LoadingDots: React.FC = () => (
  <div className="flex items-center space-x-1 px-4 py-2">
    <div className="flex space-x-1">
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  </div>
)

// Custom Divider Component
const CustomDivider: React.FC = () => (
  <div className="relative h-6 w-[1.5px] mx-2">
    <div
      className="absolute inset-0 bg-gradient-to-t from-transparent via-[#9b87f5]/70 to-transparent rounded-full"
      style={{
        clipPath: "polygon(0% 0%, 100% 0%, 100% 40%, 140% 50%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, -40% 50%, 0% 40%)",
      }}
    />
  </div>
)

// Input Component with DeepThink toggle
interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onFileUpload: (files: File[]) => void
  isLoading: boolean
  files: File[]
  onRemoveFile: (index: number) => void
  filePreviews: { [key: string]: string }
  messages: any[]
  isDragOver: boolean
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onFileUpload,
  isLoading,
  files,
  onRemoveFile,
  filePreviews,
  messages,
  isDragOver
}) => {
  const [showThink, setShowThink] = useState(false)
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const placeholders = [
    "Type your message...",
    "Ask anything...",
    "Upload a file to analyze...",
    "Need help with coding?",
    "Want to learn something new?",
  ]

  const firstChatPlaceholders = [
    "Ask Tutorly anything...",
    "What would you like to learn?",
    "Upload files for analysis...",
    "Need help with homework?",
  ]

  const currentPlaceholders = messages.length === 0 ? firstChatPlaceholders : placeholders

  useEffect(() => {
    if (currentPlaceholders.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentPlaceholderIndex((prev) => (prev + 1) % currentPlaceholders.length)
      }, 3000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      setCurrentPlaceholderIndex(0)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentPlaceholders])

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = "auto"
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      onFileUpload(Array.from(selectedFiles))
    }
  }

  const handleSubmitWithThink = () => {
    if (showThink && value.trim()) {
      onChange(`[Think: ${value}]`)
      setShowThink(false)
    }
    onSubmit()
  }

  const hasContent = value.trim() !== "" || files.length > 0

  return (
    <div
      className={cn(
        "rounded-3xl border border-[#444444] bg-[#1F2023] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300",
        isLoading && "border-red-500/70",
        isDragOver && "border-blue-500 bg-blue-500/5"
      )}
    >
      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 p-0 pb-1 transition-all duration-300">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith("image/") && filePreviews[file.name] ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden">
                  <img
                    src={filePreviews[file.name]}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5 opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white">
                  <FileText className="h-4 w-4" />
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="rounded-full bg-black/70 p-0.5 hover:bg-black/90 transition-colors"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Text Input */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="text-base"
        disabled={isLoading}
        placeholder={showThink ? "Think deeply about this..." : currentPlaceholders[currentPlaceholderIndex]}
      />

      {/* Actions Row */}
      <div className="flex items-center justify-between gap-2 p-0 pt-2">
        <div className="flex items-center gap-1">
          {/* File Upload */}
          <button
            onClick={() => uploadInputRef.current?.click()}
            className="flex h-8 w-8 text-[#9CA3AF] cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-600/30 hover:text-[#D1D5DB]"
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5 transition-colors" />
            <input
              ref={uploadInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              accept="image/*,application/pdf,text/*,.doc,.docx"
              multiple
            />
          </button>

          {/* DeepThink Toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setShowThink(!showThink)}
              className={cn(
                "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
                showThink
                  ? "bg-[#8B5CF6]/15 border-[#8B5CF6] text-[#8B5CF6]"
                  : "bg-transparent border-transparent text-[#9CA3AF] hover:text-[#D1D5DB]",
              )}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <motion.div
                  animate={{ rotate: showThink ? 360 : 0, scale: showThink ? 1.1 : 1 }}
                  whileHover={{
                    rotate: showThink ? 360 : 15,
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 300, damping: 10 },
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                >
                  <BrainCog className={cn("w-4 h-4", showThink ? "text-[#8B5CF6]" : "text-inherit")} />
                </motion.div>
              </div>
              <AnimatePresence>
                {showThink && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs overflow-hidden whitespace-nowrap text-[#8B5CF6] flex-shrink-0"
                  >
                    Think
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Send Button */}
        <Button
          variant="default"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full transition-all duration-200",
            hasContent
              ? "bg-white hover:bg-white/80 text-[#1F2023]"
              : "bg-transparent hover:bg-gray-600/30 text-[#9CA3AF] hover:text-[#D1D5DB]",
          )}
          onClick={handleSubmitWithThink}
          disabled={isLoading && !hasContent}
        >
          {isLoading ? (
            <Square className="h-4 w-4 fill-[#1F2023] animate-pulse" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

// Main AIAssistant Component
const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({})
  const [headingState, setHeadingState] = useState<"ask" | "tutorly">("ask")
  const [isDragOver, setIsDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  useEffect(() => {
    if (messages.length > 0 && headingState === "ask") {
      setTimeout(() => setHeadingState("tutorly"), 500)
    }
  }, [messages.length, headingState])

  // File handling
  const isValidFile = (file: File) => {
    const validTypes = [
      "image/jpeg",
      "image/png", 
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    return validTypes.includes(file.type)
  }

  const processFile = (file: File) => {
    if (!isValidFile(file)) {
      console.log("File type not supported. Please upload images, PDFs, or text documents.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      console.log("File too large (max 10MB)")
      return
    }

    setFiles((prev) => [...prev, file])

    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => 
        setFilePreviews((prev) => ({ ...prev, [file.name]: e.target?.result as string }))
      reader.readAsDataURL(file)
    }
  }

  const handleFileUpload = (uploadedFiles: File[]) => {
    uploadedFiles.forEach(processFile)
  }

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index]
    if (fileToRemove && filePreviews[fileToRemove.name]) {
      setFilePreviews((prev) => {
        const newPreviews = { ...prev }
        delete newPreviews[fileToRemove.name]
        return newPreviews
      })
    }
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Drag and drop handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFileUpload(droppedFiles)
  }

  // Paste handling for images
  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          e.preventDefault()
          processFile(file)
          break
        }
      }
    }
  }

  useEffect(() => {
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [])

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSendMessage = async () => {
    if (!input.trim() && files.length === 0) return
    if (isLoading) return

    setIsLoading(true)

    try {
      // Process files for API
      const fileData = await Promise.all(
        files.map(async (file) => {
          if (file.type.startsWith("image/")) {
            const base64 = await convertFileToBase64(file)
            return {
              name: file.name,
              type: file.type,
              base64: base64.split(",")[1],
              preview: base64,
            }
          } else {
            return {
              name: file.name,
              type: file.type,
              size: file.size,
            }
          }
        })
      )

      const filePreviews: { [key: string]: string } = {}
      fileData.forEach((f) => {
        if (f.preview) {
          filePreviews[f.name] = f.preview
        }
      })

      // Check if it's a DeepThink request
      const isThinkRequest = input.startsWith("[Think:")
      const actualInput = isThinkRequest ? input : input.trim()

      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        text: actualInput,
        isUser: true,
        files: files.length > 0 ? files : undefined,
        filePreviews: Object.keys(filePreviews).length > 0 ? filePreviews : undefined,
      }
      setMessages((prev) => [...prev, userMessage])

      // Clear input and files
      setInput("")
      setFiles([])
      setFilePreviews({})

      // Call real API
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: {
            text: actualInput,
            files: fileData,
          },
          model: "gemini",
          isThinking: isThinkRequest,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.response || data.message || "I'm sorry, I couldn't process your request. Please try again."

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          isUser: false,
          isThinking: isThinkRequest,
        },
      ])
    } catch (error) {
      console.error("API Error:", error)
      let errorMessage = "I'm having trouble connecting right now. Please check your internet connection and try again."
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Unable to connect to the server. Please check if the API endpoint is available."
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: errorMessage,
          isUser: false,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard"
  }

  return (
    <div 
      className="flex w-full h-screen bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_30%,rgba(0,0,0,0.9)_100%)]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between p-3 md:p-4">
          <button
            onClick={handleBackToDashboard}
            className="px-2 py-1.5 md:px-3 md:py-2 text-white/60 hover:text-white/90 border border-white/20 rounded-lg shadow transition-all duration-200 hover:bg-white/10 hover:scale-105 bg-white/5 backdrop-blur-sm text-sm md:text-base"
          >
            <span className="mr-1">←</span> Back
          </button>
          <div className="flex-1 flex justify-center px-2">
            <AnimatePresence mode="wait">
              {headingState === "ask" ? (
                <motion.div
                  key="ask"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TypingAnimation
                    text="Ask Tutorly Anything"
                    className="text-xl md:text-2xl lg:text-3xl font-bold text-white"
                    stopTyping={messages.length > 0}
                    duration={100}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="tutorly"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <h1 className="font-display text-center text-xl md:text-2xl lg:text-3xl font-bold text-white">
                    Tutorly
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="w-[60px] md:w-[80px]"></div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex flex-col w-full max-w-4xl mx-auto pt-16 md:pt-20 pb-4 px-2 md:px-4">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto chat-scrollbar mb-4 px-1 md:px-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white/60 px-4">
                <p className="text-base md:text-lg mb-2">Welcome to Tutorly!</p>
                <p className="text-sm">Ask me anything to get started.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4 max-w-3xl mx-auto">
              <AnimatePresence>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </AnimatePresence>
              
              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800/90 rounded-2xl rounded-bl-md p-3">
                    <LoadingDots />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSendMessage}
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
          files={files}
          onRemoveFile={handleRemoveFile}
          filePreviews={filePreviews}
          messages={messages}
          isDragOver={isDragOver}
        />
      </div>
    </div>
  )
}

export default AIAssistant

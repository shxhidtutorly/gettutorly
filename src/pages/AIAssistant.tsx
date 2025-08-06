import React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  ArrowUp,
  Paperclip,
  Square,
  X,
  StopCircle,
  Mic,
  BrainCog,
  FolderIcon as FolderCode,
  FileText,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef, type ElementType, type ComponentPropsWithoutRef } from "react"
import { CenteredThinkingOverlay } from "../components/thinking-indicator"

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
  /* Hide scrollbar for chat messages */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
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

// Tooltip Components
const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-[#333333] bg-[#1F2023] px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Dialog Components
const Dialog = DialogPrimitive.Root
const DialogPortal = DialogPrimitive.Portal
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border border-[#333333] bg-[#1F2023] p-0 shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-full bg-[#2E3033]/80 p-2 hover:bg-[#2E3033] transition-all">
        <X className="h-5 w-5 text-gray-200 hover:text-white" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-gray-100", className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

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

// VoiceRecorder Component
interface VoiceRecorderProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: (duration: number) => void
  visualizerBars?: number
}
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  visualizerBars = 32,
}) => {
  const [time, setTime] = React.useState(0)
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  React.useEffect(() => {
    if (isRecording) {
      onStartRecording()
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      onStopRecording(time)
      setTime(0)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording, time, onStartRecording, onStopRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full transition-all duration-300 py-3",
        isRecording ? "opacity-100" : "opacity-0 h-0",
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="font-mono text-sm text-white/80">{formatTime(time)}</span>
      </div>
      <div className="w-full h-10 flex items-center justify-center gap-0.5 px-4">
        {[...Array(visualizerBars)].map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-white/50 animate-pulse"
            style={{
              height: `${Math.max(15, Math.random() * 100)}%`,
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ImageViewDialog Component
interface ImageViewDialogProps {
  imageUrl: string | null
  onClose: () => void
}
const ImageViewDialog: React.FC<ImageViewDialogProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] md:max-w-[800px]">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-[#1F2023] rounded-2xl overflow-hidden shadow-2xl"
        >
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="Full preview"
            className="w-full max-h-[80vh] object-contain rounded-2xl"
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

// PromptInput Context and Components
interface PromptInputContextType {
  isLoading: boolean
  value: string
  setValue: (value: string) => void
  maxHeight: number | string
  onSubmit?: () => void
  disabled?: boolean
}
const PromptInputContext = React.createContext<PromptInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
})
function usePromptInput() {
  const context = React.useContext(PromptInputContext)
  if (!context) throw new Error("usePromptInput must be used within a PromptInput")
  return context
}

interface PromptInputProps {
  isLoading?: boolean
  value?: string
  onValueChange?: (value: string) => void
  maxHeight?: number | string
  onSubmit?: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      className,
      isLoading = false,
      maxHeight = 240,
      value,
      onValueChange,
      onSubmit,
      children,
      disabled = false,
      onDragOver,
      onDragLeave,
      onDrop,
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || "")
    const handleChange = (newValue: string) => {
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }
    return (
      <TooltipProvider>
        <PromptInputContext.Provider
          value={{
            isLoading,
            value: value ?? internalValue,
            setValue: onValueChange ?? handleChange,
            maxHeight,
            onSubmit,
            disabled,
          }}
        >
          <div
            ref={ref}
            className={cn(
              "rounded-3xl border border-[#444444] bg-[#1F2023] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300",
              isLoading && "border-red-500/70",
              className,
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {children}
          </div>
        </PromptInputContext.Provider>
      </TooltipProvider>
    )
  },
)
PromptInput.displayName = "PromptInput"

interface PromptInputTextareaProps {
  disableAutosize?: boolean
  placeholders?: string[]
}
const PromptInputTextarea: React.FC<PromptInputTextareaProps & React.ComponentProps<typeof Textarea>> = ({
  className,
  onKeyDown,
  disableAutosize = false,
  placeholders = ["Type your message here..."],
  ...props
}) => {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput()
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (placeholders.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
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
  }, [placeholders])

  React.useEffect(() => {
    if (disableAutosize || !textareaRef.current) return
    textareaRef.current.style.height = "auto"
    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`
  }, [value, maxHeight, disableAutosize])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit?.()
    }
    onKeyDown?.(e)
  }

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className={cn("text-base", className)}
      disabled={disabled}
      placeholder={placeholders[currentPlaceholderIndex]}
      {...props}
    />
  )
}

interface PromptInputActionsProps extends React.HTMLAttributes<HTMLDivElement> {}
const PromptInputActions: React.FC<PromptInputActionsProps> = ({ children, className, ...props }) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
)

interface PromptInputActionProps extends React.ComponentProps<typeof Tooltip> {
  tooltip: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}
const PromptInputAction: React.FC<PromptInputActionProps> = ({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}) => {
  const { disabled } = usePromptInput()
  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild disabled={disabled}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

// Custom Divider Component
const CustomDivider: React.FC = () => (
  <div className="relative h-6 w-[1.5px]">
    <div
      className="absolute inset-0 bg-gradient-to-t from-transparent via-[#9b87f5]/70 to-transparent rounded-full"
      style={{
        clipPath: "polygon(0% 0%, 100% 0%, 100% 40%, 140% 50%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, -40% 50%, 0% 40%)",
      }}
    />
  </div>
)

interface TypingAnimationProps {
  text: string
  duration?: number
  className?: string
  onComplete?: () => void
  stopTyping?: boolean
}

export function TypingAnimation({
  text,
  duration = 200,
  className,
  onComplete,
  stopTyping = false,
}: TypingAnimationProps) {
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
        "font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm",
        className,
      )}
    >
      {displayedText}
    </h1>
  )
}

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  speed?: string
  className?: string
  children: React.ReactNode
}

export function StarBorder<T extends ElementType = "button">({
  as,
  className,
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || "button"
  const defaultColor = color || "hsl(var(--foreground))"

  return (
    <Component className={cn("relative inline-block py-[1px] overflow-hidden rounded-[20px]", className)} {...props}>
      <div
        className={cn(
          "absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0",
          "opacity-20 dark:opacity-70",
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          "absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0",
          "opacity-20 dark:opacity-70",
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          "relative z-1 border text-foreground text-center text-base py-4 px-6 rounded-[20px]",
          "bg-gradient-to-b from-background/90 to-muted/90 border-border/40",
          "dark:from-background dark:to-muted dark:border-border",
        )}
      >
        {children}
      </div>
    </Component>
  )
}

// Main PromptInputBox Component
interface PromptInputBoxProps {
  onSend?: (message: string, files?: File[]) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}
export const PromptInputBox = React.forwardRef((props: PromptInputBoxProps, ref: React.Ref<HTMLDivElement>) => {
  const { onSend = () => {}, isLoading = false, placeholder = "Type your message here...", className } = props
  const [input, setInput] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])
  const [filePreviews, setFilePreviews] = React.useState<{ [key: string]: string }>({})
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [isRecording, setIsRecording] = React.useState(false)
  const [showThink, setShowThink] = React.useState(false)
  const [showCanvas, setShowCanvas] = React.useState(false)
  const uploadInputRef = React.useRef<HTMLInputElement>(null)
  const promptBoxRef = React.useRef<HTMLDivElement>(null)
  const { messages = [], setMessages, isThinking, setIsThinking } = props as any

  const defaultPlaceholders = [
    "Ask Tutorly Anything...",
    "What is the capital of France?",
    "Explain quantum physics simply.",
    "How do I write a good essay?",
    "Solve for x: 2x + 5 = 11",
  ]

  const handleToggleChange = (value: string) => {
    if (value === "think") {
      setShowThink((prev) => !prev)
      setShowCanvas(false)
    } else if (value === "canvas") {
      setShowCanvas((prev) => !prev)
      setShowThink(false)
    }
  }

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
      reader.onload = (e) => setFilePreviews((prev) => ({ ...prev, [file.name]: e.target?.result as string }))
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFiles = Array.from(e.dataTransfer.files)
    droppedFiles.forEach((file) => processFile(file))
  }, [])

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

  const openImageModal = (imageUrl: string) => setSelectedImage(imageUrl)

  const handlePaste = React.useCallback((e: ClipboardEvent) => {
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
  }, [])

  React.useEffect(() => {
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [handlePaste])

  const handleSubmit = () => {
    if (input.trim() || files.length > 0) {
      let messagePrefix = ""
      let isCanvasMode = false

      if (showThink) {
        messagePrefix = "[Think: "
        setIsThinking(true)
      } else if (showCanvas) {
        messagePrefix = "[Canvas: "
        isCanvasMode = true
      }

      const formattedInput = messagePrefix ? `${messagePrefix}${input}]` : input

      onSend(formattedInput, files, { isCanvas: isCanvasMode, isThinking: showThink })
      setInput("")
      setFiles([])
      setFilePreviews({})
      setShowThink(false)
      setShowCanvas(false)
    }
  }

  const handleStartRecording = () => console.log("Started recording")

  const handleStopRecording = (duration: number) => {
    console.log(`Stopped recording after ${duration} seconds`)
    setIsRecording(false)
    const voiceMessage: any = {
      id: Date.now().toString(),
      text: `[Voice message - ${duration} seconds]`,
      isUser: true,
    }
    onSend(`[Voice message - ${duration} seconds]`, [])
  }

  const hasContent = input.trim() !== "" || files.length > 0

  return (
    <>
      <PromptInput
        value={input}
        onValueChange={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        className={cn(
          "w-full bg-[#1F2023] border-[#444444] shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300 ease-in-out",
          isRecording && "border-red-500/70",
          className,
        )}
        disabled={isLoading || isRecording}
        ref={ref || promptBoxRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length > 0 && !isRecording && (
          <div className="flex flex-wrap gap-2 p-0 pb-1 transition-all duration-300">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                {file.type.startsWith("image/") && filePreviews[file.name] ? (
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                    onClick={() => openImageModal(filePreviews[file.name])}
                  >
                    <img
                      src={filePreviews[file.name] || "/placeholder.svg"}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile(index)
                      }}
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
                      onClick={() => handleRemoveFile(index)}
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

        <div
          className={cn("transition-all duration-300", isRecording ? "h-0 overflow-hidden opacity-0" : "opacity-100")}
        >
          <PromptInputTextarea
            placeholders={
              messages.length > 0
                ? ["Type your next message..."]
                : showThink
                  ? ["Think deeply about this..."]
                  : showCanvas
                    ? ["Create code on canvas..."]
                    : defaultPlaceholders
            }
            className="text-base"
          />
        </div>

        {isRecording && (
          <VoiceRecorder
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        )}

        <PromptInputActions className="flex items-center justify-between gap-2 p-0 pt-2">
          <div
            className={cn(
              "flex items-center gap-1 transition-opacity duration-300",
              isRecording ? "opacity-0 invisible h-0" : "opacity-100 visible",
            )}
          >
            <PromptInputAction tooltip="Upload files (Images, PDFs, Documents)">
              <button
                onClick={() => uploadInputRef.current?.click()}
                className="flex h-8 w-8 text-[#9CA3AF] cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-600/30 hover:text-[#D1D5DB]"
                disabled={isRecording}
              >
                <Paperclip className="h-5 w-5 transition-colors" />
                <input
                  ref={uploadInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      Array.from(e.target.files).forEach((file) => processFile(file))
                    }
                    if (e.target) e.target.value = ""
                  }}
                  accept="image/*,application/pdf,text/*,.doc,.docx"
                  multiple
                />
              </button>
            </PromptInputAction>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleChange("think")}
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

              <CustomDivider />

              <button
                type="button"
                onClick={() => handleToggleChange("canvas")}
                className={cn(
                  "rounded-full transition-all flex items-center gap-1 px-2 py-1 border h-8",
                  showCanvas
                    ? "bg-[#F97316]/15 border-[#F97316] text-[#F97316]"
                    : "bg-transparent border-transparent text-[#9CA3AF] hover:text-[#D1D5DB]",
                )}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <motion.div
                    animate={{ rotate: showCanvas ? 360 : 0, scale: showCanvas ? 1.1 : 1 }}
                    whileHover={{
                      rotate: showCanvas ? 360 : 15,
                      scale: 1.1,
                      transition: { type: "spring", stiffness: 300, damping: 10 },
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  >
                    <FolderCode className={cn("w-4 h-4", showCanvas ? "text-[#F97316]" : "text-inherit")} />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showCanvas && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs overflow-hidden whitespace-nowrap text-[#F97316] flex-shrink-0"
                    >
                      Canvas
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          <PromptInputAction
            tooltip={
              isLoading
                ? "Stop generation"
                : isRecording
                  ? "Stop recording"
                  : hasContent
                    ? "Send message"
                    : "Voice message"
            }
          >
            <Button
              variant="default"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                isRecording
                  ? "bg-transparent hover:bg-gray-600/30 text-red-500 hover:text-red-400"
                  : hasContent
                    ? "bg-white hover:bg-white/80 text-[#1F2023]"
                    : "bg-transparent hover:bg-gray-600/30 text-[#9CA3AF] hover:text-[#D1D5DB]",
              )}
              onClick={() => {
                if (isRecording) setIsRecording(false)
                else if (hasContent) handleSubmit()
                else setIsRecording(true)
              }}
              disabled={isLoading && !hasContent}
            >
              {isLoading ? (
                <Square className="h-4 w-4 fill-[#1F2023] animate-pulse" />
              ) : isRecording ? (
                <StopCircle className="h-5 w-5 text-red-500" />
              ) : hasContent ? (
                <ArrowUp className="h-4 w-4 text-[#1F2023]" />
              ) : (
                <Mic className="h-5 w-5 text-[#1F2023] transition-colors" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>

      <ImageViewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  )
})
PromptInputBox.displayName = "PromptInputBox"

const AIAssistant = () => {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  const handleSendMessage = async (
    message: string,
    files?: File[],
    options?: { isCanvas?: boolean; isThinking?: boolean },
  ) => {
    if (!message.trim() || isLoading) return

    setIsLoading(true)
    if (options?.isThinking) {
      setIsThinking(true)
    }

    try {
      const fileData = await Promise.all(
        (files || []).map(async (file) => {
          if (file.type.startsWith("image/")) {
            const base64 = await convertFileToBase64(file)
            return {
              name: file.name,
              type: file.type,
              base64: base64.split(",")[1],
              preview: base64,
            }
          } else {
            // For non-image files, just include metadata
            return {
              name: file.name,
              type: file.type,
              size: file.size,
            }
          }
        }),
      )

      const filePreviews: { [key: string]: string } = {}
      fileData.forEach((f) => {
        if (f.preview) {
          filePreviews[f.name] = f.preview
        }
      })

      const userMessage: any = {
        id: Date.now().toString(),
        text: message.trim(),
        isUser: true,
        files,
        filePreviews,
      }
      setMessages((prev) => [...prev, userMessage])

      // Simulate API delay for thinking effect
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: {
            text: message.trim(),
            files: fileData,
          },
          model: "gemini",
          isCanvas: options?.isCanvas,
        }),
      })

      const data = await response.json()
      let aiResponse = data.response || data.message || "I understand your request. Let me help you with that."

      // Generate real code based on the request for canvas mode
      if (options?.isCanvas) {
        if (message.toLowerCase().includes("html") || message.toLowerCase().includes("canvas")) {
          aiResponse = `Here's a simple HTML canvas example that draws shapes and text:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Canvas Drawing Example</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
        }
        canvas {
            border: 2px solid #333;
            border-radius: 8px;
            background-color: white;
        }
    </style>
</head>
<body>
    <h1>HTML5 Canvas Drawing</h1>
    <canvas id="myCanvas" width="400" height="300"></canvas>
    
    <script>
        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');
        
        // Draw a rectangle
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(50, 50, 100, 80);
        
        // Draw a circle
        ctx.beginPath();
        ctx.arc(250, 90, 40, 0, 2 * Math.PI);
        ctx.fillStyle = '#4ECDC4';
        ctx.fill();
        
        // Draw text
        ctx.font = '20px Arial';
        ctx.fillStyle = '#45B7D1';
        ctx.fillText('Hello Canvas!', 120, 200);
        
        // Draw a line
        ctx.beginPath();
        ctx.moveTo(50, 250);
        ctx.lineTo(350, 250);
        ctx.strokeStyle = '#96CEB4';
        ctx.lineWidth = 3;
        ctx.stroke();
    </script>
</body>
</html>
\`\`\``
        } else if (message.toLowerCase().includes("react")) {
          aiResponse = `Here's a React component with interactive functionality:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function InteractiveCounter() {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState([]);

  const handleIncrement = () => {
    setIsAnimating(true);
    setCount(prev => prev + 1);
    setHistory(prev => [...prev, 'increment']);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const handleDecrement = () => {
    setIsAnimating(true);
    setCount(prev => prev - 1);
    setHistory(prev => [...prev, 'decrement']);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const handleReset = () => {
    setCount(0);
    setHistory([]);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Interactive Counter</h2>
      
      <div className={\`text-6xl font-bold text-center mb-6 transition-transform duration-200 \${isAnimating ? 'scale-110' : 'scale-100'}\`}>
        {count}
      </div>
      
      <div className="flex gap-3 justify-center mb-4">
        <button 
          onClick={handleDecrement}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Decrement
        </button>
        <button 
          onClick={handleReset}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Reset
        </button>
        <button 
          onClick={handleIncrement}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Increment
        </button>
      </div>
      
      {history.length > 0 && (
        <div className="text-sm text-gray-600">
          <p>Last actions: {history.slice(-3).join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default InteractiveCounter;
\`\`\``
        } else {
          // Default code example for canvas mode
          aiResponse = `Here's a versatile code example based on your request:

\`\`\`javascript
// Dynamic content generator
class ContentGenerator {
  constructor() {
    this.templates = {
      greeting: ['Hello', 'Hi', 'Welcome', 'Greetings'],
      actions: ['create', 'build', 'generate', 'develop'],
      subjects: ['app', 'website', 'component', 'feature']
    };
  }
  
  generate(type = 'greeting') {
    const options = this.templates[type] || this.templates.greeting;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  createMessage() {
    return \`\${this.generate('greeting')}! Let's \${this.generate('actions')} an amazing \${this.generate('subjects')}.\`;
  }
}

// Usage example
const generator = new ContentGenerator();
console.log(generator.createMessage());

// Interactive demo
document.addEventListener('DOMContentLoaded', () => {
  const button = document.createElement('button');
  button.textContent = 'Generate Message';
  button.onclick = () => alert(generator.createMessage());
  document.body.appendChild(button);
});
\`\`\``
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          isUser: false,
          isCanvas: options?.isCanvas,
        },
      ])
    } catch (error) {
      let errorMessage = "Something went wrong."
      if (error instanceof Error) errorMessage += " " + error.message

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
      setIsThinking(false)
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard"
  }

  const [headingState, setHeadingState] = useState<"ask" | "tutorly">("ask")

  useEffect(() => {
    if (messages.length > 0 && headingState === "ask") {
      // Smooth transition to "Tutorly" when first message is sent
      setTimeout(() => setHeadingState("tutorly"), 500)
    }
  }, [messages.length, headingState])

  const renderMessageContent = (msg: any) => {
    const parts = parseCodeBlocks(msg.text)

    return (
      <div>
        {parts.map((part, index) => {
          if (part.type === "code") {
            return <CodeBlock key={index} code={part.content} language={part.language} isCanvas={msg.isCanvas} />
          } else {
            return (
              <div key={index} className="whitespace-pre-wrap">
                {part.content}
              </div>
            )
          }
        })}
      </div>
    )
  }

  return (
    <div className="flex w-full h-screen bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_30%,rgba(0,0,0,0.9)_100%)]">
      {/* ChatGPT-style centered thinking overlay */}
      <CenteredThinkingOverlay isVisible={isThinking} />

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between p-3 md:p-4">
          <button
            onClick={handleBackToDashboard}
            className="px-2 py-1.5 md:px-3 md:py-2 text-white/40 hover:text-white/80 border border-white/20 rounded-lg shadow transition-all duration-200 hover:bg-white/10 hover:scale-105 bg-white/5 backdrop-blur-sm text-sm md:text-base"
            style={{
              fontWeight: 500,
              background: "rgba(255, 255, 255, 0.05)",
              opacity: 0.6,
            }}
          >
            <span style={{ fontSize: "1.2em" }}>←</span> Back to Dashboard
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
          <div className="w-[100px] md:w-[140px]"></div>
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
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex", msg.isUser ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[90%] md:max-w-[85%] p-3 md:p-4 rounded-2xl break-words text-sm md:text-base",
                        msg.isUser
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-gray-800/80 text-white rounded-bl-md backdrop-blur-sm",
                      )}
                    >
                      {renderMessageContent(msg)}
                      {msg.files && msg.files.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {msg.files.map((file: File, idx: number) => {
                            const preview = msg.filePreviews?.[file.name]

                            // Image preview
                            if (file.type.startsWith("image/") && preview) {
                              return (
                                <img
                                  key={idx}
                                  src={preview || "/placeholder.svg"}
                                  alt={file.name}
                                  className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                />
                              )
                            }

                            // Generic link preview (PDF, DOCX, etc.)
                            return (
                              <a
                                key={idx}
                                href={preview ?? "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white hover:bg-gray-700/70 transition-colors"
                              >
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate max-w-[120px]">{file.name}</span>
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Prompt Input Area */}
        <PromptInputBox
          onSend={handleSendMessage}
          isLoading={isLoading}
          messages={messages}
          setMessages={setMessages}
          isThinking={isThinking}
          setIsThinking={setIsThinking}
        />
      </div>
    </div>
  )
}

export default AIAssistant

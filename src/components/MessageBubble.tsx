import React, { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Copy, Check, FileText, X } from "lucide-react"

// Utility function for className merging
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

// Simple Tooltip Component
interface TooltipProps {
  content: string
  children: React.ReactNode
}
const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false)
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  )
}

// Code Block Component with Copy functionality
interface CodeBlockProps {
  code: string
  language: string
  isCanvas?: boolean
}
const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, isCanvas = false }) => {
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // HTML/Canvas rendering
  if ((language === 'html' || language === 'canvas' || isCanvas) && (language === 'html' || code.includes('<html') || code.includes('canvas'))) {
    return (
      <div className="my-4 border border-gray-600 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
          <span className="text-sm text-gray-300">HTML Preview</span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <Tooltip content={copied ? "Copied!" : "Copy code"}>
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </Tooltip>
          </div>
        </div>
        
        {showPreview && (
          <div className="border-t border-gray-600">
            <iframe
              srcDoc={code}
              className="w-full h-64 border-none"
              title="HTML Preview"
              sandbox="allow-scripts"
            />
          </div>
        )}
        
        <div className="bg-gray-900">
          <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    )
  }

  // Mermaid Diagram rendering
  if (language === 'mermaid') {
    return (
      <div className="my-4 border border-gray-600 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
          <span className="text-sm text-gray-300">Mermaid Diagram</span>
          <Tooltip content={copied ? "Copied!" : "Copy code"}>
            <button
              onClick={handleCopy}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </Tooltip>
        </div>
        <div className="bg-white p-4 flex items-center justify-center min-h-[200px]">
          <div 
            className="mermaid text-center"
            dangerouslySetInnerHTML={{ __html: `<pre class="mermaid">${code}</pre>` }}
          />
        </div>
      </div>
    )
  }

  // LaTeX rendering
  if (language === 'latex' || language === 'tex') {
    return (
      <div className="my-4 border border-gray-600 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
          <span className="text-sm text-gray-300">LaTeX Formula</span>
          <Tooltip content={copied ? "Copied!" : "Copy code"}>
            <button
              onClick={handleCopy}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </Tooltip>
        </div>
        <div className="bg-white p-4 text-center">
          <div dangerouslySetInnerHTML={{ __html: `$$${code}$$` }} />
        </div>
      </div>
    )
  }

  // Regular code block with syntax highlighting
  return (
    <div className="my-4 border border-gray-600 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-sm text-gray-300">{language || 'code'}</span>
        <Tooltip content={copied ? "Copied!" : "Copy code"}>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </Tooltip>
      </div>
      <div className="bg-gray-900">
        <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  )
}

// Parse code blocks from text
const parseCodeBlocks = (text: string) => {
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = []
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index).trim()
      if (textContent) {
        parts.push({ type: 'text', content: textContent })
      }
    }

    // Add the code block
    parts.push({
      type: 'code',
      content: match[2].trim(),
      language: match[1] || 'text'
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const textContent = text.slice(lastIndex).trim()
    if (textContent) {
      parts.push({ type: 'text', content: textContent })
    }
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }]
}

// Image View Modal
interface ImageViewModalProps {
  imageUrl: string | null
  onClose: () => void
}
const ImageViewModal: React.FC<ImageViewModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <img
          src={imageUrl}
          alt="Full preview"
          className="w-full h-full object-contain"
        />
      </motion.div>
    </motion.div>
  )
}

// Main MessageBubble Component
interface MessageBubbleProps {
  message: {
    id: string
    text: string
    isUser: boolean
    files?: File[]
    filePreviews?: { [key: string]: string }
    isCanvas?: boolean
  }
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const renderMessageContent = () => {
    const parts = parseCodeBlocks(message.text)

    return (
      <div>
        {parts.map((part, index) => {
          if (part.type === 'code') {
            return (
              <CodeBlock 
                key={index} 
                code={part.content} 
                language={part.language || 'text'} 
                isCanvas={message.isCanvas} 
              />
            )
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={cn("flex", message.isUser ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl break-words text-sm md:text-base",
            message.isUser
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-gray-800/90 text-white rounded-bl-md backdrop-blur-sm",
          )}
        >
          {renderMessageContent()}
          
          {/* File Previews */}
          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.files.map((file: File, idx: number) => {
                const preview = message.filePreviews?.[file.name]

                // Image preview
                if (file.type.startsWith("image/") && preview) {
                  return (
                    <img
                      key={idx}
                      src={preview}
                      alt={file.name}
                      className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedImage(preview)}
                    />
                  )
                }

                // Generic file preview
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{file.name}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Image View Modal */}
      {selectedImage && (
        <ImageViewModal 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </>
  )
}

export default MessageBubble

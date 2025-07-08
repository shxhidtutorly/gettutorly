"use client"

import type React from "react"
import { useState, useRef } from "react"
import Highlight, { defaultProps, type Language } from "prism-react-renderer"
import Editor from "@monaco-editor/react"
import { Copy, Maximize2, Minimize2, Download, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ")

// lightweight dark theme – avoids external sub-path import
const prismTheme = {
  plain: {
    color: "#d4d4d4",
    backgroundColor: "transparent",
  },
  styles: [
    { types: ["comment", "prolog", "doctype", "cdata"], style: { color: "#6A9955" } },
    { types: ["punctuation"], style: { color: "#D4D4D4" } },
    { types: ["keyword"], style: { color: "#C586C0" } },
    { types: ["string"], style: { color: "#CE9178" } },
    { types: ["function"], style: { color: "#DCDCAA" } },
    { types: ["number", "boolean"], style: { color: "#B5CEA8" } },
    { types: ["operator"], style: { color: "#D4D4D4" } },
  ],
} as const

interface CodeBlockProps {
  code: string
  language: string
  filename?: string
  isCanvas?: boolean
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, filename, isCanvas = false }) => {
  const [isExpanded, setIsExpanded] = useState(isCanvas)
  const [copied, setCopied] = useState(false)
  const [editorCode, setEditorCode] = useState(code)
  const editorRef = useRef<any>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editorCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([editorCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename || `code.${getFileExtension(language)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileExtension = (lang: string) => {
    const extensions: { [key: string]: string } = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
      html: "html",
      css: "css",
      json: "json",
      xml: "xml",
      sql: "sql",
      bash: "sh",
      shell: "sh",
      powershell: "ps1",
    }
    return extensions[lang.toLowerCase()] || "txt"
  }

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  return (
    <div className="my-4 rounded-lg border border-gray-700 bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm text-gray-300 ml-2">{filename || `${language} code`}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Download code"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title={isExpanded ? "Minimize" : "Expand to canvas"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="editor"
            initial={{ height: 200, opacity: 0 }}
            animate={{ height: 400, opacity: 1 }}
            exit={{ height: 200, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <Editor
              height="400px"
              language={language}
              value={editorCode}
              onChange={(value) => setEditorCode(value || "")}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="syntax"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-x-auto"
          >
            <Highlight code={code} language={language as Language} theme={prismTheme}>
              {({ className: cls, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={`${cls} p-4 text-sm leading-relaxed`} style={{ ...style, background: "transparent" }}>
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line, key: i })}>
                      <span className="select-none opacity-40 mr-4">{i + 1}</span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token, key })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Utility function to detect code blocks in text
export const parseCodeBlocks = (text: string) => {
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      })
    }

    // Add code block
    parts.push({
      type: "code",
      language: match[1] || "text",
      content: match[2].trim(),
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    })
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }]
}

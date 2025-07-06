// src/components/CodeBlock.tsx
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface CodeBlockProps {
  code: string;
  language: string; // e.g., 'javascript', 'python', 'typescript', 'html', 'css'
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset "copied" state after 2 seconds
  };

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden my-4 shadow-lg text-sm">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-900 text-gray-300">
        <span className="text-xs font-mono uppercase">{language || 'plaintext'}</span>
        <CopyToClipboard text={code} onCopy={handleCopy}>
          <button
            className="flex items-center space-x-1 p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200"
            aria-label={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </CopyToClipboard>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={materialDark}
          showLineNumbers={true}
          customStyle={{
            margin: 0,
            padding: '1em',
            backgroundColor: 'transparent', // Ensure it blends with parent bg
          }}
          codeTagProps={{
            style: {
              fontFamily: 'monospace',
              fontSize: '0.875em', // text-sm
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;

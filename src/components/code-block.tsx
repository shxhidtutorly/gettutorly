import React from 'react';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/vsDark';

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, className = '' }) => {
  return (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={code}
      language={language as any}
    >
      {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${highlightClassName} ${className} p-4 rounded-lg overflow-x-auto`} style={style}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

export const parseCodeBlocks = (text: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    // Add code block
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2].trim()
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  return parts;
};
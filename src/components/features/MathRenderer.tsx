
import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  content: string;
}

const MathRenderer = ({ content }: MathRendererProps) => {
  const processedContent = useMemo(() => {
    // Split content by LaTeX delimiters
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const math = part.slice(2, -2);
        return (
          <div key={index} className="my-4">
            <BlockMath math={math} />
          </div>
        );
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        const math = part.slice(1, -1);
        return <InlineMath key={index} math={math} />;
      } else {
        // Regular text - preserve line breaks
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      }
    });
  }, [content]);

  return <div className="math-content">{processedContent}</div>;
};

export default MathRenderer;

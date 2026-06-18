import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * Preprocesses markdown text to convert standard LaTeX delimiters like \(...\) and \[...\]
 * to standard markdown-math delimiters $...$ and $$...$$.
 * Skips code blocks and inline code blocks to avoid unwanted replacements.
 */
const preprocessMathDelimiters = (text) => {
  if (!text) return text;
  
  // Split the text by code blocks (```) and inline code (`) to avoid replacing math delimiters inside them
  const parts = text.split(/(```[\s\S]*?```|`[^`\n]*?`)/g);
  
  return parts.map((part) => {
    if (part.startsWith('```') || part.startsWith('`')) {
      return part;
    }
    return part
      .replace(/\\\\\(/g, '$')
      .replace(/\\\\\)/g, '$')
      .replace(/\\\(/g, '$')
      .replace(/\\\)/g, '$')
      .replace(/\\\\\[/g, '$$$$')
      .replace(/\\\\\]/g, '$$$$')
      .replace(/\\\[/g, '$$$$')
      .replace(/\\\]/g, '$$$$');
  }).join('');
};

const MathMarkdown = ({ content, components, className }) => {
  const processedContent = preprocessMathDelimiters(content);

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {processedContent || ''}
      </ReactMarkdown>
    </div>
  );
};

export default MathMarkdown;

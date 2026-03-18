import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renders text with optional inline math via \(...\) delimiters.
 * Falls back to plain text if KaTeX fails or no math present.
 */
export function MathText({ text, className, as: _Tag = 'span' }) {
  const content = useMemo(() => {
    if (!text || typeof text !== 'string') return text;
    const parts = [];
    let remaining = text;
    const regex = /\\\((.+?)\\\)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: remaining.slice(lastIndex, match.index) });
      }
      try {
        const html = katex.renderToString(match[1], { throwOnError: false, displayMode: false });
        parts.push({ type: 'math', value: html });
      } catch {
        parts.push({ type: 'text', value: match[0] });
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < remaining.length) {
      parts.push({ type: 'text', value: remaining.slice(lastIndex) });
    }
    if (parts.length === 0) parts.push({ type: 'text', value: text });
    return parts;
  }, [text]);

  if (!content || (Array.isArray(content) && content.length === 0)) return null;
  if (typeof content === 'string') return <_Tag className={className}>{content}</_Tag>;

  return (
    <_Tag className={className}>
      {content.map((part, i) =>
        part.type === 'math' ? (
          <span key={i} dangerouslySetInnerHTML={{ __html: part.value }} />
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </_Tag>
  );
}

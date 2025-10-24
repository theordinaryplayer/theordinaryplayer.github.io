'use client';

import React, { useEffect, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    setHtmlContent(processMarkdownContent(content));
  }, [content]);

  const processMarkdownContent = (text: string): string => {
    // Handle code blocks first to preserve them during other processing
    let processedText = text;

    // Handle code blocks (triple backticks)
    processedText = processedText.replace(/```([\s\S]*?)```/g, (match, code) => {
      const lines = code.split('\n');
      // Get language from the first line if it exists
      let language = '';
      let actualCode = code;
      
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        // Check if the first line looks like a language identifier (no spaces, short length)
        if (firstLine && !firstLine.includes(' ') && firstLine.length < 20 && !firstLine.startsWith('<')) {
          language = firstLine;
          actualCode = lines.slice(1).join('\n');
        }
      }
      
      // Sanitize the code content to remove any dangerous code
      const sanitizedCode = escapeHtml(actualCode);
      
      return `
        <div class="my-4 rounded-md overflow-hidden border border-border bg-card">
          <div class="bg-muted/50 px-4 py-2 text-sm font-medium border-b border-border flex justify-between items-center">
            <span class="text-muted-foreground uppercase">${language || 'Code'}</span>
          </div>
          <pre class="p-4 overflow-x-auto max-w-full">
            <code class="text-sm language-${language}">${sanitizedCode}</code>
          </pre>
        </div>
      `;
    });

    // Handle inline code (single backticks)
    processedText = processedText.replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>');

    // Sanitize the rest of the content to remove potentially dangerous code
    processedText = sanitizeContent(processedText);

    // Handle headings
    processedText = processedText.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 mt-6">$1</h1>');
    processedText = processedText.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-3 mt-5">$1</h2>');
    processedText = processedText.replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-2 mt-4">$1</h3>');

    // Handle bold and italic
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle links
    processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Handle lists
    processedText = processedText.replace(/^\s*[-*]\s(.+)$/gm, '<li class="ml-4 mb-1">$1</li>');
    processedText = processedText.replace(/(<li[^>]*>.*<\/li>)/gs, (match) => {
      if (match.includes('<ul>') || match.includes('</ul>')) return match;
      return `<ul class="list-disc mb-4">${match}</ul>`;
    });

    // Handle numbered lists
    processedText = processedText.replace(/^\s*\d+\.\s(.+)$/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>');
    
    // Handle paragraphs
    processedText = processedText.split('\n\n').map(paragraph => {
      if (paragraph.trim() === '') return '';
      if (paragraph.startsWith('<') && paragraph.endsWith('>')) {
        return paragraph;
      }
      // Don't wrap code blocks in paragraphs
      if (paragraph.startsWith('<pre') && paragraph.endsWith('</pre>')) {
        return paragraph;
      }
      return `<p class="mb-4">${paragraph}</p>`;
    }).filter(p => p !== '').join('');

    return processedText;
  };

  // Enhanced content sanitization to remove potentially dangerous content
  const sanitizeContent = (content: string): string => {
    // First escape HTML entities
    let sanitized = escapeHtml(content);
    
    // Remove potentially dangerous patterns
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^>]*>.*?<\/iframe>/gi,
      /<object\b[^>]*>.*?<\/object>/gi,
      /<embed\b[^>]*>.*?<\/embed>/gi,
      /<form\b[^>]*>.*?<\/form>/gi,
      /<input\b[^>]*>/gi,
      /document\.cookie/gi,
      /document\.location/gi,
      /window\.location/gi,
      /eval\(/gi,
      /alert\(/gi,
      /confirm\(/gi,
      /prompt\(/gi,
    ];
    
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Use DOMPurify to sanitize the content
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'div', 'span',
        'a', 'br', 'hr',
        'strong', 'b', 'em', 'i', 'u', 's',
        'ul', 'ol', 'li',
        'blockquote',
        'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'img',
        'dl', 'dt', 'dd'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'style',
        'target', 'rel',
        'width', 'height'
      ],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['on*', 'srcdoc', 'data', 'href']
    });
    
    return sanitized;
  };

  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return (
    <div 
      className="prose prose-lg prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

export default MarkdownRenderer;
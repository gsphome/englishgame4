/**
 * HTML Sanitization utilities for security
 * Prevents XSS attacks by sanitizing HTML content
 */

import React from "react";

interface SanitizedHTML {
  __html: string;
}

/**
 * Allowed HTML tags and attributes for quiz content
 */
const ALLOWED_TAGS = ['span', 'strong', 'em', 'b', 'i'];
const ALLOWED_ATTRIBUTES = ['class'];

/**
 * Sanitize HTML content by removing dangerous elements and attributes
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocols (except safe ones)
  sanitized = sanitized.replace(/data:(?!image\/(?:png|jpg|jpeg|gif|svg\+xml))[^;]*/gi, '');
  
  // Remove dangerous tags
  const dangerousTags = ['script', 'object', 'embed', 'link', 'style', 'meta', 'iframe', 'form', 'input'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // Only allow specific tags and attributes
  sanitized = sanitized.replace(/<(\w+)([^>]*)>/gi, (_match, tagName, attributes) => {
    if (!ALLOWED_TAGS.includes(tagName.toLowerCase())) {
      return '';
    }

    // Sanitize attributes
    const cleanAttributes = attributes.replace(/(\w+)\s*=\s*["']([^"']*)["']/gi, (_attrMatch: string, attrName: string, attrValue: string) => {
      if (!ALLOWED_ATTRIBUTES.includes(attrName.toLowerCase())) {
        return '';
      }
      
      // Additional validation for class attribute
      if (attrName.toLowerCase() === 'class') {
        // Only allow safe CSS classes (alphanumeric, hyphens, spaces)
        const safeValue = attrValue.replace(/[^a-zA-Z0-9\s\-_]/g, '');
        return `${attrName}="${safeValue}"`;
      }
      
      return `${attrName}="${attrValue}"`;
    });

    return `<${tagName}${cleanAttributes}>`;
  });

  return sanitized;
};

/**
 * Create sanitized HTML object for React's dangerouslySetInnerHTML
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML object
 */
export const createSanitizedHTML = (html: string): SanitizedHTML => {
  return {
    __html: sanitizeHTML(html)
  };
};

/**
 * Extract plain text from HTML content
 * @param html - HTML string
 * @returns Plain text content
 */
export const extractTextFromHTML = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Remove all HTML tags
  return html.replace(/<[^>]*>/g, '').trim();
};

/**
 * Safe HTML component that renders sanitized HTML
 * Alternative to dangerouslySetInnerHTML for better security
 */
export const renderSafeHTML = (html: string): JSX.Element => {
  const sanitized = sanitizeHTML(html);
  
  // Parse the sanitized HTML and create React elements
  const parts = sanitized.split(/(<[^>]+>)/);
  const elements: JSX.Element[] = [];
  
  let key = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (part.startsWith('<') && part.endsWith('>')) {
      // This is an HTML tag
      const tagMatch = part.match(/<(\w+)([^>]*)>/);
      if (tagMatch) {
        const [, tagName, attributes] = tagMatch;
        const isClosing = part.startsWith('</');
        
        if (!isClosing && ALLOWED_TAGS.includes(tagName.toLowerCase())) {
          // Extract class attribute if present
          const classMatch = attributes.match(/class\s*=\s*["']([^"']*)["']/);
          const className = classMatch ? classMatch[1] : '';
          
          // Find the closing tag and content
          let content = '';
          let j = i + 1;
          let depth = 1;
          
          while (j < parts.length && depth > 0) {
            if (parts[j].startsWith(`</${tagName}`)) {
              depth--;
            } else if (parts[j].startsWith(`<${tagName}`)) {
              depth++;
            }
            
            if (depth > 0) {
              content += parts[j];
            }
            j++;
          }
          
          // Create React element
          const props: any = { key: key++ };
          if (className) {
            props.className = className;
          }
          
          elements.push(React.createElement(tagName, props, content));
          i = j - 1; // Skip processed parts
        }
      }
    } else if (part.trim()) {
      // This is text content
      elements.push(React.createElement('span', { key: key++ }, part));
    }
  }
  
  return React.createElement('div', {}, ...elements);
};
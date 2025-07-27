import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface LineRevealProps {
  children?: string | React.ReactNode;
  className?: string;
  lineClassName?: string;
  stagger?: number;
  duration?: number;
  easing?: number[];
}

const LineReveal: React.FC<LineRevealProps> = ({
  children,
  className = '',
  lineClassName = '',
  stagger = 0.1,
  duration = 0.8,
  easing = [0.16, 1, 0.3, 1],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);

  // Stabilize children to prevent infinite re-renders
  const stableChildren = useMemo(() => {
    return typeof children === 'string' ? children : String(children);
  }, [children]);

  // Extract text and split into lines on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const extractTextFromElement = (element: HTMLElement): string => {
      let text = '';
      for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent || '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          text += extractTextFromElement(node as HTMLElement);
        }
      }
      return text;
    };

    if (typeof stableChildren === 'string') {
      // Split by sentences or natural breaks for better line division
      const sentences = stableChildren.split(/(?<=[.!?])\s+/).filter(sentence => sentence.trim());
      setLines(sentences);
    } else {
      // Create a temporary element to measure text and split into lines
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.whiteSpace = 'nowrap';
      tempDiv.style.fontSize = getComputedStyle(containerRef.current).fontSize;
      tempDiv.style.fontFamily = getComputedStyle(containerRef.current).fontFamily;
      tempDiv.style.fontWeight = getComputedStyle(containerRef.current).fontWeight;
      
      document.body.appendChild(tempDiv);

      const text = typeof stableChildren === 'string' ? stableChildren : extractTextFromElement(containerRef.current);
      const words = text.split(' ');
      const containerWidth = containerRef.current.offsetWidth;
      const tempLines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        tempDiv.textContent = testLine;
        
        if (tempDiv.offsetWidth > containerWidth && currentLine) {
          tempLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        tempLines.push(currentLine);
      }

      document.body.removeChild(tempDiv);
      setLines(tempLines);
    }
  }, [stableChildren]);

  return (
    <div 
      ref={containerRef} 
      className={`overflow-hidden relative ${className}`}
      style={{ position: 'relative' }}
    >
      <div className="relative">
        {lines.map((line, index) => {
          return (
            <div key={`line-${index}`} className="overflow-hidden relative">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ 
                  once: false, 
                  margin: "-20% 0px -20% 0px",
                  amount: 0.3
                }}
                transition={{
                  duration,
                  ease: easing,
                  delay: index * stagger,
                }}
                className={`block ${lineClassName}`}
              >
                {line}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced version with more control
interface AdvancedLineRevealProps extends LineRevealProps {
  splitBy?: 'auto' | 'sentence' | 'manual';
  manualLines?: string[];
  animateFrom?: 'top' | 'bottom' | 'left' | 'right';
  distance?: number;
}

const AdvancedLineReveal: React.FC<AdvancedLineRevealProps> = ({
  children,
  className = '',
  lineClassName = '',
  stagger = 0.15,
  duration = 0.8,
  easing = [0.16, 1, 0.3, 1],
  splitBy = 'auto',
  manualLines = [],
  animateFrom = 'bottom',
  distance = 40,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);

  // Stabilize children and manualLines to prevent infinite re-renders
  const stableChildren = useMemo(() => {
    return typeof children === 'string' ? children : String(children);
  }, [children]);

  // Stabilize manualLines array to prevent infinite re-renders
  const stableManualLines = useMemo(() => {
    return manualLines;
  }, [JSON.stringify(manualLines)]);

  // Compute lines based on splitBy strategy
  useEffect(() => {
    if (splitBy === 'manual' && stableManualLines.length > 0) {
      setLines(stableManualLines);
      return;
    }

    if (!stableChildren) {
      setLines([]);
      return;
    }

    if (splitBy === 'sentence') {
      // Split by sentences, handling multiple punctuation marks
      const sentences = stableChildren
        .split(/(?<=[.!?])\s+/)
        .filter(sentence => sentence.trim())
        .map(sentence => sentence.trim());
      setLines(sentences);
      return;
    }

    // Auto mode - split by natural breaks or words if too long
    const words = stableChildren.split(' ');
    if (words.length <= 8) {
      // Short text, keep as single line or split by sentences
      const sentences = stableChildren.split(/(?<=[.!?])\s+/).filter(s => s.trim());
      setLines(sentences.length > 1 ? sentences : [stableChildren]);
      return;
    }

    // Longer text, split into chunks
    const chunks: string[] = [];
    let currentChunk = '';
    const wordsPerChunk = Math.ceil(words.length / Math.ceil(words.length / 12));

    for (let i = 0; i < words.length; i++) {
      currentChunk += (currentChunk ? ' ' : '') + words[i];
      
      if ((i + 1) % wordsPerChunk === 0 || i === words.length - 1) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
    }

    setLines(chunks);
  }, [stableChildren, splitBy, stableManualLines]);

  // Get animation values based on direction
  const getAnimationValues = () => {
    switch (animateFrom) {
      case 'top':
        return { initial: { y: -distance, opacity: 0 }, animate: { y: 0, opacity: 1 } };
      case 'bottom':
        return { initial: { y: distance, opacity: 0 }, animate: { y: 0, opacity: 1 } };
      case 'left':
        return { initial: { x: -distance, opacity: 0 }, animate: { x: 0, opacity: 1 } };
      case 'right':
        return { initial: { x: distance, opacity: 0 }, animate: { x: 0, opacity: 1 } };
      default:
        return { initial: { y: distance, opacity: 0 }, animate: { y: 0, opacity: 1 } };
    }
  };

  const animationValues = getAnimationValues();

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`}
      style={{ 
        position: 'relative',
        paddingTop: animateFrom === 'top' ? `${distance}px` : '0',
        paddingBottom: animateFrom === 'bottom' ? `${distance}px` : '0',
        paddingLeft: animateFrom === 'left' ? `${distance}px` : '0',
        paddingRight: animateFrom === 'right' ? `${distance}px` : '0'
      }}
    >
      <div className="relative">
        {lines.map((line, index) => {
          return (
            <div key={`advanced-line-${index}`} className="overflow-hidden relative">
              <motion.div
                initial={animationValues.initial}
                whileInView={animationValues.animate}
                viewport={{ 
                  once: false, 
                  margin: "-10% 0px -10% 0px" 
                }}
                transition={{
                  duration,
                  ease: easing,
                  delay: index * stagger,
                }}
                className={`block ${lineClassName}`}
              >
                {line}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { LineReveal, AdvancedLineReveal };
export type { LineRevealProps, AdvancedLineRevealProps };

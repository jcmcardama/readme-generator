import { useState, useEffect, useRef, useCallback } from 'react';
import type { LogEntry, TypewriterLineProps } from '../types';

const formatTime = (date: Date) => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const TypewriterLine = ({ text, onCharacterTyped, onComplete }: TypewriterLineProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const onCharacterTypedRef = useRef(onCharacterTyped);
  const hasCompletedRef = useRef(false);
  
  useEffect(() => {
    onCharacterTypedRef.current = onCharacterTyped;
  }, [onCharacterTyped]);

  useEffect(() => {
    if (displayedText.length < text.length) {
      const typingSpeed = 8; 
      
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(prev.length));
        onCharacterTypedRef.current();
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else if (displayedText.length === text.length && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      if (onComplete) {
        onComplete();
      }
    }
  }, [displayedText, text, onComplete]);

  return <span style={{ color: '#00ff00' }}>{displayedText}</span>;
};

export const Terminal = ({ logs }: { logs: LogEntry[] }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollTop = terminalEndRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);

  return (
    <div ref={terminalEndRef} className="terminal-container">
      {logs.map((log) => (
        <div 
          key={log.id} 
          style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '8px', 
            margin: '0.2rem 0', 
            fontSize: '0.85rem',
            lineHeight: '1.4'
          }}
        >
          <span style={{ color: '#8b949e', fontFamily: 'monospace', flexShrink: 0, userSelect: 'none' }}>
            [{formatTime(log.timestamp)}]
          </span>
          
          <TypewriterLine 
            text={log.message} 
            onCharacterTyped={scrollToBottom} 
            onComplete={log.onComplete}
          />
        </div>
      ))}
    </div>
  );
};
import { useState, useRef, useEffect } from "react";
import { TypewriterLineProps } from "../types";

export const TypewriterLine = ({ text, onCharacterTyped, onComplete }: TypewriterLineProps) => {
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
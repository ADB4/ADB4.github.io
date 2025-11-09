import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  pauseChance?: number;
  onComplete?: () => void;
}

const TypewriterComponent: React.FC<TypewriterProps> = ({ 
  text, 
  speed = 100, 
  delay = 1000,
  pauseChance = 0.2,
  onComplete 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const isComplete = useMemo(() => currentIndex >= text.length, [currentIndex, text.length]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const delayTimeout = setTimeout(() => {
        setCurrentIndex(0);
      }, delay);
      return () => clearTimeout(delayTimeout);
    }
  }, [delay]);

  useEffect(() => {
    if (isComplete) {
      handleComplete();
      return;
    }
    if (currentIndex < text.length && !isPaused) {
      const currentChar = text[currentIndex];
      const nextSpeed = speed;

      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);

        if ((currentChar === '.' || currentChar === ' ')&& Math.random() < pauseChance) {
          const duration: number = Math.floor(Math.random() * (4000 - 500 + 1)) + 200;
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
          }, duration);
        }
      }, nextSpeed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed, isComplete, onComplete, isPaused, pauseChance]);
  const handleComplete = useCallback(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);
  return (
    <span className="typewriter">
      <h2>{displayText.toUpperCase()}<span className={isPaused ? 'caret paused':'caret'} /></h2>

    </span>
  );
};

export default TypewriterComponent;
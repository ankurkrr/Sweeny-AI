import { useState, useEffect, useCallback } from 'react';

interface TypingAnimationProps {
  isMobile?: boolean;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({ isMobile = false }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Animation sequence
  const sequence = [
    'Welcome to Sweeny',
    'What can I help with?',
    'Create personal webpage',
    'Help me pick an appropriate car for my needs',
    'Explain nostalgia to a kindergartener',
    'Design a database schema for an online merch store'
  ];

  // Randomize suggestions after the first two fixed messages
  const getRandomizedSequence = useCallback(() => {
    const fixedMessages = sequence.slice(0, 2); // "Welcome to Sweeny" and "What can I help with?"
    const suggestions = sequence.slice(2); // The suggestion messages
    
    // Shuffle suggestions
    const shuffledSuggestions = [...suggestions].sort(() => Math.random() - 0.5);
    
    return [...fixedMessages, ...shuffledSuggestions];
  }, []);

  const [animationSequence, setAnimationSequence] = useState(getRandomizedSequence());

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  // Main typing animation logic
  useEffect(() => {
    if (currentPhase >= animationSequence.length) {
      // Restart the sequence with new randomized suggestions
      setAnimationSequence(getRandomizedSequence());
      setCurrentPhase(0);
      setDisplayText('');
      setIsTyping(true);
      return;
    }

    const currentText = animationSequence[currentPhase];
    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      // Typing phase
      if (displayText.length < currentText.length) {
        timeoutId = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, Math.random() * 100 + 50); // 50-150ms between characters for natural feel
      } else {
        // Finished typing, pause before erasing
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, currentPhase === 1 ? 2000 : 1500); // Longer pause after "What can I help with?"
      }
    } else {
      // Erasing phase
      if (displayText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, Math.random() * 50 + 30); // 30-80ms between character deletions
      } else {
        // Finished erasing, move to next phase
        timeoutId = setTimeout(() => {
          setCurrentPhase(prev => prev + 1);
          setIsTyping(true);
        }, 300); // Brief pause before starting next message
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, currentPhase, isTyping, animationSequence, getRandomizedSequence]);

  return (
    <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#202123' }}>
      <div className="text-center max-w-4xl w-full">
        <div className="relative">
          <h1
            className={`font-bold transition-all duration-300 ease-in-out ${
              isMobile ? 'text-2xl' : 'text-4xl'
            }`}
            style={{
              color: '#FFFFFF',
              fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
              minHeight: isMobile ? '2rem' : '3rem', // Prevent layout shift
            }}
          >
            {displayText}
            <span
              className={`inline-block ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}
              style={{
                color: '#8B5CF6', // Purple accent color to match theme
                fontSize: 'inherit'
              }}
            >
              |
            </span>
          </h1>
          
          {/* Subtle glow effect for better visual appeal */}
          <div
            className="absolute inset-0 -z-10 opacity-20 blur-xl"
            style={{
              background: 'radial-gradient(circle at center, #8B5CF6 0%, transparent 70%)',
            }}
          />
        </div>
        
        {/* Progress indicator dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {animationSequence.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentPhase 
                  ? 'bg-purple-500 scale-125' 
                  : index < currentPhase 
                    ? 'bg-purple-300' 
                    : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

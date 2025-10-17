'use client';

import { useState, useEffect, useRef } from 'react';

type MessageType = 'user' | 'model';
type ModelResponseType = 'thinking' | 'message';
type ToolCallResponse = null | string | { html: string };

interface ConversationStep {
  type: MessageType;
  text: string;
  modelResponseType?: ModelResponseType;
  toolCall?: ToolCallResponse;
}

const conversation: ConversationStep[] = [
  {
    type: 'user',
    text: 'book me an uber to lax',
  },
  {
    type: 'model',
    text: 'Let me help you book an Uber to LAX. First, I need to determine your current location and then search for available rides. I\'ll check the Uber API for real-time pricing and availability. This will involve looking at different ride types like UberX, Uber Comfort, and Uber XL to give you options. I should also consider the estimated time of arrival and current traffic conditions to LAX to provide you with an accurate estimate.',
    modelResponseType: 'thinking',
  },
];

// Timing configuration (in milliseconds)
const USER_DELAY = 800;
const MODEL_DELAY = 600;
const TOKENS_PER_SECOND = 100;

// Thinking token library (braille alphabet)
const THINKING_TOKEN_LIBRARY = [
  '⠁', '⠃', '⠉', '⠙', '⠑', '⠋', '⠛', '⠓', '⠊', '⠚',
  '⠅', '⠇', '⠍', '⠝', '⠕', '⠏', '⠟', '⠗', '⠎', '⠞',
  '⠥', '⠧', '⠺', '⠭', '⠽', '⠵', '⠀'
];

// Maximum number of thinking tokens to display at once (sliding window)
const THINKING_WINDOW_SIZE = 4;

// Generate thinking display - cycles all characters at once for uniform effect
function generateThinkingDisplay(tokenCount: number, windowSize: number): string {
  // Sample from different parts of the library based on token count for dynamic feel
  const offset = tokenCount % THINKING_TOKEN_LIBRARY.length;
  let display = '';
  for (let i = 0; i < windowSize; i++) {
    display += THINKING_TOKEN_LIBRARY[(offset + i) % THINKING_TOKEN_LIBRARY.length];
  }
  return display;
}

export default function StreamMockup() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [streamedText, setStreamedText] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [messages, setMessages] = useState<Array<ConversationStep & { fullText: string }>>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const streamPositionRef = useRef<number>(0);
  const isStreamingRef = useRef<boolean>(false);
  const thinkingTokenCountRef = useRef<number>(0);

  const reset = () => {
    setCurrentStepIndex(0);
    setStreamedText('');
    setMessages([]);
    setIsPlaying(true);
    streamPositionRef.current = 0;
    isStreamingRef.current = false;
    thinkingTokenCountRef.current = 0;
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    if (currentStepIndex >= conversation.length) {
      setIsPlaying(false);
      return;
    }

    const currentStep = conversation[currentStepIndex];

    if (currentStep.type === 'user') {
      // Check if already added
      if (messages.length > currentStepIndex) {
        return;
      }
      
      // User message appears instantly
      setMessages(prev => [...prev, { ...currentStep, fullText: currentStep.text }]);
      
      timeoutRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, USER_DELAY);
    } else {
      // Model message streams in
      const fullText = currentStep.text;
      const msPerToken = 1000 / TOKENS_PER_SECOND;
      const isThinking = currentStep.modelResponseType === 'thinking';
      
      // Check if we need to initialize the message
      if (messages.length <= currentStepIndex) {
        setMessages(prev => [...prev, { ...currentStep, fullText: '' }]);
        streamPositionRef.current = 0;
        thinkingTokenCountRef.current = 0;
      }
      
      const messageIndex = currentStepIndex;
      let currentIndex = streamPositionRef.current;

      const streamNextToken = () => {
        if (currentIndex < fullText.length) {
          // Stream by words for natural feel
          const remainingText = fullText.slice(currentIndex);
          const nextSpace = remainingText.search(/[\s,\.]/);
          const charsToAdd = nextSpace > 0 ? nextSpace + 1 : 1;
          
          currentIndex += charsToAdd;
          streamPositionRef.current = currentIndex;
          thinkingTokenCountRef.current += 1;
          
          // Handle display based on message type
          let displayText: string;
          let shouldUpdate = true;
          
          if (isThinking) {
            // Fill window initially, then only update in batches of THINKING_WINDOW_SIZE
            if (thinkingTokenCountRef.current <= THINKING_WINDOW_SIZE) {
              // Still filling the window - show one character at a time
              displayText = generateThinkingDisplay(thinkingTokenCountRef.current, thinkingTokenCountRef.current);
            } else {
              // Window is full - only update when we have a full batch ready
              const tokensAfterFilling = thinkingTokenCountRef.current - THINKING_WINDOW_SIZE;
              if (tokensAfterFilling % THINKING_WINDOW_SIZE === 0) {
                // Full batch ready - swap all characters at once
                displayText = generateThinkingDisplay(thinkingTokenCountRef.current, THINKING_WINDOW_SIZE);
              } else {
                // Not enough tokens yet - don't update display
                shouldUpdate = false;
                displayText = ''; // placeholder, won't be used
              }
            }
          } else {
            displayText = fullText.slice(0, currentIndex);
          }
          
          if (shouldUpdate) {
            setMessages(prev => {
              const updated = [...prev];
              updated[messageIndex] = { ...currentStep, fullText: displayText };
              return updated;
            });
          }

          timeoutRef.current = setTimeout(streamNextToken, msPerToken * charsToAdd);
        } else {
          // Streaming complete, move to next step
          streamPositionRef.current = 0;
          thinkingTokenCountRef.current = 0;
          timeoutRef.current = setTimeout(() => {
            setCurrentStepIndex(prev => prev + 1);
          }, MODEL_DELAY);
        }
      };

      // Start streaming (with initial delay only if we're at the beginning)
      const delay = streamPositionRef.current === 0 ? MODEL_DELAY : 0;
      timeoutRef.current = setTimeout(streamNextToken, delay);
    }

    return () => {
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStepIndex, isPlaying]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        width: '640px',
        height: '480px',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Messages area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                animation: msg.type === 'user' ? 'slideUp 0.3s ease-out' : 'none'
              }}
            >
              <div style={{
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: msg.type === 'user' ? '#007AFF' : '#E9ECEF',
                color: msg.type === 'user' ? 'white' : '#212529',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {msg.modelResponseType === 'thinking' && (
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.7,
                    marginBottom: '4px',
                    fontStyle: 'italic'
                  }}>
                    thinking...
                  </div>
                )}
                {msg.fullText}
              </div>
            </div>
          ))}
        </div>

        {/* Controls dock */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <button
            onClick={togglePlayPause}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007AFF',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={reset}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007AFF',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ↻
          </button>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}


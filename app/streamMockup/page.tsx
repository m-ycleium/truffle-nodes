'use client';

import { useState, useEffect, useRef } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

type MessageType = 'user' | 'model' | 'tool';
type ModelResponseType = 'thinking' | 'message';
type ToolCallResponse = null | string | { html: string };

interface ConversationStep {
  type: MessageType;
  text: string;
  modelResponseType?: ModelResponseType;
  toolDisplayText?: string;
  toolTokenStream?: string;
  toolResponse?: ToolCallResponse;
  isAppTool?: boolean;
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
  {
    type: 'model',
    text: 'I\'ll work on calling you a ride. I\'ll need to verify the exact addresses.',
    modelResponseType: 'message',
  },
  {
    type: 'tool',
    text: '',
    toolDisplayText: 'searching "LAX Address"',
    toolTokenStream: 'Los Angeles International Airport (LAX) is located at 1 World Way, Los Angeles, CA 90045. The main terminal complex is accessible via multiple entrances. Airport information: open 24 hours, multiple terminals (1-8), transportation options available.',
    toolResponse: null,
    isAppTool: false,
  },
  {
    type: 'tool',
    text: '',
    toolDisplayText: 'calling book ride',
    toolTokenStream: 'Contacting ride service API... Processing request... Confirming availability... Calculating route... Estimating fare... Finalizing booking...',
    toolResponse: { html: '<placeholder>' },
    isAppTool: true,
  },
];

// Timing configuration (in milliseconds)
const USER_DELAY = 500;
const MODEL_DELAY = 200;
const TOKENS_PER_SECOND = 200;
const TOOL_CHARS_PER_SECOND = 48; // Faster streaming for tool output

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
  const isDeletingRef = useRef<boolean>(false);
  const deletePositionRef = useRef<number>(0);
  const toolStreamPositionRef = useRef<number>(0);
  const toolLoaderCycleRef = useRef<number>(0);

  const reset = () => {
    setCurrentStepIndex(0);
    setStreamedText('');
    setMessages([]);
    setIsPlaying(true);
    streamPositionRef.current = 0;
    isStreamingRef.current = false;
    thinkingTokenCountRef.current = 0;
    isDeletingRef.current = false;
    deletePositionRef.current = 0;
    toolStreamPositionRef.current = 0;
    toolLoaderCycleRef.current = 0;
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
    } else if (currentStep.type === 'tool') {
      // Tool call streaming
      const toolStream = currentStep.toolTokenStream || '';
      const msPerChar = 1000 / TOOL_CHARS_PER_SECOND;
      
      // Check if we need to initialize the message
      let messageIndex = messages.length;
      if (messages.length <= currentStepIndex) {
        setMessages(prev => [...prev, { ...currentStep, fullText: '' }]);
        toolStreamPositionRef.current = 0;
        toolLoaderCycleRef.current = 0;
      } else {
        messageIndex = currentStepIndex;
      }
      
      let currentIndex = toolStreamPositionRef.current;
      const isComplete = currentIndex >= toolStream.length;

      const streamNextChar = () => {
        if (currentIndex < toolStream.length) {
          currentIndex += 1;
          toolStreamPositionRef.current = currentIndex;
          toolLoaderCycleRef.current += 1;
          
          const displayText = toolStream.slice(0, currentIndex);
          
          setMessages(prev => {
            const updated = [...prev];
            updated[messageIndex] = { ...currentStep, fullText: displayText };
            return updated;
          });

          timeoutRef.current = setTimeout(streamNextChar, msPerChar);
        } else {
          // Streaming complete, mark as finished
          toolStreamPositionRef.current = 0;
          toolLoaderCycleRef.current = 0;
          
          timeoutRef.current = setTimeout(() => {
            setCurrentStepIndex(prev => prev + 1);
          }, MODEL_DELAY);
        }
      };

      // Start streaming if not complete
      if (!isComplete) {
        const delay = toolStreamPositionRef.current === 0 ? MODEL_DELAY : 0;
        timeoutRef.current = setTimeout(streamNextChar, delay);
      }
    } else if (currentStep.type === 'model') {
      // Model message streams in
      const fullText = currentStep.text;
      const msPerToken = 1000 / TOKENS_PER_SECOND;
      const isThinking = currentStep.modelResponseType === 'thinking';
      
      // Check if we need to initialize the message
      let messageIndex = messages.length;
      if (messages.length <= currentStepIndex) {
        setMessages(prev => [...prev, { ...currentStep, fullText: '' }]);
        streamPositionRef.current = 0;
        thinkingTokenCountRef.current = 0;
        isDeletingRef.current = false;
        deletePositionRef.current = 0;
      } else {
        // Message already exists at this position
        messageIndex = currentStepIndex;
      }
      
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
          // Streaming complete
          if (isThinking) {
            // Start deletion animation for thinking messages
            isDeletingRef.current = true;
            deletePositionRef.current = THINKING_WINDOW_SIZE;
            
            const deleteNextChar = () => {
              if (deletePositionRef.current > 0) {
                deletePositionRef.current -= 1;
                const displayText = generateThinkingDisplay(thinkingTokenCountRef.current, deletePositionRef.current);
                
                setMessages(prev => {
                  const updated = [...prev];
                  updated[messageIndex] = { ...currentStep, fullText: displayText };
                  return updated;
                });
                
                timeoutRef.current = setTimeout(deleteNextChar, msPerToken);
              } else {
                // Deletion complete - remove the message entirely
                setMessages(prev => prev.slice(0, messageIndex));
                streamPositionRef.current = 0;
                thinkingTokenCountRef.current = 0;
                isDeletingRef.current = false;
                deletePositionRef.current = 0;
                
                // Move to next step - don't increment index since message was removed
                timeoutRef.current = setTimeout(() => {
                  setCurrentStepIndex(prev => prev + 1);
                }, MODEL_DELAY);
              }
            };
            
            timeoutRef.current = setTimeout(deleteNextChar, MODEL_DELAY);
          } else {
            // Regular message - just move to next step
            streamPositionRef.current = 0;
            thinkingTokenCountRef.current = 0;
            timeoutRef.current = setTimeout(() => {
              setCurrentStepIndex(prev => prev + 1);
            }, MODEL_DELAY);
          }
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
    <>
      <div className={inter.className} style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#E5E4E0',
        padding: '20px'
      }}>
      <div style={{
        width: '640px',
        height: '480px',
        backgroundColor: '#F8F8F8',
        border: '1px solid #ddd',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
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
          {messages.map((msg, idx) => {
            const isToolComplete = msg.type === 'tool' && msg.fullText === msg.toolTokenStream;
            // Cycle loader based on how much of the stream has been shown
            const loaderIndex = msg.type === 'tool' ? Math.floor(msg.fullText.length / 5) : 0;
            const loaderChar = msg.type === 'tool' ? 
              (isToolComplete ? '⠿' : THINKING_TOKEN_LIBRARY[loaderIndex % THINKING_TOKEN_LIBRARY.length]) : '';
            
            return (
              <div
                key={idx}
                style={{
                  alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: msg.type === 'user' || msg.type === 'tool' ? '80%' : '100%',
                  width: msg.type === 'user' || msg.type === 'tool' ? 'auto' : '100%',
                  animation: msg.type === 'user' ? 'slideUp 0.3s ease-out' : msg.type === 'tool' ? 'fadeIn 0.3s ease-out' : 'none'
                }}
              >
                {msg.type === 'user' ? (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    color: '#212529',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    fontWeight: 300
                  }}>
                    {msg.fullText}
                  </div>
                ) : msg.type === 'tool' ? (
                  <div style={{ display: 'inline-block', minWidth: '320px' }}>
                    <div style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: msg.isAppTool ? '#2C2C2E' : '#E9ECEF',
                      color: msg.isAppTool ? 'white' : '#212529',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      opacity: isToolComplete ? 0.5 : 1,
                      transition: 'opacity 200ms ease-in-out',
                      width: 'fit-content'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ fontSize: '14px', flexShrink: 0 }}>{loaderChar}</span>
                        <span style={{ fontWeight: 300 }}>{msg.toolDisplayText}</span>
                      </div>
                    </div>
                    {isToolComplete && msg.toolResponse && typeof msg.toolResponse === 'object' && 'html' in msg.toolResponse && (
                      <div style={{
                        marginTop: '8px',
                        width: '320px',
                        height: '200px',
                        backgroundColor: '#F5F5F5',
                        border: '1px dashed #D1D1D6',
                        borderRadius: '8px',
                        animation: 'fadeIn 200ms ease-in-out'
                      }}>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    fontSize: msg.modelResponseType === 'thinking' ? '18px' : '14px',
                    lineHeight: '1.4',
                    color: '#212529',
                    fontWeight: msg.modelResponseType === 'thinking' ? 400 : 300,
                    letterSpacing: msg.modelResponseType === 'thinking' ? '0.4em' : ''
                  }}>
                    {msg.fullText}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <style jsx global>{`
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
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
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
      </div>
      
      {/* Controls dock */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
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
            backgroundColor: '#FFFFFF',
            color: '#212529',
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
            backgroundColor: '#FFFFFF',
            color: '#212529',
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
      </div>
    </>
  );
}


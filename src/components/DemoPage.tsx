// app/componnts/DemoPage.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm     from 'remark-gfm'
import axios         from 'axios';

import type { Patient } from '@/types/Patient'; // optional typing
import type { MsgType } from '@/types/MsgType';

import { FaArrowUp } from 'react-icons/fa6';
import { LuSquareMenu } from 'react-icons/lu';

import Sidebar from './Sidebar';
import Toolbar from './Toolbar';

import sampleQuestions from '@/data/sampleQuestions.json';
import patients        from '@/data/patients.json';

import SuggestionRow from './SuggestionsRow';

import { mdxComponents }   from '@/utils/mdxComponents';
import { mdxComponentsTyping }   from '@/utils/mdxComponents';

const normalWidth = 300;
const expandedWidth = 800;
const normalHeight = 100;
const expandedHeight = 600;

export default function DemoPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
      patients.length > 0 ? patients[0] : null
    );  

  const [isFocused, setIsFocused] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);

  const [pendingExpert, setPendingExpert] = useState<string | null>(null); // name of expert after classification
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  
  const [messages, setMessages] = useState<MsgType[]>([]);
  const [historyMap, setHistoryMap] = useState<Record<string, MsgType[]>>({});

  const [query, setQuery] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function saveHistory(msgs: MsgType[]) {
    if (!selectedPatient) return;
    setHistoryMap(prev => ({ 
      ...prev, 
      [selectedPatient.id]: msgs 
    }));
  }

  const handleSend = async () => {
    setPendingExpert(null); // clear old

    if (!isChatStarted) setIsChatStarted(true);
    resizeTextarea();
    if (!query.trim()) return;
  
    const userMessage = { role: 'user', content: query };
  
    const afterUser = [...messages, userMessage];
    setMessages(afterUser);
    saveHistory(afterUser);
  
    const filteredMessages = messages
      .filter((msg) => msg.role === 'user' || msg.role === 'bot')
      .map((msg) => (msg.role === 'bot' ? { ...msg, role: 'assistant' } : msg));
  
    const conversationPayload = [...filteredMessages, userMessage];
  
    setQuery('');
    setIsTyping(true);
    setTypingMessage('');
  
    try {
      // 1. First, classify
      const classifyRes = await fetch('/api/manager/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationPayload }),
      });
      const { expert } = await classifyRes.json();
      setPendingExpert(expert);
  
      // 2. Then, run main manager with expert
      const response = await fetch('/api/manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationPayload,
          patient: selectedPatient,
          expert, // <- add this field!
        }),
      });
  
      if (!response.body) throw new Error('No response body');
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let done = false;
  
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        setTypingMessage((prev) => prev + chunk);
      }
  
      const afterBot = [...afterUser, { role: 'bot', content: result }];
      setMessages(afterBot);
      saveHistory(afterBot);
      setIsTyping(false);
      setTypingMessage('');
    } catch (error) {
      console.error('Streaming error:', error);
      const errorMsg = 'Sorry, something went wrong.';
      setTypingMessage(errorMsg);
      const afterBot = [...afterUser, { role: 'bot', content: errorMsg }];
      setMessages(afterBot);
      saveHistory(afterBot);
      setIsTyping(false);
      setPendingExpert(null);
    }
  };  

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSampleClick = (question: string) => {
    setQuery(question);
    setTimeout(() => {
      if (textareaRef.current) resizeTextarea();
    }, 0);
  };

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!selectedPatient) return;
    const existing = historyMap[selectedPatient.id] || [];
    setMessages(existing);
    // reset “chat started” if you want
    setIsChatStarted(existing.length > 0);
  }, [selectedPatient, historyMap]);

  useEffect(() => {
    if (window.electronAPI?.onWindowFocus) {
      window.electronAPI.onWindowFocus((focused) => {
        if (!focused) {
          setIsFocused(false);
          // Blur the textarea if it exists
          if (textareaRef.current) {
            textareaRef.current.blur();
          }
        }
        // else, do nothing on focus
      });
    }
  }, []);
  
  
  
  useEffect(() => {
    const updateHeight = () => {
      if (mainRef.current && window.electronAPI?.setWindowSize) {
        const rect = mainRef.current.getBoundingClientRect();
        // Use the expanded/normal width as desired
        const width = isFocused ? expandedWidth : normalWidth;
        window.electronAPI.setWindowSize(width, Math.ceil(rect.height));
      }
    };
  
    // Run once on mount
    updateHeight();
  
    // Observe height changes
    const observer = new window.ResizeObserver(updateHeight);
    if (mainRef.current) observer.observe(mainRef.current);
  
    // Also re-run on width/focus change
    // (so you can maintain your current focus-width logic)
    // Optionally debounce if this gets spammy
  
    return () => {
      observer.disconnect();
    };
  }, [isFocused, messages.length, isSidebarOpen, query]);
  

  useEffect(() => {
    if (window.electronAPI?.setWindowSize) {
      window.electronAPI.setWindowSize(
        isFocused ? expandedWidth : normalWidth,
        isFocused ? expandedHeight : normalHeight
      );
    }
  }, [isFocused]);

  return (
    <>

    <main ref={mainRef} className={`flex flex-col text-center justify-center`}>
        <div className={`w-full mx-auto`}>
          {/* Chat Container */}
          {isChatStarted && isFocused && 
          <div 
            className='rounded-xl bg-white/95 border border-neutral-300/30 w-full max-h-170 mx-auto p-4 mb-2 flex flex-col gap-2 custom-scroll'
            style={{ overflowY: 'auto' }}
            ref={chatContainerRef}
          >

            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={index}
                  className={`text-left px-4 py-2 rounded-2xl ${
                    isUser
                      ? 'max-w-[70%] bg-neutral-200 self-end rounded-br-sm'
                      : 'my-2 text-black self-start rounded-bl-sm'
                  }`}
                >
                  {isUser
                    ? /* plain text for user messages */
                    <p className="!font-normal whitespace-pre-line">
                      {msg.content}
                    </p>
                    : /* markdown for bot messages */
                      <div className=''>
                      <Markdown 
                        remarkPlugins={[remarkGfm]} 
                        components={mdxComponents}
                      >
                        {msg.content}
                      </Markdown>
                      <Toolbar 
                        agentName={pendingExpert}
                        message={msg.content}
                      />
                      </div>
                  }
                </div>
              );
            })}

            {/* Pulsing Circle OR Typing Message */}
            {isTyping && (
              <div className="text-left px-4 py-2 rounded-2xl font-medium my-2 text-black self-start rounded-bl-sm">
                {typingMessage === '' ? (
                  pendingExpert ? (
                    <span className='animate-pulse'>
                      <span className="font-bold">
                        {pendingExpert.charAt(0).toUpperCase() + pendingExpert.slice(1)}
                      </span> agent is working.
                    </span>
                  ) : (
                    <span className='animate-pulse'>
                      Deploying agents.
                    </span>
                  )
                ) : (
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={mdxComponentsTyping}
                  >
                    {typingMessage}
                  </Markdown>
                )}
              </div>
            )}



          </div>
          }

        {isSidebarOpen &&
          <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen} 
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
          />
        }

        {isFocused && (
          <SuggestionRow
            suggestions={sampleQuestions}
            onSuggestionClick={handleSampleClick}
          />
        )}
        
          <div className="relative rounded-xl bg-white/95 border border-neutral-300/30 p-4">
            {/* Scrollable wrapper with max height to avoid overlapping button */}
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resizeTextarea();
              }}
              onKeyDown={handleKeyDown}
              onInput={resizeTextarea}
              placeholder="Ask a clinical question"
              rows={1}
              style={{
                resize: 'none',
                maxHeight: '160px',
                marginBottom: '1.5rem',
                overflowY: 'auto',
              }}
              className="w-full text-md bg-transparent focus:outline-none custom-scroll"
              onFocus={() => setIsFocused(true)}
            />


            <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-center">
  
                {/* Left-aligned buttons */}
                <div className="flex gap-2">
                {!isSidebarOpen &&
                <div className='z-50 flex flex-row'>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1 cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-neutral-700 rounded-lg focus:bg-neutral-700"
                  aria-label="Open sidebar" 
                >
                  <LuSquareMenu className="w-5 h-4" /> 
                  
                </button>
                <p className='ml-0.5 mt-1.5 '>
                  <span className='mr-1 font-bold text-gray-600'>{selectedPatient.name}</span>
                  |
                  <span className='ml-1 font-semibold text-gray-500'>{selectedPatient.room}</span>
                </p>
                </div>
                }
                </div>

                {/* Right-aligned buttons (Send last) */}
                <div className="flex gap-2 items-center">
                    {/* Add additional buttons to the left of send */}
                    
                    {/* Send Button */}
                    <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={!query.trim()}
                    className={`p-2 inline-flex items-center justify-center rounded-full text-sm font-medium transition
                        ${query.trim()
                        ? 'bg-blue-600 cursor-pointer text-white hover:bg-neutral-800'
                        : 'bg-neutral-300 cursor-not-allowed'}`}
                    >
                    <FaArrowUp className={`w-5 h-5 md:w-3.25 md:h-3.25`} aria-hidden="true" />
                    <span className="sr-only">Send</span>
                    </button>
                </div>
            </div>

          </div>
        </div>

      {/* Scrollbar Styles */}
      <style jsx>{`

        .suggestion-row::-webkit-scrollbar { display: none; }
        .suggestion-row { -ms-overflow-style: none; scrollbar-width: none; }

        .custom-scroll {
          -webkit-app-region: no-drag; /* Allow interaction */
          overflow-y: auto;
          pointer-events: auto;
        }

        .custom-scroll::-webkit-scrollbar {
            width: 6px;
            cursor: default; /* Doesn't always work, so add pointer-events fix */
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(100, 100, 100, 0.4);
            border-radius: 6px;
            pointer-events: auto;
            cursor: default;
        }

        .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
            pointer-events: auto;
        }
        `}</style>

    </main>
    </>
  );
}

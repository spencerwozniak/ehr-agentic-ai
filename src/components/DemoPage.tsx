// app/componnts/DemoPage.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm     from 'remark-gfm'
import axios         from 'axios';

import type { Patient } from '@/types/Patient'; // optional typing
import type { MsgType } from '@/types/MsgType';

import { FaArrowUp } from 'react-icons/fa6';

import Sidebar from './Sidebar';
import Toolbar from './Toolbar';

import sampleQuestions from '@/data/sampleQuestions.json';
import patients        from '@/data/patients.json';

import { mdxComponents }   from '@/utils/mdxComponents';
import { mdxComponentsTyping }   from '@/utils/mdxComponents';
import CollapsibleSections from './CollapsibleSections';

export default function DemoPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
      patients.length > 0 ? patients[0] : null
    );  

  const [isChatStarted, setIsChatStarted] = useState(false);

  const [pendingExpert, setPendingExpert] = useState<string | null>(null); // name of expert after classification
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<MsgType[]>([]);
  const [historyMap, setHistoryMap] = useState<Record<string, MsgType[]>>({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  return (
    <>
    <Sidebar 
      isOpen={isSidebarOpen} 
      setIsOpen={setIsSidebarOpen} 
      selectedPatient={selectedPatient}
      setSelectedPatient={setSelectedPatient}
    />
    <main className={` min-h-screen flex flex-col justify-center transition-all duration-300
      ${isSidebarOpen ? 'ml-64' : ''}`}>
      {/* Sidebar */}
      
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        {/* Welcome Section */}
        <div className={isChatStarted ? 'hidden' : 'z-100'}>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">Serelora</h1>
          <p className="mt-3 text-gray-600 dark:text-neutral-400">Instant clinical answers. Just ask.</p>

          {/* Sample Questions */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-2xl">
          {sampleQuestions.map((question, index) => (
              <button
              key={index}
              onClick={() => handleSampleClick(question)}
              className="z-100 cursor-pointer rounded-full !bg-white px-3 py-1 text-sm text-neutral-900 hover:bg-neutral-200 dark:!bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition"
              >
              {question}
              </button>
          ))}
          </div>
        </div>

        {/* Chat Container */}
        <div 
          className='w-full max-w-5xl overflow-y-auto mx-auto px-4 pb-4 fixed top-13 left-0 right-0 bottom-30 flex flex-col gap-2 custom-scroll' 
          ref={chatContainerRef}
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={index}
                className={`text-left px-4 py-2 rounded-2xl ${
                  isUser
                    ? 'max-w-[70%] bg-[#bfaa8d] dark:bg-neutral-700 text-white self-end rounded-br-sm'
                    : 'my-2 text-black self-start dark:text-white rounded-bl-sm'
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
            <div className="text-left px-4 py-2 rounded-2xl font-medium my-2 text-black self-start dark:text-white rounded-bl-sm">
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

        {/* Input Container */}
        <div className={`w-full max-w-2xl mx-auto px-4 pb-4  fixed bottom-0 left-0 right-0 
          ${isChatStarted ? 'max-w-5xl' : 'md:mt-10 md:pb-10 md:static'}`}>

          <div className="relative rounded-3xl dark:bg-neutral-800 bg-white p-4">
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
                marginBottom: '1.5rem', // prevents overlap with the send button
                overflowY: 'auto',
            }}
            className="w-full text-md bg-transparent focus:outline-none dark:text-white custom-scroll"
            />

            <div className="absolute bottom-2.5 left-3 right-3 flex justify-between items-center">
  
                {/* Left-aligned buttons */}
                <div className="flex gap-2">
                    {/* Add more buttons here if needed */}
                </div>

                {/* Right-aligned buttons (Send last) */}
                <div className="flex gap-2 items-center">
                    {/* Add additional buttons to the left of send */}
      
                    {/* Send Button */}
                    <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={!query.trim()}
                    className={`p-2 inline-flex items-center justify-center rounded-full text-sm font-medium text-white transition
                        ${query.trim()
                        ? 'bg-black cursor-pointer hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-black'
                        : 'bg-neutral-300 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500'}`}
                    >
                    <FaArrowUp className={`w-5 h-5 md:w-3.25 md:h-3.25`} aria-hidden="true" />
                    <span className="sr-only">Send</span>
                    </button>
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`z-100 text-center text-xs text-gray-600 dark:text-neutral-500 hidden ${isChatStarted ? '' : 'md:block'}`}>
        © {new Date().getFullYear()} Serelora
      </footer>

      {/* Scrollbar Styles */}
      <style jsx>{`
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

        .dark .custom-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(200, 200, 200, 0.3);
        }
        `}</style>

    </main>
    </>
  );
}

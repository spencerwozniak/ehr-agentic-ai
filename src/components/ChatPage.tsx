'use client';

import { useState, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa6';
import sampleQuestions from '@/data/sampleQuestions.json';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <main className="dark:bg-neutral-900 min-h-screen flex flex-col justify-center">
      {/* Sidebar */}
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">Serelora</h1>
        <p className="mt-3 text-gray-600 dark:text-neutral-400">Instant clinical answers. Just ask.</p>

        {/* Sample Questions */}
        <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-2xl">
        {sampleQuestions.map((question, index) => (
            <button
            key={index}
            onClick={() => handleSampleClick(question)}
            className="cursor-pointer rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition"
            >
            {question}
            </button>
        ))}
        </div>


        {/* Input Container */}
        <div className="w-full max-w-2xl mx-auto px-4 pb-4 md:mt-10 md:pb-10 md:static fixed bottom-0 left-0 right-0">

          <div className="relative rounded-3xl dark:bg-neutral-800 bg-white p-4">
            {/* Scrollable wrapper with max height to avoid overlapping button */}
            <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                resizeTextarea();
            }}
            onInput={resizeTextarea}
            placeholder="Ask a clinical question"
            rows={1}
            style={{
                resize: 'none',
                maxHeight: '160px',
                marginBottom: '1.5rem', // prevents overlap with the send button
                overflowY: 'auto',
            }}
            className="w-full text-sm bg-transparent focus:outline-none dark:text-white custom-scroll"
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
                    onClick={() => alert(`You asked: ${query}`)}
                    disabled={!query.trim()}
                    className={`p-2 inline-flex items-center justify-center rounded-full text-sm font-medium text-white transition
                        ${query.trim()
                        ? 'bg-black cursor-pointer hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-black'
                        : 'bg-neutral-300 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500'}`}
                    >
                    <FaArrowUp className="w-5 h-5 md:w-3.25 md:h-3.25" aria-hidden="true" />
                    <span className="sr-only">Send</span>
                    </button>
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-600 dark:text-neutral-500 hidden md:block">
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
  );
}

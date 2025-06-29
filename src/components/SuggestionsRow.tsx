// ================================
// SUGGESTION ROW COMPONENT
// ================================
'use client'

import { useEffect, useRef } from "react";

export default function SuggestionRow({
    suggestions,
    onSuggestionClick,
  }: {
    suggestions: string[];
    onSuggestionClick: (s: string) => void;
  }) {
    const rowRef = useRef<HTMLDivElement>(null);
    const scrollInterval = useRef<NodeJS.Timeout | null>(null);
  
    // Start auto-scrolling
    const startScroll = (direction: "left" | "right") => {
      if (!rowRef.current) return;
      stopScroll(); // clear any previous
      scrollInterval.current = setInterval(() => {
        if (!rowRef.current) return;
        if (direction === "right") {
          rowRef.current.scrollLeft += 10;
          if (
            rowRef.current.scrollLeft + rowRef.current.clientWidth >=
            rowRef.current.scrollWidth
          ) {
            stopScroll();
          }
        } else {
          rowRef.current.scrollLeft -= 10;
          if (rowRef.current.scrollLeft <= 0) {
            stopScroll();
          }
        }
      }, 14);
    };
  
    // Stop auto-scrolling
    const stopScroll = () => {
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
        scrollInterval.current = null;
      }
    };
  
    // Cleanup on unmount
    useEffect(() => {
      return () => {
        stopScroll();
      };
    }, []);
  
    return (
      <div className="relative w-full max-w-5xl mx-auto z-20">
        {/* LEFT HOVER AREA */}
        <div
          className="absolute top-0 left-0 h-full w-2 z-30"
          onMouseEnter={() => startScroll("left")}
          onMouseLeave={stopScroll}
        />
        {/* RIGHT HOVER AREA */}
        <div
          className="absolute top-0 right-0 h-full w-2 z-30"
          onMouseEnter={() => startScroll("right")}
          onMouseLeave={stopScroll}
        />
  
        {/* SUGGESTIONS */}
        <div
          ref={rowRef}
          className="suggestion-row flex flex-nowrap overflow-x-auto no-scrollbar gap-2 mb-2 rounded-t-xl select-none"
          tabIndex={-1}
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onSuggestionClick(s)}
              className="cursor-pointer bg-white/95 border border-neutral-300/30 rounded-full px-3 py-1 text-sm text-neutral-900 hover:bg-neutral-200 transition whitespace-nowrap transition"
              tabIndex={-1}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }
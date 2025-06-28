import React, {useState} from 'react';

import { FaCheck } from 'react-icons/fa';
import { FiThumbsUp, FiThumbsDown, FiCopy, FiShare2 } from 'react-icons/fi';
import { PiThumbsUpFill, PiThumbsDownFill } from "react-icons/pi";

// Define action type with an optional onClick handler
type Action = {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
};

type ToolbarProps = {
  agentName: string;
  message: string;
}

async function getRealTimestamp() {
  const res = await fetch('https://worldtimeapi.org/api/timezone/etc/UTC');
  const data = await res.json();
  // ISO 8601: "2025-06-24T21:10:01.618736+00:00"
  const realTimestamp = data.utc_datetime;
  console.log(realTimestamp);
  return realTimestamp;
}

const Toolbar: React.FC<ToolbarProps> = ({ agentName, message }) => {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [copied, setCopied] = useState(false);

  const sendFeedback = async (action: 'like' | 'dislike') => {
    if (feedback) return;
    setFeedback(action);
    const timestamp = await getRealTimestamp();
    await fetch('/api/feedback', 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            agentName,
            message,
            action,
            timestamp,
        }),
      });
  };

  const FEEDBACK_ACTIONS = [
    {
      key: 'like',
      icon: FiThumbsUp,
      filledIcon: PiThumbsUpFill,
      label: 'Like',
      filledLabel: 'Liked',
    },
    {
      key: 'dislike',
      icon: FiThumbsDown,
      filledIcon: PiThumbsDownFill,
      label: 'Dislike',
      filledLabel: 'Disliked',
    },
  ];

  // Define the button actions in an array, each with its own onClick
  const UTILITY_ACTIONS: Action[] = [
    { Icon: FiCopy, label: 'Copy', onClick: () => console.log('Copied') },
    { Icon: FiShare2, label: 'Share', onClick: () => console.log('Shared') },
  ];

  return (
    <div>
      <div className="sm:flex sm:justify-between">
        <div className="flex gap-1">
        {feedback === null
          ? FEEDBACK_ACTIONS.map(({ key, icon: Icon, label }) => (
            <div key={key} className="relative group">
              <button
                key={key}
                onClick={() => sendFeedback(key as 'like' | 'dislike')}
                aria-label={label}
                className="cursor-pointer inline-flex shrink-0 justify-center items-center size-8 rounded-full text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:bg-gray-100 focus:text-blue-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
              >
                <Icon className="shrink-0 size-4" />
              </button>
              {/* Tooltip: hidden by default, visible on hover */}
              <div
                  role="tooltip"
                  className="
                    absolute top-full left-1/2 -translate-x-1/2 mt-2
                    whitespace-normal break-words
                    rounded-lg bg-black py-1.5 px-3
                    font-sans text-sm font-normal text-white
                    opacity-0 invisible
                    group-hover:visible group-hover:opacity-100
                    transition-opacity duration-200
                    pointer-events-none
                    z-10
                  "
                >
                  {label}
                </div>
              </div>
            ))
          : FEEDBACK_ACTIONS.filter(a => a.key === feedback).map(
              ({ key, filledIcon: FilledIcon, filledLabel }) => (
                <div key={key} className="relative group">
                  <button
                    key={key}
                    disabled
                    aria-label={filledLabel}
                    className={`inline-flex shrink-0 justify-center items-center size-8 rounded-full cursor-default`}
                  >
                    <FilledIcon className="shrink-0 size-4" />
                  </button>
                  <div
                    role="tooltip"
                    className="
                      absolute top-full left-1/2 -translate-x-1/2 mt-2
                      whitespace-normal break-words
                      rounded-lg bg-black py-1.5 px-3
                      font-sans text-sm font-normal text-white
                      opacity-0 invisible
                      group-hover:visible group-hover:opacity-100
                      transition-opacity duration-200
                      pointer-events-none
                      z-10
                    "
                  >
                    {filledLabel}
                  </div>
                </div>
              )
            )}

          {UTILITY_ACTIONS.map(({ Icon, label, onClick }, idx) => {
            const key = `${label}-${idx}`;
            return (
              // group class enables hover state for child tooltip
              <div key={key} className="relative group">
                <button
                  type="button"
                  onClick={onClick}
                  aria-label={label}
                  className="cursor-pointer inline-flex shrink-0 justify-center items-center size-8 rounded-full text-gray-500 hover:bg-gray-50 focus:z-10 focus:outline-none focus:bg-gray-100 focus:text-blue-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                >
                  <Icon className="shrink-0 size-4" />
                </button>
                {/* Tooltip: hidden by default, visible on hover */}
                <div
                  role="tooltip"
                  className="
                    absolute top-full left-1/2 -translate-x-1/2 mt-2
                    whitespace-normal break-words
                    rounded-lg bg-black py-1.5 px-3
                    font-sans text-sm font-normal text-white
                    opacity-0 invisible
                    group-hover:visible group-hover:opacity-100
                    transition-opacity duration-200
                    pointer-events-none
                    z-10
                  "
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;

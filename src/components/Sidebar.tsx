import React from 'react';
import Image from 'next/image';

import type { Patient } from '@/types/Patient';

import patients from '@/data/patients.json';

import { LuSquareMenu } from "react-icons/lu";

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedPatient: Patient | null;
    setSelectedPatient: (patient: Patient) => void;
  }

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, selectedPatient, setSelectedPatient }) => {
  return (
    <>
    {/* Toggle Button (Open) */}
    {!isOpen && (
        <div className='fixed top-2 left-2 z-50 flex flex-row'>
        <button
          onClick={() => setIsOpen(true)}
          className=" p-2 cursor-pointer text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-700 rounded-lg focus:bg-neutral-700"
          aria-label="Open sidebar" 
        >
          <LuSquareMenu className="w-5 h-5" /> 
          
        </button>
        <p className='ml-0.5 mt-1.5 '>
          <span className='mr-1 font-bold text-gray-600 dark:text-neutral-400'>{selectedPatient.name}</span>
          |
          <span className='ml-1 font-semibold text-gray-500 dark:text-neutral-500'>{selectedPatient.room}</span>
        </p>
        </div>
      )}
      
    <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          dark:bg-neutral-900 dark:border-neutral-700`
        }
        role="dialog"
        aria-label="Sidebar"
      >
      <nav className="flex flex-col h-full">
        {/* Close Button */}
        <button
            onClick={() => setIsOpen(false)}
            className="cursor-pointer fixed top-2 right-2 px-2 text-3xl text-gray-600 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-700 text-white rounded-lg focus:bg-neutral-700"
            aria-label="Close sidebar"
          >
            &times;
          </button>

        {/* Logo Section */}
        <div className="flex items-center p-3.5">
          <a
            href="/"
            aria-label="Home"
            className="flex-none focus:outline-none focus:opacity-80"
          >
            {/* Inline SVG logo here */}
            <Image 
              src='/stealth-plane.png'
              alt='Serelora Logo'
              width={30}
              height={30}
            />
          </a>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-track]:bg-gray-100
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          dark:[&::-webkit-scrollbar-track]:bg-neutral-700
          dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        >
        <p className='ml-4 text-sm text-neutral-400'>Patients</p>
        <ul className="my-2 space-y-1 px-2">
          {patients.map((patient) => (
            <li key={patient.id}>
              <button
                onClick={() => setSelectedPatient(patient)}
                className={`
                  flex flex-col gap-y-1 py-2 px-4 text-sm rounded-xl w-full text-left
                  ${selectedPatient?.id === patient.id
                    ? 'bg-gray-200 text-gray-900 dark:bg-neutral-800 dark:text-white'
                    : 'cursor-pointer text-gray-700 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}
                `}
              >
                <span className="font-semibold">{patient.name}</span>
                <span className="text-xs text-gray-500 dark:text-neutral-500">{patient.room}</span>
              </button>
            </li>
          ))}
        </ul>

        </div>

        {/* Footer Section */}
        <div className="mt-auto">
          <div className="py-2.5 px-7">
            <p className="inline-flex items-center gap-x-2 text-xs text-green-600">
              <span className="block w-1.5 h-1.5 rounded-full bg-green-600" />
              Active 12,320 people
            </p>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
            <a
              href="#"
              className="flex justify-between items-center gap-x-3 py-2 px-3 text-sm text-gray-700 rounded-lg
                hover:bg-gray-100 focus:outline-none focus:bg-gray-100
                dark:hover:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300 dark:focus:text-neutral-300"
            >
              Sign in
              <svg
                className="shrink-0 w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </nav>
    </div>
    </>
  );
};

export default Sidebar;

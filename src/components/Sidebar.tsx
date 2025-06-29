// src/components/Sidebar.tsx
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
    {isOpen &&
    <div
        className={`relative h-full w-full rounded-xl my-2 bg-white/95 border border-neutral-300/30 z-40`}
        role="dialog"
        aria-label="Sidebar"
      >
      <nav className="flex flex-col h-full">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="cursor-pointer absolute top-2 right-2 px-2 text-2xl text-gray-600 hover:text-gray-900 hover:bg-neutral-700 rounded-lg focus:bg-neutral-700"
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
          [&::-webkit-scrollbar-thumb]:bg-gray-300"
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
                    ? 'bg-gray-200 text-gray-900'
                    : 'cursor-pointer text-gray-700 hover:bg-gray-100'}
                `}
              >
                <span className="font-semibold">{patient.name}</span>
                <span className="text-xs text-gray-500">{patient.room}</span>
              </button>
            </li>
          ))}
        </ul>

        </div>
      </nav>
    </div>
    }
    </>
  );
};

export default Sidebar;

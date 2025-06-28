'use client'

import { FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center text-center px-4">
      <Image
        src="/stealth-plane.png"
        alt="Serelora"
        width={100}
        height={100}
        className=''
        priority
      />
      <h1 className="text-4xl text-white font-bold mb-4">Serelora</h1>
      <p className="text-md text-gray-100 font-light mb-4 max-w-250">
        Serelora is an early-stage healthcare software company building a universal AI interface for doctors — designed to work across any EHR, and finally put clinicians first.
      </p>
      <p className="text-sm text-gray-300 font-light mb-4 max-w-250">
        We leverage <Link href='https://en.wikipedia.org/wiki/Mixture_of_experts' target='_blank' rel="noopener noreferrer">a team of expert AI agents</Link> to deliver specific support across multiple aspects of clinical care.
      </p>
      <Link href='mailto:beta@serelora.com' className="text-lg font-semibold">beta@serelora.com</Link>
      <Link
            className="mt-5 text-3xl"
            target="_blank"
            href="https://www.linkedin.com/company/serelora"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </Link>
    </div>
  );
}

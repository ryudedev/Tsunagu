"use client";

import Link from 'next/link';

export default function Header() {
  return (
    <header className='fixed'>
      <nav className="px-5 pt-2 flex items-center justify-start">
        <Link href="/" className="p-2 px-4 text-3xl font-bold text-white bg-logo rounded-full drop-shadow-default">
          Tsunagu
        </Link>
      </nav>
    </header>
  );
}
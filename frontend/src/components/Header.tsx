"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, isLoading, signOut } = useAuth();

  // 認証状態の読み込み中は、UIがちらつかないようにスケルトンを表示します。
  // これにより、サーバーとクライアントの初回描画が必ず一致します。
  if (isLoading) {
    return (
      <header className="">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-800">Tsunagu</Link>
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        </nav>
      </header>
    );
  }

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
"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, isLoading, signOut } = useAuth();

  // 認証状態の読み込み中は、UIがちらつかないようにスケルトンを表示します。
  // これにより、サーバーとクライアントの初回描画が必ず一致します。
  if (isLoading) {
    return (
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-800">Tsunagu</Link>
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          Tsunagu
        </Link>
        <div>
          {/* 読み込み完了後、ユーザーの有無で表示を切り替える */}
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user.email}</span>
              <button
                onClick={signOut}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
              ログイン
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
"use client";

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Icon from './Icon';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  filter?: string;
  setFilter?: React.Dispatch<React.SetStateAction<string>>;
}

export default function Header({filter, setFilter}: HeaderProps) {
  const { user, isLoading, signOut } = useAuth();
  const [isSignoutHover, setIsSignoutHover] = useState<boolean>(false);
  
  const [isSearchHover, setIsSearchHover] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  
  const isSearchVisible = isSearchHover || isSearchFocused;

  return (
    <header className='fixed'>
      <nav className="px-5 pt-2 w-screen flex items-center justify-between h-14">
        <Link href="/" className="p-2 px-4 text-3xl font-bold text-white bg-logo rounded-full drop-shadow-default">
          Tsunagu
        </Link>
        {user && !isLoading && setFilter && (
          <div className='flex flex-row justify-center items-center gap-2 h-10'>
            
            {/* --- 検索フォームの修正 --- */}
            <motion.div
              onMouseEnter={() => setIsSearchHover(true)}
              onMouseLeave={() => setIsSearchHover(false)}
              className="relative flex items-center h-full"
              // ★★★ 修正点1: 幅のアニメーション条件を変更 ★★★
              animate={{ width: isSearchVisible || (filter && filter.length > 0) ? 250 : 40 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className='absolute left-2.5 top-0 bottom-0 my-auto flex items-center pointer-events-none z-10'>
                <Icon.Search className='text-desc' size={20} />
              </div>

              {/* ★★★ 修正点2: 入力文字を表示する要素を追加 ★★★ */}
              <AnimatePresence>
                {!isSearchVisible && filter && filter.length > 0 && (
                  <motion.div
                    className="absolute inset-0 flex items-center pl-10 pr-4 text-gray-500 overflow-hidden whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {filter}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {isSearchVisible && (
                  <motion.input
                    type="text"
                    name="search"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="検索..."
                    className='border-2 border-desc rounded-full h-full pl-10 pr-4 duration-300 focus:outline-logo w-full'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* サインアウトボタン */}
            <motion.button
              onClick={signOut}
              onMouseEnter={() => setIsSignoutHover(true)}
              onMouseLeave={() => setIsSignoutHover(false)}
              animate={{ width: isSignoutHover ? 'auto' : 40 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className='flex flex-row items-center rounded-full h-10 px-2 bg-white border-2 border-logo text-logo hover:text-white hover:bg-logo hover:border-white cursor-pointer overflow-hidden'
            >
              <div className="flex-shrink-0">
                <Icon.Signout size={20} />
              </div>
              <AnimatePresence>
                {isSignoutHover && (
                  <motion.span
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="font-bold text-xl whitespace-nowrap ml-2"
                  >
                    サインアウト
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        )}
      </nav>
    </header>
  );
}
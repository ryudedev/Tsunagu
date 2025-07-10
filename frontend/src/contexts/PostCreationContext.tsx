'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * 投稿作成コンテキストが提供する状態と関数の型定義
 */
interface PostCreationContextType {
  title: string;
  setTitle: (title: string) => void;
}

const PostCreationContext = createContext<PostCreationContextType | undefined>(undefined);

/**
 * 投稿作成に関する状態（タイトルなど）を管理・提供するProvider
 * @param children - Providerでラップする子コンポーネント
 */
export function PostCreationProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');

  return (
    <PostCreationContext.Provider value={{ title, setTitle }}>
      {children}
    </PostCreationContext.Provider>
  );
}

/**
 * 投稿作成状態にアクセスするためのカスタムフック
 */
export const usePostCreation = (): PostCreationContextType => {
  const context = useContext(PostCreationContext);
  if (!context) {
    throw new Error('usePostCreation must be used within a PostCreationProvider');
  }
  return context;
};
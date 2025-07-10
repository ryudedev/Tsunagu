"use client"

import { usePathname } from 'next/navigation';
import { AuthProvider } from "@/contexts/AuthContext";
import { ReactNode } from 'react';
import Header from './Header';

interface ConditionalAuthWrapperProps {
  children: ReactNode;
}

/**
 * 認証前と認証後のWrapperを提供します。
 * 
 * @remarks
 * pathによって認証後と認証前のWrapperを分けて提供します。
 * 
 * @param
 * - children: コンテンツを表示するための引数
 * 
 * @returns 認証後・認証前のJSX.Element
 */
export default function ConditionalAuthWrapper({ children }: ConditionalAuthWrapperProps) {
  const pathname = usePathname();
  
  const publicPaths = ['/login'];
  
  // 現在のパスとの一致
  const isPublicPath = publicPaths.includes(pathname);
  
  // 認証不要なページの場合
  if (isPublicPath) {
    return <>{children}</>;
  }
  
  // 認証が必要なページの場合
  return (
    <AuthProvider>
        {children}
    </AuthProvider>
  );
}
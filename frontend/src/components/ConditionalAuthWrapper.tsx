"use client"

import { usePathname } from 'next/navigation';
import { AuthProvider } from "@/contexts/AuthContext";
import { ReactNode } from 'react';
import Header from './Header';

interface ConditionalAuthWrapperProps {
  children: ReactNode;
}

export default function ConditionalAuthWrapper({ children }: ConditionalAuthWrapperProps) {
  const pathname = usePathname();
  
  // 認証が不要なパス
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
        <Header />
        {children}
    </AuthProvider>
  );
}
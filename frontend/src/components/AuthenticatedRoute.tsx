"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthenticatedRouteProps {
  children: ReactNode;
}

export default function AuthenticatedRoute({ children }: AuthenticatedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 読み込みが完了し、かつユーザーがいない場合
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // 読み込み中、またはユーザーがいる場合
  if (isLoading || !user) {
    // 読み込み中、またはリダイレクトが発生するまでの間
    return <div className="text-center p-8">読み込み中...</div>;
  }

  // 認証済みの場合のみ
  return <>{children}</>;
}
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
    // 読み込みが完了し、かつユーザーがいない場合、ログインページにリダイレクト
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // 読み込み中、またはユーザーがいる場合は、子コンポーネント（ページの本体）を表示
  if (isLoading || !user) {
    // 読み込み中、またはリダイレクトが発生するまでの間、ローディング表示を見せる
    return <div className="text-center p-8">読み込み中...</div>;
  }

  // 認証済みの場合のみ、渡されたコンテンツを表示
  return <>{children}</>;
}
"use client"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Callback() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    console.log("[DEBUG]: ", {
      user,
      isLoading,
      currentUrl: window.location.href
    });

    // 認証完了後のリダイレクト処理
    if (!isLoading && user) {
      console.log("[DEBUG]: Authentication successful, redirecting to home");
      router.push('/');
      return;
    }

    // 認証失敗時の処理
    if (!isLoading && !user) {
      console.log("[DEBUG]: Authentication failed, redirecting to login");
      router.push('/login?error=auth_failed');
      return;
    }

    // タイムアウト処理（10秒後）
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("[DEBUG]: Authentication timeout reached");
        setTimeoutReached(true);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [user, isLoading, router]);

  // タイムアウト時の手動リダイレクト
  const handleManualRedirect = () => {
    router.push('/login?error=timeout');
  };

  // ローディング中の表示
  if (isLoading && !timeoutReached) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-700 mb-2">認証処理中...</p>
        <p className="text-sm text-gray-500">しばらくお待ちください</p>
      </div>
    );
  }

  // タイムアウト時の表示
  if (timeoutReached) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">認証タイムアウト</h2>
          <p className="text-gray-700 mb-4">
            認証処理に時間がかかりすぎています。<br />
            再度ログインをお試しください。
          </p>
          <button
            onClick={handleManualRedirect}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            ログインページに戻る
          </button>
        </div>
      </div>
    );
  }

  // フォールバック（通常は表示されない）
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <p className="text-gray-500">処理中...</p>
    </div>
  );
}
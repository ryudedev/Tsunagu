"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Home() {
  const { user, isLoading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    hasCode: false,
    hasState: false,
    localStorageKeys: 0,
    cognitoKeys: 0
  });

  // クライアントサイドでのマウント後にのみ動的コンテンツを表示
  useEffect(() => {
    setMounted(true);
    
    // デバッグ情報を更新
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const localStorageKeys = Object.keys(localStorage);
      const cognitoKeys = localStorageKeys.filter(k => k.includes('Cognito'));
      
      setDebugInfo({
        hasCode: urlParams.has('code'),
        hasState: urlParams.has('state'),
        localStorageKeys: localStorageKeys.length,
        cognitoKeys: cognitoKeys.length
      });
      
      // OAuth認証後のURLパラメータをクリーンアップ（ページリロード後）
      if (urlParams.has('code') && user) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    }
  }, [user]);

  // console.log('Home component render:', { user, isLoading, mounted });

  const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    // console.log('All storage cleared');
    window.location.reload();
  };

  const forceCheckAuth = () => {
    // console.log('Force checking auth...');
    window.location.href = '/';
  };

  // 強制的にローディング状態を解除するためのボタン（デバッグ用）
  const forceStopLoading = () => {
    // console.log('Force stopping loading state');
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Tsunaguへようこそ！</h1>
      
      {/* デバッグ情報を表示 - マウント後のみ */}
      {mounted && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">デバッグ情報</h2>
          <p>isLoading: {String(isLoading)}</p>
          <p>user: {user ? 'あり' : 'なし'}</p>
          <p>user.email: {user?.email || 'N/A'}</p>
          <p>mounted: {String(mounted)}</p>
          <p>Current URL: {window.location.href}</p>
          <p>Has OAuth Code: {String(debugInfo.hasCode)}</p>
          <p>Has OAuth State: {String(debugInfo.hasState)}</p>
          <p>Local Storage Keys: {debugInfo.localStorageKeys}</p>
          <p>Cognito Keys: {debugInfo.cognitoKeys}</p>
          
          {user && (
            <pre className="text-left bg-white p-2 rounded mt-2 text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          )}
          
          {/* デバッグボタン */}
          <div className="mt-4 space-x-2 space-y-2">
            <button 
              onClick={clearAllStorage}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              ストレージクリア & リロード
            </button>
            <button 
              onClick={forceCheckAuth}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              認証再チェック
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
            >
              ログインページへ
            </button>
            {isLoading && (
              <button 
                onClick={forceStopLoading}
                className="px-3 py-1 bg-orange-500 text-white rounded text-sm"
              >
                強制リロード（ローディング解除）
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-blue-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          認証状態を確認中...
          <div className="text-sm text-gray-600 mt-2">
            長時間この状態が続く場合は、上記の「強制リロード」ボタンをお試しください
          </div>
        </div>
      )}

      {!isLoading && !user && mounted && (
        <div className="text-red-600">
          ユーザーが見つかりません
          <div className="mt-2 text-sm text-gray-600">
            認証が完了していないか、セッションが期限切れの可能性があります
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded mt-4"
          >
            ログインページへ
          </button>
        </div>
      )}

      {!isLoading && user && mounted && (
        <div className="text-green-600">
          <div className="text-2xl mb-4">🎉 ログイン成功！</div>
          <p className="text-lg text-gray-700 mb-4">
            ようこそ、{user.email}さん！<br />
            社内の知見やノウハウを共有し、繋がりを深めましょう。
          </p>
          <button 
            onClick={signOut}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
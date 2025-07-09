'use client';

import { signInWithRedirect } from 'aws-amplify/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';

/**
 * ユーザー認証と認証後のデータ表示を管理するメインコンポーネント
 * * @remarks
 * このコンポーネントは、'useAuth'フックを通じて認証状態（ユーザー情報、ロード状態）を取得し、
 * Googleによるソーシャルサインイン、サインアウト、およびAPIからのデータ取得機能を提供します。
 * * @returns 認証状態に応じたUIのJSX.Element
 */
export default function AuthComponent() {
  const { user, isLoading, signOut } = useAuth();
  const [apiData, setApiData] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /**
   * Googleによるソーシャルサインイン処理を開始します。
   * @remarks
   * Amplify Authの`signInWithRedirect`を呼び出し、Googleの認証ページにリダイレクトします。
   */
  const handleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  /**
   * 認証済みユーザーのために'/posts'エンドポイントからデータを取得します。
   * * @remarks
   * 取得したデータは`apiData` stateに、エラーが発生した場合は`fetchError` stateにセットされます。
   * `user` stateが存在する場合にのみ実行されます。
   */
  const fetchApiData = async () => {
    if (!user) return;

    setFetchError(null);

    try {
      const data = await apiClient.get("/posts")
      if (data) {
        setApiData(data)
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setFetchError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  /**
   * userオブジェクトが変更された（主にログインが完了した）際に、
   * APIからのデータ取得を自動的にトリガーします。
   */
  useEffect(() => {
    if (user) {
      fetchApiData();
    }
  }, [user]);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      {user ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
          <p className="mb-4">User ID: {user.email}</p>
          
          <div>
            <button 
              onClick={signOut}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>

          {fetchError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {fetchError}
            </div>
          )}

          {apiData && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-bold mb-2">API Data:</h3>
              <pre className="text-sm overflow-auto">
                {apiData ? JSON.stringify(apiData, null, 2) : 'No data'}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
          <button 
            onClick={handleSignIn}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign In with Google
          </button>
        </div>
      )}
    </div>
  );
}
'use client';

import { signInWithRedirect } from 'aws-amplify/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';
import { useAlert } from '@/contexts/AlertContext';

/**
 * ユーザー認証と認証後のデータ表示を管理するメインコンポーネント
 * * @remarks
 * このコンポーネントは、'useAuth'フックを通じて認証状態（ユーザー情報、ロード状態）を取得し、
 * Googleによるソーシャルサインイン、サインアウト、およびAPIからのデータ取得機能を提供します。
 * * @returns 認証状態に応じたUIのJSX.Element
 */
export default function AuthComponent() {
  const { user, isLoading, signOut } = useAuth();
  const { showAlert } = useAlert();
  const [apiData, setApiData] = useState<any>(null);

  /**
   * Googleによるソーシャルサインイン処理を開始します。
   * @remarks
   * Amplify Authの`signInWithRedirect`を呼び出し、Googleの認証ページにリダイレクトします。
   */
  const handleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (_) {
      showAlert("認証エラー", "サインインに失敗しました", "error")
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

    try {
      const data = await apiClient.get("/posts")
      if (data) {
        setApiData(data)
      }
    } catch (_) {
      showAlert("取得エラー", "投稿情報の取得に失敗しました", "error")
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
    <>
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
      <div className='fixed bottom-4 right-4 bg-logo text-white px-5 py-5 rounded-full text-2xl font-bold'>つながりを作る</div>
    </>
  );
}
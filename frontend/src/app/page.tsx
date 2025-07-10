'use client';

import { signInWithRedirect } from 'aws-amplify/auth';
import { useAuth } from '@/contexts/AuthContext';
import { ChangeEvent, useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';
import { useAlert } from '@/contexts/AlertContext';
import Header from '@/components/Header';
import { useModal } from '@/contexts/ModalContext';
import { usePostCreation } from '@/contexts/PostCreationContext';
import { useRouter } from 'next/navigation';

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
  const { showModal, hideModal } = useModal();
  const { setTitle } = usePostCreation();
  const [apiData, setApiData] = useState<any>(null);
  const [filter, setFilter] = useState<string>("");
  const [tempTitle, setTempTitle] = useState("");
  const router = useRouter();
  const [error, setError] = useState<string | null>("");

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

  const handleOpenCreateModal = () => {
    const validateCheck = () => {
      if(tempTitle.trim() == '') {
        return true;
      }
      return false;
    }
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;

      setTitle(newTitle);
      if(tempTitle.trim() == '') {
        setError('1文字以上で入力してください。')
      } else {
        setError(null)
      }
    }
    const handleConfirm = () => {
      setTitle(tempTitle);
      hideModal();
      if(tempTitle.trim() == '') {
        showAlert("入力値エラー", "1文字以上で入力してください。", "error")
      }
      router.push('/create')
    }
    showModal(
       <div>
        <h2 className="text-2xl font-bold mb-4">タイトル<span className='text-red-600'>*</span></h2>
        <input
          type="text"
          onChange={handleChange}
          className='w-full p-4 outline outline-desc rounded-full focus:outline-2 focus:outline-logo'
          placeholder='タイトル'
        />
        {error && <p className='text-red-500 text-sm mt-1 ml-4'>{error}</p>}
      </div>,
      {
        confirmText: "確定",
        onConfirm: handleConfirm
      }
    )
  }

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
      <Header filter={filter} setFilter={setFilter} />
      <div className="p-4 pt-20">
        {user ? (
          <div className='flex flex-row justify-center'>
            <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
            <div className='flex flex-col'></div>
          </div>
        ) : (
          <div className='hidden'>
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
      <div
        className='fixed bottom-4 right-4 bg-logo text-white px-5 py-5 rounded-full text-2xl font-bold'
        onClick={handleOpenCreateModal}
      >つながりを作る</div>
    </>
  );
}
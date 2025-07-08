'use client';
import { signInWithRedirect } from 'aws-amplify/auth';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ユーザー認証と認証後のデータ表示を管理するメインコンポーネント
 * 
 * @remarks
 * このコンポーネントは、'useAuth'フックを通じて認証状態（ユーザー情報、ロード状態）を取得し、
 * Googleによるソーシャルサインイン、サインアウト、およびAPIからのデータ取得機能を提供します。
 * 
 * @returns 認証状態に応じたUIのJSX.Element
 */
export default function AuthComponent() {
  const {user, isLoading, signOut } = useAuth();

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
   * 
   * @remarks
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
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome!</h2>
          <p>User ID: {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <h2>Please sign in</h2>
          <button onClick={handleSignIn}>Sign In with Google</button>
        </div>
      )}
    </div>
  );
}
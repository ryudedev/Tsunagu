"use client"

import Icon from '@/components/Icon';
import { useAlert } from '@/contexts/AlertContext';
import { signInWithRedirect } from '@aws-amplify/auth';

/**
 * 認証ページを表示する初期ページです。
 * 
 * @remarks
 * このコンポーネントは、Googleによるソーシャルサインインを提供します。
 * 
 * @returns 認証画面のJSX.Element
 */
export default function LoginPage() {
    /** ログインボタン押下後の状態を保持するstate */
    const [isLoading, setIsLoading] = useState(false);
    /** アラート表示のための`showAlert`を読み込み */
    const { showAlert } = useAlert();

    /**
     * Googleによるソーシャルサインイン処理を開始します。
     * 
     * @remarks
     * Amplify Authの`signInWithRedirect`を呼び出し、Google認証ページにリダイレクトします。
     * 失敗した場合は、ユーザーに分かりやすいエラーを表示し、開発者向けに詳細をログ出力します。
     */
    const handleGoogleSignIn = async () => {
        setIsLoading(true);

        try {
            await signInWithRedirect({
                provider: 'Google'
            });
        } catch (_) {
            showAlert(
                'ログインエラー',
                'ログイン処理中に問題が発生しました。時間をおいて再度お試しいただくか、管理者にお問い合わせください。',
                'error'
            );
            
            setIsLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center gap-4">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">ログイン</h1>
                
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 disabled:opacity-50 flex items-center justify-center space-x-2 w-48"
                >
                    {isLoading ? <Icon.Loading className="h-5 w-5" /> : <span>Googleでログイン</span>}
                </button>
            </div>
        </div>
    );
}
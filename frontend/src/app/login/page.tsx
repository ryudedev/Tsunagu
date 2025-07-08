"use client"

import Icon from '@/components/Icon';
import { useAlert } from '@/contexts/AlertContext';
import { signInWithRedirect } from '@aws-amplify/auth';
import { useState } from 'react';

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
        <label
            className={`relative w-screen h-screen flex flex-col justify-center items-center cursor-pointer`}
        >
            <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="font-bold text-3xl text-desc cursor-pointer hover:text-white"
            >
                {isLoading ? (
                    <Icon.Loading className="h-5 w-5" />
                ) : (
                    <span
                        className="animate-google-colors"
                    >Googleでログイン</span>
                )}
            </button>
        </label>
    );
}
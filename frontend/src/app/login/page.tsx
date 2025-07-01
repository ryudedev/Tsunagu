"use client";

import { Amplify } from 'aws-amplify';
import { signInWithRedirect } from 'aws-amplify/auth';

// --- このページ内でAmplifyの設定を完結させます ---
// 1. 環境変数が正しく読み込まれているかを確認
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

// 2. もし環境変数が一つでもなければ、エラーを表示
if (!userPoolId || !userPoolClientId || !cognitoDomain || !appUrl) {
  throw new Error("Cognitoの環境変数が.env.localファイルに正しく設定されていません。");
}

// 3. Amplifyライブラリに設定を適用
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId,
      loginWith: {
        oauth: {
          domain: cognitoDomain,
          scopes: ['openid', 'email', 'profile'],
          // Cognito側の設定と完全に一致させる
          redirectSignIn: [`${appUrl}/api/auth/callback`],
          redirectSignOut: [`${appUrl}/login`],
          responseType: 'code',
        },
      },
    },
  },
}, { ssr: true });

export default function FinalLoginPage() {

  const handleGoogleLogin = async () => {
    try {
      // Googleログインを開始
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert(`ログイン中にエラーが発生しました: ${error}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-2">Tsunagu</h1>
        <p className="text-gray-600 mb-8">社内の知見を繋げよう</p>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          Googleでログイン
        </button>
      </div>
    </div>
  );
}

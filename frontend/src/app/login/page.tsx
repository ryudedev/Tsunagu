"use client";

import { signInWithRedirect } from 'aws-amplify/auth';

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
    <label className="w-screen h-screen flex items-center justify-center cursor-pointer">
        <button
          onClick={handleGoogleLogin}
          className="text-desc text-2xl cursor-pointer font-bold"
        >
          Googleでログイン
        </button>
    </label>
  );
}
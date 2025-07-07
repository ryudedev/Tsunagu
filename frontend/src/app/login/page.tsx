"use client"

import { signInWithRedirect } from '@aws-amplify/auth';
import { useState } from 'react';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            console.log('Attempting Google sign in...');
            
            await signInWithRedirect({
                provider: 'Google'
            });
        } catch (error) {
            console.error('Sign in error:', error);
            setError(error instanceof Error ? error.message : 'Unknown error occurred');
            setIsLoading(false);
        }
    };

    // 直接 Cognito Hosted UI にリダイレクトする関数（デバッグ用）
    const handleDirectHostedUI = () => {
        const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
        const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
        const redirectUri = encodeURIComponent(window.location.origin);
        
        const hostedUIUrl = `https://${cognitoDomain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=email+openid+profile&identity_provider=Google`;
        
        console.log('Hosted UI URL:', hostedUIUrl);
        window.location.href = hostedUIUrl;
    };

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center gap-4">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">ログイン</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        エラー: {error}
                    </div>
                )}
                
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 disabled:opacity-50"
                >
                    {isLoading ? 'ログイン中...' : 'Googleでログイン'}
                </button>
                
                <br />
                
                <button
                    onClick={handleDirectHostedUI}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    直接 Hosted UI にアクセス（デバッグ用）
                </button>
            </div>
            
            <div className="text-sm text-gray-600">
                <p>デバッグ情報:</p>
                <p>Domain: {process.env.NEXT_PUBLIC_COGNITO_DOMAIN}</p>
                <p>Client ID: {process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID}</p>
            </div>
        </div>
    );
}
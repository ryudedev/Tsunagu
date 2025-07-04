"use client"

import { signInWithRedirect } from '@aws-amplify/auth';

export default function LoginPage() {

    const handleGoogleSignIn = async () => {
        try {
            await signInWithRedirect({
                provider: 'Google'
            });
        } catch (error) {
            console.error('Sign in error:', error);
        }
    };

    return (
        <label className="cursor-pointer w-screen h-screen flex justify-center items-center">
            <button
                onClick={handleGoogleSignIn}
                className="cursor-pointer text-desc text-3xl font-bold"
            >
                Googleでログイン
            </button>
        </label>
    );
}
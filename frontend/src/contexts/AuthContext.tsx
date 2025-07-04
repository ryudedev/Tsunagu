"use client"

import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { getCurrentUser, fetchUserAttributes, signOut, type FetchUserAttributesOutput } from "@aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useRouter } from "next/navigation";

interface AuthState {
    user: FetchUserAttributesOutput | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);
export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<FetchUserAttributesOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // セッションの確認関数
    const checkCurrentUser = async () => {
        
        try {
            console.log("[AuthContext] Checking current user...");
            const currentUser = await getCurrentUser();
            console.log("[AuthContext] Current user found:", currentUser.username);
            
            const attributes = await fetchUserAttributes();
            console.log("[AuthContext] User attributes fetched:", attributes);
            
            setUser(attributes);
            setIsLoading(false);
        } catch (error) {
            console.log("[AuthContext] No current user or error:", error);
            setUser(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("[AuthContext] Setting up Hub listener and initial auth check");
        
        // Hub リスナーを設定
        const hubListener = Hub.listen('auth', ({payload}) => {
            console.log("[AuthContext] Hub event received:", payload.event);
            
            switch (payload.event) {
                case 'signedIn':
                    checkCurrentUser();
                    break;
                case 'signInWithRedirect':
                    checkCurrentUser();
                    break;
                case 'signedOut':
                    setUser(null);
                    setIsLoading(false);
                    router.replace('/login');
                    break;
                case 'signInWithRedirect_failure':
                    setUser(null);
                    setIsLoading(false);
                    router.replace('/login?error=oauth_failed');
                    break;
                case 'tokenRefresh':
                    // トークンがリフレッシュされた場合は特に何もしない
                    break;
                case 'tokenRefresh_failure':
                    setUser(null);
                    setIsLoading(false);
                    break;
            }
        });

        // 初回読み込み時のセッション確認
        checkCurrentUser();

        // 認証処理のタイムアウト設定を30秒に延長
        const timeoutId = setTimeout(() => {
            if (isLoading) {
                setIsLoading(false);
            }
        }, 30000); // 15秒から30秒に変更

        return () => {
            hubListener();
            clearTimeout(timeoutId);
        };
    }, [router]);

    const handleSignOut = async () => {
        try {
            setIsLoading(true);
            await signOut();
        } catch (error) {
            console.error('Sign out error:', error);
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{user, isLoading, signOut: handleSignOut}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthState => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
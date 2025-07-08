"use client"

import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { fetchUserAttributes, signOut, type FetchUserAttributesOutput } from "@aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { useRouter } from "next/navigation";

interface AuthState {
    user: FetchUserAttributesOutput | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}


const AuthContext = createContext<AuthState | undefined>(undefined);

/**
 * AuthProviderを提供します。
 * 
 * @remarks
 * ユーザー情報とローディング状態とサインアウト関数を保持し、ユーザーに提供します。
 * 
 * @param
 * - children: コンテンツを表示するための引数
 * 
 * @returns AuthProvider用のJSX.Element
 */
export const AuthProvider = ({children}: {children: ReactNode}) => {
    /** ユーザー情報を保持するstate */
    const [user, setUser] = useState<FetchUserAttributesOutput | null>(null);

    /** ローディング状態を保持するstate */
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    /**
     * 現在の認証ユーザーを確認するための関数
     * 
     * @remarks
     * Amplify Authの`fetchUserAttributes`を使用して認証ユーザー属性を取得し、`user` stateに登録する。
     */
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

     /**
     * コンポーネントのマウント時に認証状態を確認し、Amplify Hubの認証イベントを監視します。
     *
     * @remarks
     * - **初回実行**: `checkCurrentUser`を呼び出し、現在のセッション状態を確立します。
     * - **イベントリッスン**: Amplifyの'auth'チャネルをリッスンし、`signedIn`や`signedOut`などのイベントに応じて状態を更新、またはページ遷移を実行します。
     * - **タイムアウト処理**: 認証確認が長時間に及ぶ場合に備え、一定時間後にローディング状態を強制的に解除します。
     * - **クリーンアップ**: コンポーネントのアンマウント時にHubリスナーとタイマーを解除します。
     */
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

    /**
     * サインアウト関数を提供するための関数
     * 
     * @remark
     * Amplify Authの`signOut`を使ってユーザーの認証情報を破棄する。
     */
    const handleSignOut = async () => {
        try {
            setIsLoading(true);
            await signOut();
        } catch (error) {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{user, isLoading, signOut: handleSignOut}}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * AuthContextに簡単にアクセスするためのカスタムフックです。
 *
 * @remarks
 * このフックは、必ず`AuthProvider`の内側で呼び出す必要があります。
 * Providerの外で呼び出すと、実行時エラーがスローされます。
 *
 * @returns user, isLoading, signOutを含む認証状態オブジェクト。
 */
export const useAuth = (): AuthState => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
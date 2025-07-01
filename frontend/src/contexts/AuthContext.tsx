"use client"

import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { getCurrentUser, fetchUserAttributes, signOut, type FetchUserAttributesOutput } from "@aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
// import "@/lib/amplify-config";

// type: 認証状態
interface AuthState {
    user: FetchUserAttributesOutput | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<FetchUserAttributesOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {

        const hubListener = Hub.listen('auth', ({payload}) => {
            switch (payload.event) {
                case 'signedIn':
                    checkCurrentUser();
                    break;
                case 'signedOut':
                    setUser(null);
                    break;
            }
        })

        const checkCurrentUser = async() => {
            setIsLoading(true);

            try {
                // セッションの存在確認
                await getCurrentUser();

                const attributes = await fetchUserAttributes();
                setUser(attributes);
            } catch (error) {
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        checkCurrentUser();
        return () => hubListener();
    }, []);

    const handleSignOut = async() => {
        await signOut();
    }

    return (
        <AuthContext.Provider value={{user, isLoading, signOut: handleSignOut}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthState => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within on AuthProvider')
    }
    return context;
}
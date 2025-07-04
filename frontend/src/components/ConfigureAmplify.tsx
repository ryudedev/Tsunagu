// クライアントサイド用

"use client"
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
          scopes: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
          redirectSignIn: [`${process.env.NEXT_PUBLIC_APP_URL}/`],
          redirectSignOut: [`${process.env.NEXT_PUBLIC_APP_URL}/login`],
          responseType: 'code',
        },
      },
    },
  },
}, { ssr: true });

// 設定のみ読み込ませたいため返り値はなし
export default function ConfigureAmplify() {
  return null;
}
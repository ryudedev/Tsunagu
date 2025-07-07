// サーバーサイド用
import { type ResourcesConfig } from '@aws-amplify/core'
import { Amplify } from 'aws-amplify';

const config: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
          scopes: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
          redirectSignIn: [`${process.env.NEXT_PUBLIC_APP_URL}`],
          redirectSignOut: [`${process.env.NEXT_PUBLIC_APP_URL}/login`],
          responseType: 'code',
        },
      },
    },
  },
  API: {
    REST: {
      tsunaguApi: {
        endpoint: `${process.env.NEXT_PUBLIC_API_ENDPOINT}`,
        region: `${process.env.NEXT_PUBLIC_AWS_REGION}`,
      },
    },
  },
};

Amplify.configure(config);
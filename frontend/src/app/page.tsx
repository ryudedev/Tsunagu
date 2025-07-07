'use client';
import { signInWithRedirect, fetchAuthSession } from 'aws-amplify/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { get, post } from 'aws-amplify/api';

export default function AuthComponent() {
  const { user, isLoading, signOut } = useAuth();
  const [apiData, setApiData] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  const handleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  // 認証トークンを取得する関数（Lambda Authorizer用）
  const getAuthToken = async () => {
    try {
      const session = await fetchAuthSession();
      
      // Lambda Authorizerの場合、credentialsは不要
      console.log('Auth session:', {
        tokens: session.tokens ? 'Present' : 'Missing',
        credentials: session.credentials ? 'Present' : 'Missing (OK for Lambda Authorizer)'
      });
      
      // ID tokenを優先的に使用（Lambda AuthorizerがID tokenを期待している場合）
      if (session.tokens?.idToken) {
        console.log('Using ID token for Lambda Authorizer');
        return session.tokens.idToken.toString();
      }
      
      // ID tokenがない場合はAccess tokenを使用
      if (session.tokens?.accessToken) {
        console.log('Using Access token for Lambda Authorizer');
        return session.tokens.accessToken.toString();
      }
      
      throw new Error('No valid tokens found');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw error;
    }
  };

  // Amplify APIクライアントを使用（自動で認証ヘッダーが付与される）
  const fetchWithAmplifyApi = async (url: string) => {
    try {
      console.log('Fetching data from:', url);
      
      const restOperation = get({
        apiName: 'tsunaguApi',
        path: url,
        options: {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      });

      const response = await restOperation.response;
      console.log('Response status:', response.statusCode);
      console.log('Response headers:', response.headers);

      const data = await response.body.json();
      console.log('Response data:', data);
      
      return data;
    } catch (error) {
      console.error('Amplify API request error:', error);
      throw error;
    }
  };

  // 手動でAuthorizationヘッダーを設定したfetch（デバッグ用）
  const fetchWithManualAuth = async (url: string) => {
    try {
      const token = await getAuthToken();
      console.log('Making manual API call with token:', token.substring(0, 50) + '...');
      
      const fullUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}${url}`;
      console.log('Full URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Manual API response status:', response.status);
      console.log('Manual API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Manual API error response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Manual API response data:', data);
      
      return data;
    } catch (error) {
      console.error('Manual API call error:', error);
      throw error;
    }
  };

  // POST リクエスト（Amplify API）
  const postWithAmplifyApi = async (url: string, data: any) => {
    try {
      console.log('Posting data to:', url);
      
      const restOperation = post({
        apiName: 'tsunaguApi',
        path: url,
        options: {
          headers: {
            'Content-Type': 'application/json',
          },
          body: data
        }
      });

      const response = await restOperation.response;
      console.log('Response status:', response.statusCode);

      const responseData = await response.body.json();
      console.log('Response data:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('Amplify API POST error:', error);
      throw error;
    }
  };

  // POST リクエスト（手動）
  const postWithManualAuth = async (url: string, data: any) => {
    try {
      const token = await getAuthToken();
      console.log('Making manual POST with token:', token.substring(0, 50) + '...');
      
      const fullUrl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}${url}`;
      console.log('Full URL:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data)
      });
      
      console.log('Manual POST response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Manual POST error response:', errorText);
        throw new Error(`POST request failed: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Manual POST response data:', responseData);
      
      return responseData;
    } catch (error) {
      console.error('Manual POST error:', error);
      throw error;
    }
  };

  // トークン情報を詳細に確認
  const checkTokenInfo = async () => {
    try {
      const session = await fetchAuthSession();
      
      const tokenDetails = {
        hasTokens: !!session.tokens,
        hasCredentials: !!session.credentials,
        credentialsNote: "Credentials not needed for Lambda Authorizer",
        tokenTypes: {
          idToken: !!session.tokens?.idToken,
          accessToken: !!session.tokens?.accessToken
        }
      };
      
      if (session.tokens?.idToken) {
        try {
          const payload = session.tokens.idToken.payload;
          tokenDetails.idTokenPayload = {
            sub: payload.sub,
            email: payload.email,
            iss: payload.iss,
            aud: payload.aud,
            exp: payload.exp,
            iat: payload.iat
          };
        } catch (e) {
          console.error('Error parsing ID token payload:', e);
        }
      }
      
      console.log('Token Details:', tokenDetails);
      setTokenInfo(tokenDetails);
      
    } catch (error) {
      console.error('Token check error:', error);
      setFetchError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // API データを取得（Amplify API使用）
  const fetchApiData = async () => {
    if (!user) return;

    setIsFetching(true);
    setFetchError(null);

    try {
      const data = await fetchWithAmplifyApi('/posts');
      setApiData(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setFetchError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsFetching(false);
    }
  };

  // API データを取得（手動認証）
  const fetchApiDataManual = async () => {
    if (!user) return;

    setIsFetching(true);
    setFetchError(null);

    try {
      const data = await fetchWithManualAuth('/posts');
      setApiData(data);
    } catch (error) {
      console.error('Manual fetch error:', error);
      setFetchError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsFetching(false);
    }
  };

  // POST リクエストの例
  const createPost = async (postData: { title: string; content: string }) => {
    if (!user) return;

    setIsFetching(true);
    setFetchError(null);

    try {
      const data = await postWithAmplifyApi('/posts', postData);
      console.log('Created post:', data);
      
      // 投稿作成後、一覧を再取得
      await fetchApiData();
    } catch (error) {
      console.error('Create post error:', error);
      setFetchError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsFetching(false);
    }
  };

  // 手動POST
  const createPostManual = async (postData: { title: string; content: string }) => {
    if (!user) return;

    setIsFetching(true);
    setFetchError(null);

    try {
      const data = await postWithManualAuth('/posts', postData);
      console.log('Created post (manual):', data);
      
      // 投稿作成後、一覧を再取得
      await fetchApiData();
    } catch (error) {
      console.error('Create post manual error:', error);
      setFetchError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsFetching(false);
    }
  };

  // デバッグ用のテスト関数群
  const debugTokenDetails = async () => {
    try {
      const session = await fetchAuthSession();
      
      if (session.tokens?.idToken) {
        const token = session.tokens.idToken.toString();
        console.log('=== ID Token Details ===');
        console.log('Token length:', token.length);
        console.log('Token starts with:', token.substring(0, 20));
        console.log('Token header (decoded):', JSON.parse(atob(token.split('.')[0])));
        console.log('Token payload:', session.tokens.idToken.payload);
        
        // トークンの有効期限チェック
        const exp = session.tokens.idToken.payload.exp;
        const now = Math.floor(Date.now() / 1000);
        console.log('Token expires at:', new Date(exp * 1000));
        console.log('Current time:', new Date(now * 1000));
        console.log('Token valid for:', Math.floor((exp - now) / 60), 'minutes');
      }
      
    } catch (error) {
      console.error('Token debug error:', error);
    }
  };

  const testLambdaAuthorizer = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString();
      
      if (!token) {
        throw new Error('No token available');
      }
      
      console.log('=== Lambda Authorizer Test ===');
      
      // 異なるAuthorization形式をテスト
      const authFormats = [
        `Bearer ${token}`,
        `bearer ${token}`,
        token, // Bearer prefix なし
      ];
      
      const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
      console.log(authFormats)
      
      for (const [index, auth] of authFormats.entries()) {
        console.log(`Testing auth format ${index + 1}:`, auth.substring(0, 20) + '...');
        
        try {
          const response = await fetch(`${endpoint}/posts`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': auth,

            },
          });
          
          console.log(`Format ${index + 1} response status:`, response.status);
          
          if (response.ok) {
            console.log(`✅ Format ${index + 1} works!`);
            const data = await response.json();
            console.log('Response data:', data);
            return; // 成功したら終了
          } else {
            const errorText = await response.text();
            console.log(`Format ${index + 1} error:`, errorText);
          }
        } catch (error) {
          console.error(`Format ${index + 1} request error:`, error);
        }
      }
      
    } catch (error) {
      console.error('Lambda Authorizer test error:', error);
    }
  };

  const testApiEndpoint = async () => {
    try {
      const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
      console.log('=== API Endpoint Test ===');
      console.log('Endpoint:', endpoint);
      
      if (!endpoint) {
        throw new Error('NEXT_PUBLIC_API_ENDPOINT is not set');
      }
      
      // 認証なしでのリクエストを試す（401エラーが期待される）
      const noAuthResponse = await fetch(`${endpoint}/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('No auth response status:', noAuthResponse.status);
      console.log('No auth response headers:', Object.fromEntries(noAuthResponse.headers.entries()));
      
      if (noAuthResponse.status === 401) {
        console.log('✅ API Gateway is correctly rejecting unauthenticated requests');
      } else {
        console.log('⚠️ Unexpected response for unauthenticated request');
      }
      
    } catch (error) {
      console.error('API endpoint test error:', error);
    }
  };

  const runAllTests = async () => {
    console.log('🔍 Running comprehensive API tests...');
    
    await debugTokenDetails();
    await testApiEndpoint();
    await testLambdaAuthorizer();
    
    console.log('✅ All tests completed. Check the console output above for details.');
  };

  // ユーザーがログインしたときに自動でデータを取得
  useEffect(() => {
    if (user) {
      checkTokenInfo();
    }
  }, [user]);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      {user ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
          <p className="mb-4">User ID: {user.email}</p>
          
          <div className="mb-4 space-y-2">
            <div>
              <button 
                onClick={checkTokenInfo}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Check Token Info
              </button>
              
              <button 
                onClick={runAllTests}
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Run All Tests
              </button>
            </div>
            
            <div>
              <button 
                onClick={fetchApiData}
                disabled={isFetching}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
              >
                {isFetching ? 'Loading...' : 'Fetch Posts (Amplify)'}
              </button>
              
              <button 
                onClick={fetchApiDataManual}
                disabled={isFetching}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
              >
                {isFetching ? 'Loading...' : 'Fetch Posts (Manual)'}
              </button>
            </div>
            
            <div>
              <button 
                onClick={() => createPost({ title: 'Test Post (Amplify)', content: 'This is a test post via Amplify API' })}
                disabled={isFetching}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
              >
                {isFetching ? 'Creating...' : 'Create Post (Amplify)'}
              </button>
              
              <button 
                onClick={() => createPostManual({ title: 'Test Post (Manual)', content: 'This is a test post via manual fetch' })}
                disabled={isFetching}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
              >
                {isFetching ? 'Creating...' : 'Create Post (Manual)'}
              </button>
            </div>
            
            <div>
              <button 
                onClick={signOut}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>

          {fetchError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {fetchError}
            </div>
          )}

          {tokenInfo && (
            <div className="bg-blue-100 p-4 rounded mb-4">
              <h3 className="font-bold mb-2">Token Information:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(tokenInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">API Data:</h3>
            <pre className="text-sm overflow-auto">
              {apiData ? JSON.stringify(apiData, null, 2) : 'No data'}
            </pre>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
          <button 
            onClick={handleSignIn}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign In with Google
          </button>
        </div>
      )}
    </div>
  );
}
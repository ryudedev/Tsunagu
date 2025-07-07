import { fetchAuthSession } from 'aws-amplify/auth';

// --- トークン取得ロジック（page.tsxから移動） ---
const getAuthToken = async (): Promise<string | null> => {
  try {
    // IDトークンではなく、アクセストークンを使用する方が一般的です
    const session = await fetchAuthSession();
    return session.tokens?.accessToken.toString() ?? null;
  } catch (error) {
    console.log("Error getting auth token", error);
    return null;
  }
};

// --- APIクライアント本体 ---
const apiClient = {
  get: async (path: string) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authorization token found.");
    }
    
    // エンドポイントのURLは環境変数などから取得するのが望ましいですが、ここでは直接記述します
    const endpoint = `https://xil1459751.execute-api.ap-northeast-1.amazonaws.com/Dev${path}`;
    
    console.log(`[apiClient] GET: ${endpoint}`);
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  post: async (path: string, body: any) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authorization token found.");
    }
    
    const endpoint = `https://xil1459751.execute-api.ap-northeast-1.amazonaws.com/Dev${path}`;
    
    console.log(`[apiClient] POST: ${endpoint}`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};

export default apiClient;
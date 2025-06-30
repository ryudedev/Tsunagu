import os
import requests
from jose import jwk, jwt
from jose.utils import base64url_decode

# 環境変数からCognitoの情報を取得します
REGION = os.environ['AWS_REGION']
USER_POOL_ID = os.environ['USER_POOL_ID']

# Cognitoの公開鍵(JWKS)をダウンロードするためのURLを構築します
# この公開鍵を使って、トークンが本当にこのユーザープールから発行されたものかを確認します
KEYS_URL = f'https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json'

# Cognitoの公開鍵は頻繁に変わるものではないため、一度取得したらキャッシュしておきます
# これにより、Lambdaが呼び出されるたびに鍵をダウンロードする無駄を省きます
response = requests.get(KEYS_URL)
KEYS = response.json()['keys']

def lambda_handler(event, context):
    """
    API Gatewayからのリクエストを検証するLambdaオーソライザー
    """
    print(f"Authorizer event: {event}")

    # リクエストヘッダーから 'Authorization' トークンを取得します
    # 通常、"Bearer <TOKEN>" という形式で送られてきます
    token = event['headers'].get('Authorization')

    if not token:
        # トークンがなければ、問答無用でアクセスを拒否します
        raise Exception('Unauthorized: No token provided')

    # "Bearer "というプレフィックスを取り除き、トークン本体だけを抽出します
    if token.startswith('Bearer '):
        token = token.split(' ')[1]

    try:
        # --- ここからがJWTの検証処理です ---
        
        # 1. トークンのヘッダーをデコードして、どの公開鍵(kid)で署名されたかを確認します
        headers = jwt.get_unverified_headers(token)
        kid = headers['kid']

        # 2. キャッシュしておいた公開鍵リストから、対応するkidの鍵を探します
        key = next((k for k in KEYS if k['kid'] == kid), None)
        if not key:
            raise Exception('Unauthorized: Public key not found for the provided token')

        # 3. 公開鍵を使って、トークンの署名と有効期限などを検証します
        #    ここで改ざんや有効期限切れが検知されると、例外が発生します
        decoded_token = jwt.decode(
            token,
            key,
            algorithms=['RS256'],
            audience=None # audience(aud)の検証は、CognitoクライアントIDと一致するかを確認する場合に追加します
        )

        # --- 許可ポリシーの生成 ---
        
        # 検証に成功した場合、このリクエストを許可するIAMポリシーを生成して返します
        # `principalId`には、ユーザーを一意に識別するID(Cognitoのsub)を設定するのが一般的です
        principal_id = decoded_token['sub']
        
        # event['methodArn']には、呼び出されたAPIの情報(例: arn:aws:execute-api:...)が含まれています
        # これを使って、どのAPIへのアクセスを許可するかを指定します
        policy = generate_policy(principal_id, 'Allow', event['methodArn'])
        
        # 後続のLambda関数(CreatePostFunctionなど)に渡したいコンテキスト情報も追加できます
        # これにより、ビジネスロジック側でユーザー情報を安全に利用できます
        policy['context'] = {
            'userId': decoded_token.get('sub'),
            'userName': decoded_token.get('cognito:username'),
            'email': decoded_token.get('email')
        }

        print(f"Authorization successful. Policy: {policy}")
        return policy

    except jwt.ExpiredSignatureError:
        print("Auth Error: Token has expired")
        raise Exception('Unauthorized: Token has expired')
    except Exception as e:
        print(f"Auth Error: {e}")
        # その他のエラーの場合も、安全のためにアクセスを拒否します
        raise Exception('Unauthorized')


def generate_policy(principal_id, effect, resource):
    """
    API Gatewayに返すためのIAMポリシーを生成するヘルパー関数
    """
    return {
        'principalId': principal_id,
        'policyDocument': {
            'Version': '2012-10-17',
            'Statement': [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": effect,
                    "Resource": resource,
                }
            ]
        }
    }

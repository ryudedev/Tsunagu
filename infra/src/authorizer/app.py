import json
import boto3
import os
from typing import Dict, Any
import base64
import json as json_module

# Cognito client
cognito_client = boto3.client('cognito-idp')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API Gateway Lambda Authorizer
    Cognito JWT トークンを検証し、認証結果を返す
    """
    
    try:
        # デバッグ用：イベント全体をログ出力
        print(f"Event: {json.dumps(event, indent=2)}")
        
        # Authorization ヘッダーからトークンを取得（複数のパターンに対応）
        token = extract_token_from_event(event)
        
        if not token:
            print("ERROR: No valid authorization token found")
            raise Exception('Authorization token not provided')
        
        print(f"Extracted token: {token[:50]}...")  # 最初の50文字のみログ出力
        
        # Bearer トークンの場合、"Bearer " を除去
        if token.startswith('Bearer '):
            token = token[7:]
            print("Removed 'Bearer ' prefix")
        
        # トークンの前後の空白を除去
        token = token.strip()
        
        # Cognito User Pool ID を環境変数から取得
        user_pool_id = os.environ.get('USER_POOL_ID')
        
        if not user_pool_id:
            print("ERROR: USER_POOL_ID environment variable not set")
            raise Exception('USER_POOL_ID environment variable not set')
        
        print(f"User Pool ID: {user_pool_id}")
        
        # JWTトークンの基本検証
        token_parts = token.split('.')
        if len(token_parts) != 3:
            print(f"Invalid JWT token format. Parts count: {len(token_parts)}")
            raise Exception('Invalid JWT token format')
        
        # JWTトークンをデコードしてペイロードを確認
        try:
            # JWT の payload 部分をデコード（検証なし）
            payload = token_parts[1]
            # Base64 パディングを調整
            rem = len(payload) % 4
            if rem > 0:
                payload += '=' * (4 - rem)
            decoded_payload = base64.urlsafe_b64decode(payload)
            token_data = json_module.loads(decoded_payload)
            
            print(f"Token payload: {json.dumps(token_data, indent=2)}")
            token_use = token_data.get('token_use')
            print(f"Token use: {token_use}")
            
            # トークンの有効期限チェック
            import time
            current_time = int(time.time())
            exp = token_data.get('exp')
            if exp and current_time > exp:
                print(f"Token expired. Current time: {current_time}, Expiry: {exp}")
                raise Exception('Token has expired')
            
            # User Pool ID の検証
            iss = token_data.get('iss')
            expected_iss = f"https://cognito-idp.{os.environ.get('AWS_REGION', 'ap-northeast-1')}.amazonaws.com/{user_pool_id}"
            if iss != expected_iss:
                print(f"Invalid issuer. Expected: {expected_iss}, Got: {iss}")
                raise Exception('Invalid token issuer')
            
            # ユーザー情報の取得
            user_id, email = extract_user_info(token_data, token, token_use)
                
        except Exception as decode_error:
            print(f"Token decode error: {str(decode_error)}")
            print(f"Token decode error type: {type(decode_error)}")
            raise decode_error
        
        if not user_id:
            raise Exception('User ID not found in token')
            
        print(f"Final User ID: {user_id}")
        print(f"Final Email: {email}")
        
        # ポリシーを生成
        policy = generate_policy(user_id, 'Allow', event['methodArn'])
        
        # コンテキストにユーザー情報を追加
        policy['context'] = {
            'userId': user_id,
            'email': email or 'unknown'
        }
        
        print(f"Generated policy: {json.dumps(policy, indent=2)}")
        
        return policy
        
    except Exception as e:
        print(f"Authorization failed: {str(e)}")
        print(f"Exception type: {type(e)}")
        
        # より詳細なエラー情報をログ出力
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        
        # 認証に失敗した場合は Unauthorized エラーを発生させる
        raise Exception('Unauthorized')

def extract_token_from_event(event: Dict[str, Any]) -> str:
    """
    イベントから認証トークンを抽出する（複数のパターンに対応）
    """
    # 1. authorizationToken から取得（Lambda Authorizer の標準）
    token = event.get('authorizationToken')
    if token:
        print(f"Token found in authorizationToken: {token[:50]}...")
        return token
    
    # 2. headers から取得（大文字小文字を区別しない）
    headers = event.get('headers', {})
    print(f"Available headers: {list(headers.keys())}")
    
    # 一般的な Authorization ヘッダーのパターン
    auth_header_patterns = ['authorization', 'Authorization', 'AUTHORIZATION']
    
    for pattern in auth_header_patterns:
        if pattern in headers:
            token = headers[pattern]
            print(f"Token found in headers[{pattern}]: {token[:50]}...")
            return token
    
    # 3. 大文字小文字を区別しない検索
    for key, value in headers.items():
        if key.lower() == 'authorization':
            token = value
            print(f"Token found in headers[{key}] (case-insensitive): {token[:50]}...")
            return token
    
    # 4. multiValueHeaders から取得（API Gateway v2 の場合）
    multi_value_headers = event.get('multiValueHeaders', {})
    if multi_value_headers:
        print(f"Available multiValueHeaders: {list(multi_value_headers.keys())}")
        for key, values in multi_value_headers.items():
            if key.lower() == 'authorization' and values:
                token = values[0]  # 最初の値を使用
                print(f"Token found in multiValueHeaders[{key}]: {token[:50]}...")
                return token
    
    # 5. requestContext から取得（API Gateway の場合）
    request_context = event.get('requestContext', {})
    if request_context:
        authorizer = request_context.get('authorizer', {})
        if authorizer:
            token = authorizer.get('authorizationToken')
            if token:
                print(f"Token found in requestContext.authorizer: {token[:50]}...")
                return token
    
    return None

def extract_user_info(token_data: Dict[str, Any], token: str, token_use: str) -> tuple:
    """
    トークンからユーザー情報を抽出する
    """
    user_id = None
    email = None
    
    if token_use == 'id' or ('aud' in token_data and 'email' in token_data):
        print("ID Token detected. Extracting user info from token.")
        user_id = token_data.get('sub')
        email = token_data.get('email')
        
        if not user_id:
            raise Exception('User ID not found in ID token')
            
        print(f"User ID from ID token: {user_id}")
        print(f"Email from ID token: {email}")
        
    elif token_use == 'access':
        print("Access Token detected. Using get_user API.")
        try:
            response = cognito_client.get_user(AccessToken=token)
            print(f"Cognito get_user response: {json.dumps(response, indent=2, default=str)}")
            
            # ユーザー情報を取得
            user_id = response.get('Username')  # Access tokenの場合はUsernameが主キー
            
            for attr in response['UserAttributes']:
                if attr['Name'] == 'sub':
                    user_id = attr['Value']
                elif attr['Name'] == 'email':
                    email = attr['Value']
                    
            print(f"User ID from Access token: {user_id}")
            print(f"Email from Access token: {email}")
            
        except Exception as cognito_error:
            print(f"Cognito get_user error: {str(cognito_error)}")
            # Access tokenでエラーが発生した場合、ID tokenとして処理を試行
            print("Trying to process as ID token...")
            user_id = token_data.get('sub')
            email = token_data.get('email')
            
            if not user_id:
                raise Exception('User ID not found in token')
                
    else:
        raise Exception(f'Invalid token_use: {token_use}')
    
    return user_id, email

def generate_policy(principal_id: str, effect: str, resource: str) -> Dict[str, Any]:
    """
    IAM ポリシーを生成
    """
    auth_response = {
        'principalId': principal_id
    }
    
    if effect and resource:
        policy_document = {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Action': 'execute-api:Invoke',
                    'Effect': effect,
                    'Resource': resource
                }
            ]
        }
        auth_response['policyDocument'] = policy_document
    
    return auth_response
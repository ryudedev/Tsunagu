import json
import boto3
import os
from datetime import datetime

def lambda_handler(event, context):
    # CORS設定を改善
    cors_headers = {
        'Access-Control-Allow-Origin': 'http://localhost:3000',  # 本番環境では適切なドメインに変更
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Credentials': 'true'  # 認証情報を含むリクエストに対応
    }
    
    print(f"Event: {json.dumps(event, indent=2)}")
    
    # OPTIONSリクエストの処理（プリフライトリクエスト）
    if event.get('httpMethod') == 'OPTIONS':
        print("Handling OPTIONS request")
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    try:
        # Lambda Authorizerから渡されたユーザー情報を取得
        request_context = event.get('requestContext', {})
        authorizer = request_context.get('authorizer', {})
        user_id = authorizer.get('userId')
        email = authorizer.get('email')
        
        print(f"User ID from authorizer: {user_id}")
        print(f"Email from authorizer: {email}")
        
        if not user_id:
            print("ERROR: User ID not found in authorizer context")
            return {
                'statusCode': 401,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Unauthorized: User ID not found'})
            }
        
        # DynamoDB処理
        dynamodb = boto3.resource('dynamodb')
        table_name = os.environ.get('POSTS_TABLE_NAME')
        
        if not table_name:
            print("ERROR: POSTS_TABLE_NAME environment variable not set")
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Server configuration error'})
            }
        
        table = dynamodb.Table(table_name)
        http_method = event.get('httpMethod')
        
        if http_method == 'GET':
            # 投稿一覧を取得
            print("Handling GET request")
            response = table.scan()
            
            # レスポンスデータを準備
            posts = response.get('Items', [])
            
            # 現在のユーザー情報も含めてレスポンス
            result = {
                'posts': posts,
                'user': {
                    'id': user_id,
                    'email': email
                },
                'total': len(posts)
            }
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(result, default=str)
            }
            
        elif http_method == 'POST':
            # 新しい投稿を作成
            print("Handling POST request")
            
            # リクエストボディを取得
            body = event.get('body', '{}')
            if isinstance(body, str):
                try:
                    body = json.loads(body)
                except json.JSONDecodeError:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Invalid JSON in request body'})
                    }
            
            title = body.get('title')
            content = body.get('content')
            
            if not title or not content:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Title and content are required'})
                }
            
            # 投稿データを準備
            import uuid
            post_id = str(uuid.uuid4())
            timestamp = datetime.now().isoformat()
            
            post_item = {
                'id': post_id,
                'title': title,
                'content': content,
                'author_id': user_id,
                'author_email': email,
                'created_at': timestamp,
                'updated_at': timestamp
            }
            
            # DynamoDBに保存
            table.put_item(Item=post_item)
            
            return {
                'statusCode': 201,
                'headers': cors_headers,
                'body': json.dumps({
                    'message': 'Post created successfully',
                    'post': post_item
                }, default=str)
            }
            
        else:
            return {
                'statusCode': 405,
                'headers': cors_headers,
                'body': json.dumps({'error': f'Method {http_method} not allowed'})
            }
            
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }
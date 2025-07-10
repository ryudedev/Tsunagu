import json
import boto3
import os
import base64

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('POSTS_TABLE_NAME'))

def lambda_handler(event, context):
    """
    DynamoDBから投稿をページネーションで取得します。
    - `limit`: 1ページあたりのアイテム数（デフォルトは100）
    - `last_key`: 次のページを開始するためのキー
    """
    print(f"Event: {json.dumps(event)}")
    
    # 1. クエリパラメータからlimitとlast_keyを取得
    query_params = event.get('queryStringParameters') or {}
    limit = int(query_params.get('limit', 100))
    last_key_str = query_params.get('last_key')
    
    scan_kwargs = {
        'Limit': limit
    }
    
    # 2. last_keyがあれば、それをデコードしてscanの開始点として設定
    if last_key_str:
        try:
            # Base64エンコードされたキーをデコード
            decoded_key = base64.urlsafe_b64decode(last_key_str.encode('utf-8'))
            scan_kwargs['ExclusiveStartKey'] = json.loads(decoded_key)
        except (json.JSONDecodeError, TypeError) as e:
            print(f"Invalid last_key format: {e}")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid last_key format'})
            }

    try:
        # 3. DynamoDBからデータをスキャン
        response = table.scan(**scan_kwargs)
        
        items = response.get('Items', [])
        
        # 4. 次のページがある場合、LastEvaluatedKeyをエンコードして返す
        last_evaluated_key = response.get('LastEvaluatedKey')
        next_key_encoded = None
        if last_evaluated_key:
            # URLで安全に渡せるようにBase64エンコード
            next_key_encoded = base64.urlsafe_b64encode(json.dumps(last_evaluated_key).encode('utf-8')).decode('utf-8')

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'items': items,
                'next_key': next_key_encoded # 次のページ用のキー
            })
        }
        
    except Exception as e:
        print(f"Error scanning DynamoDB: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not fetch posts'})
        }
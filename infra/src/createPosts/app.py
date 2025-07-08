import json
import boto3
import uuid
import os
from datetime import datetime

def lambda_handler(event, context):
    cors_headers = {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    }
    
    # OPTIONSリクエストの処理
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    try:
        # リクエストボディの解析
        body = json.loads(event['body']) if event.get('body') else {}
        
        # DynamoDB処理
        dynamodb = boto3.resource('dynamodb')
        table_name = os.environ['POSTS_TABLE_NAME']
        table = dynamodb.Table(table_name)
        
        item = {
            'postId': str(uuid.uuid4()),
            'title': body.get('title', ''),
            'content': body.get('content', ''),
            'createdAt': datetime.now().isoformat()
        }
        
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'headers': cors_headers,
            'body': json.dumps(item)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
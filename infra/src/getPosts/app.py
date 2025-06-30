import json

def lambda_handler(event, context):
    """
    "hello, world"を返すだけのシンプルなハンドラ
    """
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" # CORS設定
        },
        "body": json.dumps({"message": "hello, world"}),
    }
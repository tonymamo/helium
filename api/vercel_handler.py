from api.index import app

def handler(event):
    """
    AWS Lambda handler that processes API Gateway events
    """
    # Convert API Gateway event to ASGI scope
    path = event.get('path', '')
    if path.startswith('/api'):
        path = path[4:]  # Remove /api prefix
    
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}
    
    # Create ASGI scope
    scope = {
        'type': 'http',
        'method': event.get('httpMethod', 'GET'),
        'scheme': 'https',
        'server': (headers.get('host', ''), 443),
        'path': path,
        'query_string': event.get('queryStringParameters', {}),
        'headers': [(k.encode(), v.encode()) for k, v in headers.items()],
        'raw_path': path.encode(),
    }
    
    # Create ASGI message
    async def receive():
        return {
            'type': 'http.request',
            'body': event.get('body', '').encode() if event.get('body') else b'',
            'more_body': False
        }
    
    async def send(message):
        if message['type'] == 'http.response.start':
            nonlocal status_code, headers
            status_code = message['status']
            headers = message['headers']
        elif message['type'] == 'http.response.body':
            nonlocal body
            body = message['body']
    
    # Run the ASGI application
    status_code = 500
    headers = []
    body = b''
    
    async def run_app():
        await app(scope, receive, send)
    
    import asyncio
    asyncio.run(run_app())
    
    # Convert ASGI response to API Gateway response
    return {
        'statusCode': status_code,
        'headers': {k.decode(): v.decode() for k, v in headers},
        'body': body.decode() if isinstance(body, bytes) else body
    }

# Export the handler
__all__ = ["handler"] 
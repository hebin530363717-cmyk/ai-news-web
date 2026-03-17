# AI News API - Vercel Serverless Function
import os
import json
import requests
from datetime import datetime

# Tavily API 配置
TAVILY_API_KEY = os.environ.get('TAVILY_API_KEY', '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')
TAVILY_BASE_URL = 'https://api.tavily.com/search'

CATEGORY_KEYWORDS = {
    'all': 'AI artificial intelligence news',
    'llm': 'large language model LLM GPT Claude Gemini AI',
    'robot': 'humanoid robot AI robot Tesla Optimus',
    'tools': 'AI tools ChatGPT Claude AI software',
    'industry': 'AI industry news tech company'
}

def handler(request):
    """Vercel Serverless Function handler"""
    
    # 设置 CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    # 处理 OPTIONS 预检请求
    if request.method == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}
    
    path = request.path
    query_params = request.query
    
    # /api/news
    if path == '/api/news' or path.endswith('/news'):
        category = query_params.get('category', 'all')
        keyword = query_params.get('keyword', '')
        
        search_query = CATEGORY_KEYWORDS.get(category, CATEGORY_KEYWORDS['all'])
        if keyword:
            search_query = f"{keyword} {search_query}"
        
        try:
            response = requests.post(
                TAVILY_BASE_URL,
                json={
                    'api_key': TAVILY_API_KEY,
                    'query': search_query,
                    'search_depth': 'basic',
                    'max_results': 10
                },
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                
                news_list = []
                for i, item in enumerate(results):
                    news_list.append({
                        'id': str(i + 1),
                        'title': item.get('title', 'Untitled'),
                        'description': (item.get('content', '')[:200] + '...') if len(item.get('content', '')) > 200 else item.get('content', ''),
                        'url': item.get('url', '#'),
                        'source': item.get('source', 'Unknown'),
                        'publishedAt': item.get('published_on', datetime.now().strftime('%Y-%m-%d')),
                        'imageUrl': f'https://source.unsplash.com/400x300/?AI,tech&sig={i}',
                        'category': category
                    })
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(news_list)
                }
            else:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': 'API request failed'})
                }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': str(e)})
            }
    
    # /api/health
    if path == '/api/health' or path.endswith('/health'):
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'status': 'ok', 'time': datetime.now().isoformat()})
        }
    
    # 404
    return {
        'statusCode': 404,
        'headers': headers,
        'body': json.dumps({'error': 'Not found'})
    }

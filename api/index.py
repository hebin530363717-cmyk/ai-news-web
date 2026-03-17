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
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    # 处理 OPTIONS 预检请求
    if request.method == 'OPTIONS':
        return 200, cors_headers, ''
    
    # 获取路径和查询参数
    path = request.path
    
    # Vercel Python API 的查询参数访问方式
    query = {}
    if hasattr(request, 'query'):
        q = request.query
        if isinstance(q, str):
            from urllib.parse import parse_qs
            query = {k: v[0] if len(v) == 1 else v for k, v in parse_qs(q).items()}
        elif isinstance(q, dict):
            query = q
    
    category = query.get('category', ['all'])[0] if isinstance(query.get('category'), list) else query.get('category', 'all')
    keyword = query.get('keyword', [''])[0] if isinstance(query.get('keyword'), list) else query.get('keyword', '')
    
    # /api/news
    if path == '/api/news' or path == '/news' or path.endswith('/news'):
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
                    content = item.get('content', '')
                    news_list.append({
                        'id': str(i + 1),
                        'title': item.get('title', 'Untitled'),
                        'description': (content[:200] + '...') if len(content) > 200 else content,
                        'url': item.get('url', '#'),
                        'source': item.get('source', 'Unknown'),
                        'publishedAt': item.get('published_on', datetime.now().strftime('%Y-%m-%d')),
                        'imageUrl': f'https://source.unsplash.com/400x300/?AI,tech&sig={i}',
                        'category': category
                    })
                
                return 200, cors_headers, json.dumps(news_list)
            else:
                return 500, cors_headers, json.dumps({'error': 'API request failed', 'detail': response.text})
        except Exception as e:
            return 500, cors_headers, json.dumps({'error': str(e)})
    
    # /api/health
    if path == '/api/health' or path == '/health' or path.endswith('/health'):
        return 200, cors_headers, json.dumps({'status': 'ok', 'time': datetime.now().isoformat()})
    
    # 根路径 /api
    if path == '/api' or path == '/':
        return 200, cors_headers, json.dumps({'message': 'AI News API', 'endpoints': ['/news', '/health']})
    
    # 404
    return 404, cors_headers, json.dumps({'error': 'Not found'})

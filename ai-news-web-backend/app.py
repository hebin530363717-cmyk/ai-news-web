# AI News Backend
# Flask 后端 API

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import requests
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# Tavily API 配置
TAVILY_API_KEY = os.environ.get('TAVILY_API_KEY', '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')
TAVILY_BASE_URL = 'https://api.tavily.com/search'

# 新闻分类映射
CATEGORY_KEYWORDS = {
    'all': 'AI artificial intelligence news',
    'llm': 'large language model LLM GPT Claude Gemini AI',
    'robot': 'humanoid robot AI robot Tesla Optimus',
    'tools': 'AI tools ChatGPT Claude AI software',
    'industry': 'AI industry news tech company'
}

@app.route('/api/news', methods=['GET'])
def get_news():
    """获取新闻列表"""
    category = request.args.get('category', 'all')
    keyword = request.args.get('keyword', '')
    
    # 构建搜索查询
    search_query = CATEGORY_KEYWORDS.get(category, CATEGORY_KEYWORDS['all'])
    if keyword:
        search_query = f"{keyword} {search_query}"
    
    try:
        # 调用 Tavily API
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
            
            # 转换为前端需要的格式
            news_list = []
            for i, item in enumerate(results):
                news_list.append({
                    'id': str(i + 1),
                    'title': item.get('title', 'Untitled'),
                    'description': item.get('content', '')[:200] + '...' if len(item.get('content', '')) > 200 else item.get('content', ''),
                    'url': item.get('url', '#'),
                    'source': item.get('source', 'Unknown'),
                    'publishedAt': item.get('published_on', datetime.now().strftime('%Y-%m-%d')),
                    'imageUrl': f'https://source.unsplash.com/400x300/?AI,tech&sig={i}',
                    'category': category
                })
            
            return jsonify(news_list)
        else:
            return jsonify({'error': 'API request failed'}), 500
            
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({'status': 'ok', 'time': datetime.now().isoformat()})

# Vercel Serverless Handler
def handler(environ, start_response):
    return app(environ, start_response)

# 本地开发启动
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

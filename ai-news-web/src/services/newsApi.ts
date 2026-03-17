import type { NewsArticle } from '../types/news';

// API 基础地址 - Vercel 部署后会自动使用相对路径
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// 获取新闻列表
export async function fetchNews(
  category?: string, 
  keyword?: string
): Promise<NewsArticle[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') {
    params.set('category', category);
  }
  if (keyword) {
    params.set('keyword', keyword);
  }
  
  const url = `${API_BASE}/news${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  
  return response.json();
}

// 获取单条新闻详情
export async function fetchNewsById(id: string): Promise<NewsArticle | null> {
  const response = await fetch(`${API_BASE}/news/${id}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

// 健康检查
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

import type { NewsArticle } from '../types/news';
import { mockNews } from '../data/mockData';

// 获取新闻列表
export async function fetchNews(
  category?: string, 
  keyword?: string
): Promise<NewsArticle[]> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filtered = [...mockNews];
  
  // 按分类筛选
  if (category && category !== 'all') {
    filtered = filtered.filter(news => news.category === category);
  }
  
  // 按关键词搜索
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filtered = filtered.filter(
      news => 
        news.title.toLowerCase().includes(lowerKeyword) ||
        news.description.toLowerCase().includes(lowerKeyword)
    );
  }
  
  return filtered;
}

// 获取单条新闻详情
export async function fetchNewsById(id: string): Promise<NewsArticle | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockNews.find(news => news.id === id) || null;
}

// Tavily API 搜索（暂时用 mock）
export async function searchNewsFromAPI(keyword: string): Promise<NewsArticle[]> {
  console.log('Searching for:', keyword);
  const lowerKeyword = keyword.toLowerCase();
  return mockNews.filter(
    news => 
      news.title.toLowerCase().includes(lowerKeyword) ||
      news.description.toLowerCase().includes(lowerKeyword)
  );
}

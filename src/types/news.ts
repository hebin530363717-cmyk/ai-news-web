// AI 资讯类型定义
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  category: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  icon: string;
}

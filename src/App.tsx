import { useState, useEffect } from 'react';
import { Search, Sparkles, Clock } from 'lucide-react';
import type { NewsArticle } from './types/news';
import { categories } from './data/mockData';
import { fetchNews } from './services/newsApi';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载新闻
  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await fetchNews(
        selectedCategory === 'all' ? undefined : selectedCategory,
        searchKeyword || undefined
      );
      setNews(data);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadNews();
  }, []);

  // 搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadNews();
  };

  // 分类切换
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setTimeout(() => loadNews(), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 头部 */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                AI <span className="text-cyan-400">News</span>
              </h1>
            </div>

            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索 AI 资讯..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>
            </form>
          </div>

          {/* 分类标签 */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          // 加载状态
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-800/50 rounded-2xl overflow-hidden">
                  <div className="h-48 bg-slate-700/50" />
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-slate-700/50 rounded w-3/4" />
                    <div className="h-4 bg-slate-700/50 rounded w-full" />
                    <div className="h-4 bg-slate-700/50 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          // 空状态
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <Search className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">暂无资讯</h3>
            <p className="text-slate-500">试试其他关键词或分类</p>
          </div>
        ) : (
          // 新闻列表
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/30 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
              >
                {/* 图片 */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-slate-900/70 backdrop-blur-sm rounded-full text-xs text-cyan-400 font-medium">
                    {categories.find(c => c.id === article.category)?.name || article.category}
                  </span>
                </div>

                {/* 内容 */}
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors mb-2">
                    {article.title}
                  </h2>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {article.description}
                  </p>
                  
                  {/* 底部信息 */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">{article.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.publishedAt}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-slate-700/30 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © 2026 AI News · 由 AI 驱动 🚀
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

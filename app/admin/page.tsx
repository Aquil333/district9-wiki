import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp,
  Plus,
  Edit3,
  FolderOpen,
  BarChart3,
  Calendar,
  ChevronRight
} from "lucide-react";

async function getStats() {
  const [totalArticles, totalCategories, totalViews, recentArticles] = await Promise.all([
    prisma.article.count(),
    prisma.category.count(),
    prisma.article.aggregate({
      _sum: { views: true }
    }),
    prisma.article.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: { 
        category: true,
        author: true 
      }
    })
  ]);

  return {
    totalArticles,
    totalCategories,
    totalViews: totalViews._sum.views || 0,
    recentArticles
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/admin/login");
  }

  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
      {/* Header */}
      <header className="glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-purple-400 hover:text-purple-300">
                ← На сайт
              </Link>
              <span className="text-gray-600">|</span>
              <h1 className="text-xl font-montserrat font-bold text-white">
                Админ панель
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {session.user?.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-red-400 hover:text-red-300"
              >
                Выйти
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/admin/articles/new"
            className="glass rounded-lg p-6 hover:bg-white/5 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Новая статья</h3>
                <p className="text-sm text-gray-400">Создать новую статью</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <Plus className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </Link>

          <Link
            href="/admin/articles"
            className="glass rounded-lg p-6 hover:bg-white/5 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Все статьи</h3>
                <p className="text-sm text-gray-400">Управление контентом</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <Edit3 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="glass rounded-lg p-6 hover:bg-white/5 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Категории</h3>
                <p className="text-sm text-gray-400">Управление разделами</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <FolderOpen className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Всего статей</span>
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalArticles}</p>
            <p className="text-sm text-gray-500 mt-1">опубликовано</p>
          </div>

          <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Категорий</span>
              <FolderOpen className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalCategories}</p>
            <p className="text-sm text-gray-500 mt-1">разделов</p>
          </div>

          <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Просмотры</span>
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">всего просмотров</p>
          </div>

          <div className="glass rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Популярность</span>
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {stats.totalArticles > 0 ? Math.round(stats.totalViews / stats.totalArticles) : 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">просмотров на статью</p>
          </div>
        </div>

        {/* Recent Articles */}
        <div className="glass rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-montserrat font-bold text-white">
              Последние статьи
            </h2>
            <Link 
              href="/admin/articles" 
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              Все статьи
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {stats.recentArticles.length > 0 ? (
            <div className="space-y-4">
              {stats.recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{article.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{article.category.title}</span>
                      <span>•</span>
                      <span>{article.author.username}</span>
                      <span>•</span>
                      <span>{new Date(article.updatedAt).toLocaleDateString('ru-RU')}</span>
                      <span>•</span>
                      <span>{article.views} просмотров</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/${article.category.slug}/${article.slug}`}
                      target="_blank"
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Нет статей</p>
              <Link
                href="/admin/articles/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Создать первую статью
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
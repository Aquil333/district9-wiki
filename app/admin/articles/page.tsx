import DeleteArticleButton from "@/components/DeleteArticleButton";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle
} from "lucide-react";

async function getArticles() {
  const articles = await prisma.article.findMany({
    include: {
      category: true,
      author: {
        select: {
          username: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return articles;
}

export default async function AdminArticlesPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/admin/login");
  }

  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
      {/* Header */}
      <header className="glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-purple-400 hover:text-purple-300">
                ← Dashboard
              </Link>
              <span className="text-gray-600">|</span>
              <h1 className="text-xl font-montserrat font-bold text-white">
                Управление статьями
              </h1>
            </div>
            <Link
              href="/admin/articles/new"
              className="px-4 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Новая статья
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="glass rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по статьям..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                  text-white placeholder:text-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
            </div>
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Фильтры
            </button>
          </div>
        </div>

        {/* Articles Table */}
        {articles.length > 0 ? (
          <div className="glass rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-400 font-medium">Название</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Категория</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Автор</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Статус</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Просмотры</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Дата</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{article.title}</p>
                        {article.description && (
                          <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                            {article.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-300">
                        {article.category.title}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-300">
                        {article.author.username}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {article.published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Опубликовано
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                          <XCircle className="w-3 h-3" />
                          Черновик
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-gray-300">
                        {article.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-gray-400">
                        {new Date(article.updatedAt).toLocaleDateString('ru-RU')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${article.category.slug}/${article.slug}`}
                          target="_blank"
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                          title="Просмотр"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/articles/${article.slug}/edit`}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <DeleteArticleButton 
                          articleSlug={article.slug} 
                          articleTitle={article.title} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Статей пока нет</p>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-2 px-4 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Создать первую статью
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
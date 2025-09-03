import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { 
  ChevronRight, 
  FileText, 
  Clock, 
  Eye,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

async function getCategoryData(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: {
        include: {
          _count: {
            select: { articles: true }
          }
        }
      },
      articles: {
        where: { published: true },
        include: {
          author: {
            select: {
              username: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' }
        ]
      }
    }
  });

  return category;
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const category = await getCategoryData(resolvedParams.category);

  if (!category) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-purple-400 transition-colors">
          Главная
        </Link>
        {category.parent && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link 
              href={`/${category.parent.slug}`} 
              className="hover:text-purple-400 transition-colors"
            >
              {category.parent.title}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">{category.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-montserrat font-bold text-white mb-4">
          {category.title}
        </h1>
        {category.description && (
          <p className="text-lg text-gray-300">
            {category.description}
          </p>
        )}
      </header>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-montserrat font-semibold text-white mb-4">
            Подразделы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/${child.slug}`}
                className="glass rounded-lg p-4 hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {child.title}
                    </h3>
                    {child.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {child.description}
                      </p>
                    )}
                    <span className="text-xs text-gray-500 mt-2 inline-block">
                      {child._count.articles} статей
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Articles */}
      {category.articles.length > 0 ? (
        <section>
          <h2 className="text-xl font-montserrat font-semibold text-white mb-4">
            Статьи в разделе
          </h2>
          <div className="space-y-4">
            {category.articles.map((article) => (
              <Link
                key={article.id}
                href={`/${category.slug}/${article.slug}`}
                className="block glass rounded-lg p-6 hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {article.featured && (
                      <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full mb-2">
                        Рекомендуем
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors mb-2">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-gray-400 mb-3 line-clamp-2">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(article.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views} просмотров
                      </span>
                      {article.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime} мин чтения
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-purple-400">
                    <span className="text-sm group-hover:translate-x-1 transition-transform">
                      Читать →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="glass rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            В этом разделе пока нет статей
          </p>
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const category = await getCategoryData(resolvedParams.category);
  
  if (!category) {
    return {
      title: 'Раздел не найден - District 9 Wiki',
    };
  }

  return {
    title: `${category.title} - District 9 Wiki`,
    description: category.description || `Статьи в разделе ${category.title}`,
  };
}
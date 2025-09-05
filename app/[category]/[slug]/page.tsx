import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ArticleLayout from '@/components/ArticleLayout';

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Генерируем статические пути для всех статей
export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    select: {
      slug: true,
      category: {
        select: { slug: true }
      }
    }
  });

  return articles.map((article) => ({
    category: article.category.slug,
    slug: article.slug,
  }));
}

// Получаем данные статьи
async function getArticle(categorySlug: string, articleSlug: string) {
  const article = await prisma.article.findFirst({
    where: {
      slug: articleSlug,
      category: {
        slug: categorySlug
      },
      published: true
    },
    include: {
      category: {
        include: {
          parent: true
        }
      },
      author: {
        select: {
          username: true,
          email: true
        }
      },
      tags: true
    }
  });

  if (!article) {
    return null;
  }

  // Увеличиваем счетчик просмотров
  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } }
  });

  return article;
}

export default async function ArticlePage({ params }: PageProps) {
  // Await params как требует Next.js 15
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.category, resolvedParams.slug);

  if (!article) {
    notFound();
  }

  // Формируем хлебные крошки
  const breadcrumbs = [
    { title: 'Главная', href: '/' },
  ];

  if (article.category.parent) {
    breadcrumbs.push({
      title: article.category.parent.title,
      href: `/${article.category.parent.slug}`
    });
  }

  breadcrumbs.push({
    title: article.category.title,
    href: `/${article.category.slug}`
  });

  breadcrumbs.push({
    title: article.title
  });

  // Формируем оглавление из HTML заголовков
  const headingMatches = article.content.match(/<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi) || [];
  const toc = headingMatches.map((heading, index) => {
    const level = parseInt(heading.match(/<h([1-3])/i)?.[1] || '1');
    const title = heading.replace(/<[^>]*>/g, ''); // Убираем HTML теги
    const id = `heading-${index}`;
    return { id, title, level };
  });

  return (
    <ArticleLayout
      title={article.title}
      category={article.category.title}
      breadcrumbs={breadcrumbs}
      readTime={article.readTime ? `${article.readTime} мин` : undefined}
      views={article.views}
      lastUpdated={new Date(article.updatedAt).toLocaleDateString('ru-RU')}
      toc={toc}
    >
      {/* Отображаем HTML контент от TipTap редактора */}
      <div 
        className="prose prose-invert prose-purple max-w-none
          prose-h1:text-3xl prose-h1:font-montserrat prose-h1:font-bold prose-h1:text-white prose-h1:mb-6 prose-h1:mt-8
          prose-h2:text-2xl prose-h2:font-montserrat prose-h2:font-bold prose-h2:text-white prose-h2:mb-4 prose-h2:mt-6
          prose-h3:text-xl prose-h3:font-montserrat prose-h3:font-semibold prose-h3:text-white prose-h3:mb-3 prose-h3:mt-4
          prose-p:text-gray-300 prose-p:mb-4 prose-p:leading-relaxed
          prose-ul:list-disc prose-ul:list-inside prose-ul:text-gray-300 prose-ul:mb-4 prose-ul:space-y-2
          prose-ol:list-decimal prose-ol:list-inside prose-ol:text-gray-300 prose-ol:mb-4 prose-ol:space-y-2
          prose-li:text-gray-300
          prose-a:text-purple-400 prose-a:hover:text-purple-300 prose-a:underline prose-a:underline-offset-2
          prose-code:bg-black/50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-purple-400 prose-code:text-sm
          prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:mb-6
          prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400 prose-blockquote:my-4
          prose-hr:border-white/10 prose-hr:my-8
          prose-strong:text-white prose-strong:font-semibold
          prose-em:text-gray-300
          prose-img:rounded-lg prose-img:my-4 prose-img:mx-auto"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Теги */}
      {article.tags.length > 0 && (
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Теги:</span>
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Информация об авторе */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-sm text-gray-400">
          Автор: <span className="text-white">{article.author.username}</span>
          {' • '}
          Обновлено: {new Date(article.updatedAt).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </ArticleLayout>
  );
}

// Метаданные для SEO
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.category, resolvedParams.slug);
  
  if (!article) {
    return {
      title: 'Статья не найдена - District 9 Wiki',
    };
  }

  return {
    title: `${article.title} - District 9 Wiki`,
    description: article.description || article.content.substring(0, 160).replace(/<[^>]*>/g, ''),
  };
}
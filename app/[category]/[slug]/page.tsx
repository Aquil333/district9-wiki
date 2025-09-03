import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ArticleLayout from '@/components/ArticleLayout';
import ReactMarkdown from 'react-markdown';

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

  // Формируем оглавление из markdown заголовков
  const headings = article.content.match(/^#{1,3} .+$/gm) || [];
  const toc = headings.map((heading, index) => {
    const level = heading.match(/^#+/)?.[0].length || 1;
    const title = heading.replace(/^#+\s/, '');
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
      <div className="prose prose-invert prose-purple max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children, ...props }) => (
              <h1 className="text-3xl font-montserrat font-bold text-white mb-6 mt-8" {...props}>
                {children}
              </h1>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="text-2xl font-montserrat font-bold text-white mb-4 mt-6" {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-xl font-montserrat font-semibold text-white mb-3 mt-4" {...props}>
                {children}
              </h3>
            ),
            p: ({ children, ...props }) => (
              <p className="text-gray-300 mb-4 leading-relaxed" {...props}>
                {children}
              </p>
            ),
            ul: ({ children, ...props }) => (
              <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2" {...props}>
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li className="text-gray-300" {...props}>
                {children}
              </li>
            ),
            a: ({ children, href, ...props }) => (
              <a 
                href={href} 
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                {...props}
              >
                {children}
              </a>
            ),
            code: ({ children, ...props }) => (
              <code className="bg-black/50 px-2 py-1 rounded text-purple-400 text-sm" {...props}>
                {children}
              </code>
            ),
            pre: ({ children, ...props }) => (
              <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto mb-6" {...props}>
                {children}
              </pre>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-4" {...props}>
                {children}
              </blockquote>
            ),
            hr: () => <hr className="border-white/10 my-8" />,
            strong: ({ children, ...props }) => (
              <strong className="text-white font-semibold" {...props}>
                {children}
              </strong>
            ),
            em: ({ children, ...props }) => (
              <em className="text-gray-300" {...props}>
                {children}
              </em>
            ),
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>

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
    description: article.description || article.content.substring(0, 160),
  };
}
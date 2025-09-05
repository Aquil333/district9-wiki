import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ArticleForm from "@/components/ArticleForm";
import RevisionHistory from "@/components/RevisionHistory";
import { notFound } from "next/navigation";
import { History } from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: true,
      author: true
    }
  });
  
  return article;
}

async function getRevisionsCount(articleId: string) {
  const count = await prisma.revision.count({
    where: { articleId }
  });
  return count;
}

export default async function EditArticlePage({ params }: PageProps) {
  const resolvedParams = await params;
  const session = await getServerSession();
  
  if (!session) {
    redirect("/admin/login");
  }

  const article = await getArticle(resolvedParams.slug);
  
  if (!article) {
    notFound();
  }

  const revisionsCount = await getRevisionsCount(article.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
      {/* Header */}
      <header className="glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/articles" className="text-purple-400 hover:text-purple-300">
                ← Все статьи
              </Link>
              <span className="text-gray-600">|</span>
              <h1 className="text-xl font-montserrat font-bold text-white">
                Редактирование: {article.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {revisionsCount} версий
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - 2/3 width */}
          <div className="lg:col-span-2">
            <ArticleForm article={article} isEdit={true} />
          </div>
          
          {/* Sidebar with Revision History - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="glass rounded-lg p-6 sticky top-8">
              <RevisionHistory 
                articleId={article.id}
                currentTitle={article.title}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
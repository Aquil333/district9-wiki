import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import ArticleForm from "@/components/ArticleForm";

export default async function NewArticlePage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/admin/login");
  }

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
                Новая статья
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ArticleForm />
      </div>
    </div>
  );
}
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CategoryManager from "@/components/CategoryManager";

async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      children: {
        include: {
          _count: {
            select: { articles: true }
          }
        },
        orderBy: { order: 'asc' }
      },
      parent: true,
      _count: {
        select: { articles: true }
      }
    },
    orderBy: [
      { order: 'asc' },
      { title: 'asc' }
    ]
  });

  return categories;
}

export default async function AdminCategoriesPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/admin/login");
  }

  const categories = await getCategories();

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
                Управление категориями
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryManager initialCategories={categories} />
      </div>
    </div>
  );
}
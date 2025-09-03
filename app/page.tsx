import Link from "next/link";
import { 
  BookOpen, 
  Shield, 
  Users, 
  Briefcase, 
  ArrowRight,
  Zap,
  Clock,
  Gamepad2,
  Heart,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

// Получаем данные с сервера
async function getData() {
  const [featuredArticles, popularArticles, categories, totalArticles] = await Promise.all([
    // Избранные статьи
    prisma.article.findMany({
      where: { 
        published: true,
        featured: true 
      },
      include: {
        category: true
      },
      take: 4,
      orderBy: { publishedAt: 'desc' }
    }),
    
    // Популярные статьи
    prisma.article.findMany({
      where: { published: true },
      include: {
        category: true
      },
      take: 5,
      orderBy: { views: 'desc' }
    }),
    
    // Главные категории
    prisma.category.findMany({
      where: { parentId: null },
      include: {
        _count: {
          select: { articles: true }
        }
      },
      orderBy: { order: 'asc' },
      take: 4
    }),
    
    // Общее количество статей
    prisma.article.count({ where: { published: true } })
  ]);

  // Последние обновления
  const recentUpdates = await prisma.article.findMany({
    where: { published: true },
    select: {
      title: true,
      slug: true,
      category: {
        select: { slug: true }
      },
      updatedAt: true,
      createdAt: true
    },
    take: 4,
    orderBy: { updatedAt: 'desc' }
  });

  return {
    featuredArticles,
    popularArticles,
    categories,
    recentUpdates,
    totalArticles
  };
}

// Иконки для категорий
const categoryIcons: Record<string, any> = {
  'start': Gamepad2,
  'rp': BookOpen,
  'factions': Users,
  'jobs': Briefcase,
  'family': Heart,
  'economy': Package,
};

// Цвета градиентов для категорий
const categoryColors: Record<string, string> = {
  'start': 'from-blue-500 to-cyan-500',
  'rp': 'from-purple-500 to-pink-500',
  'factions': 'from-green-500 to-emerald-500',
  'jobs': 'from-orange-500 to-red-500',
  'family': 'from-pink-500 to-rose-500',
  'economy': 'from-yellow-500 to-amber-500',
};

export default async function HomePage() {
  const { featuredArticles, popularArticles, categories, recentUpdates, totalArticles } = await getData();

  // Форматируем время
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} назад`;
    if (hours > 0) return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`;
    return 'Только что';
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl glass p-8 lg:p-12">
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-montserrat font-bold text-white mb-4">
            Добро пожаловать на{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-600">
              District 9 Wiki
            </span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl">
            Официальная база знаний игрового проекта. Здесь вы найдете всю необходимую 
            информацию о игровых механиках, правилах и возможностях сервера.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">127 игроков онлайн</span>
            </div>
            {totalArticles > 0 && (
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-400">{totalArticles} статей</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
      </section>

      {/* Quick Links - Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-2xl font-montserrat font-bold text-white mb-6">
            Быстрый доступ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = categoryIcons[category.slug] || BookOpen;
              const color = categoryColors[category.slug] || 'from-purple-500 to-pink-500';
              
              return (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  className="group relative overflow-hidden rounded-xl glass p-6 
                    hover:scale-[1.02] transition-all duration-300"
                >
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                    `bg-gradient-to-br ${color}`
                  )} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "p-2 rounded-lg bg-gradient-to-br",
                        color
                      )}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <h3 className="font-montserrat font-semibold text-white mb-1">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {category._count.articles} статей
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-purple-400 group-hover:gap-2 transition-all">
                      <span className="text-sm">Подробнее</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Articles */}
        {popularArticles.length > 0 && (
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-montserrat font-bold text-white">
                Популярные статьи
              </h2>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            
            <div className="space-y-3">
              {popularArticles.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/${article.category.slug}/${article.slug}`}
                  className="block glass rounded-lg p-4 hover:bg-white/5 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-purple-400 font-medium">
                          {article.category.title}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {article.views.toLocaleString()} просмотров
                        </span>
                      </div>
                      <h3 className="text-white group-hover:text-purple-400 transition-colors">
                        {article.title}
                      </h3>
                    </div>
                    <span className="text-2xl font-montserrat font-bold text-gray-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Updates */}
        {recentUpdates.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-montserrat font-bold text-white">
                Обновления
              </h2>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            
            <div className="space-y-3">
              {recentUpdates.map((update) => {
                const isNew = update.createdAt.getTime() === update.updatedAt.getTime();
                
                return (
                  <Link
                    key={`${update.category.slug}-${update.slug}`}
                    href={`/${update.category.slug}/${update.slug}`}
                    className="block glass rounded-lg p-4 hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        isNew ? "bg-green-500" : "bg-blue-500"
                      )} />
                      <div className="flex-1">
                        <h4 className="text-white text-sm font-medium mb-1 hover:text-purple-400 transition-colors">
                          {update.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(update.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <Link
              href="/updates"
              className="mt-4 w-full flex items-center justify-center gap-2 
                py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 
                text-purple-400 transition-all duration-200"
            >
              <span className="text-sm">Все обновления</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section>
          <h2 className="text-2xl font-montserrat font-bold text-white mb-6">
            Рекомендуем прочитать
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/${article.category.slug}/${article.slug}`}
                className="glass rounded-lg p-6 hover:bg-white/5 transition-all duration-200 group"
              >
                <h3 className="font-montserrat font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-400">
                    {article.category.title}
                  </span>
                  <span className="text-purple-400 text-sm group-hover:translate-x-1 inline-block transition-transform">
                    Читать →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
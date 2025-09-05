import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/articles - получить статьи
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    const where: any = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (published !== null) where.published = published === 'true';
    if (featured === 'true') where.featured = true;

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        tags: true,
        _count: {
          select: { revisions: true }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST - создать статью

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, description, content, categoryId, published, featured } = body;

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Создаем статью и первую версию в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Создаем статью
      const article = await tx.article.create({
        data: {
          title,
          slug,
          description,
          content,
          categoryId,
          published: published || false,
          featured: featured || false,
          authorId: user.id
        }
      });

      // Создаем первую версию
      const revision = await tx.revision.create({
        data: {
          title,
          description,
          content,
          version: 1,
          comment: "Первоначальная версия",
          changeType: "CREATE",
          articleId: article.id,
          authorId: user.id
        }
      });

      return { article, revision };
    });

    return NextResponse.json(result.article);
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
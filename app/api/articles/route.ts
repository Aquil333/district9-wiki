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

// POST /api/articles - создать статью
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      slug, 
      description, 
      content, 
      categoryId, 
      published,
      featured,
      tags,
      readTime
    } = body;

    // Получаем первого админа из БД (временное решение)
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'No admin user found' },
        { status: 400 }
      );
    }

    const authorId = admin.id; 

    // Проверка на существование slug
    const existing = await prisma.article.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Article with this slug already exists' },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        description,
        content,
        categoryId,
        authorId,
        published,
        featured,
        readTime,
        publishedAt: published ? new Date() : null,
        tags: {
          connectOrCreate: tags?.map((tag: string) => ({
            where: { slug: tag },
            create: { 
              name: tag.charAt(0).toUpperCase() + tag.slice(1),
              slug: tag 
            }
          })) || []
        }
      },
      include: {
        category: true,
        author: true,
        tags: true
      }
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        articles: [], 
        categories: [] 
      });
    }

    // Для MySQL используем обычный contains без mode
    // MySQL по умолчанию делает поиск без учета регистра
    const articles = await prisma.article.findMany({
      where: {
        AND: [
          { published: true },
          {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
              { content: { contains: query } }
            ]
          }
        ]
      },
      include: {
        category: {
          select: {
            title: true,
            slug: true
          }
        }
      },
      take: 10,
      orderBy: [
        { featured: 'desc' },
        { views: 'desc' }
      ]
    });

    // Поиск по категориям
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } }
        ]
      },
      include: {
        _count: {
          select: { articles: true }
        }
      },
      take: 5
    });

    return NextResponse.json({
      articles,
      categories,
      query
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
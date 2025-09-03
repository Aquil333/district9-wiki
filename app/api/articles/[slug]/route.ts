import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/articles/[slug] - получить статью по slug  
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const article = await prisma.article.findUnique({
      where: { slug: resolvedParams.slug },
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
        revisions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            author: {
              select: {
                username: true
              }
            }
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Увеличиваем счетчик просмотров
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } }
    });

    return NextResponse.json({
      ...article,
      views: article.views + 1
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PATCH /api/articles/[slug] - обновить статью
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { 
      title, 
      description, 
      content, 
      categoryId, 
      published,
      featured,
      tags
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

    const article = await prisma.article.update({
      where: { slug: resolvedParams.slug },
      data: {
        title,
        description,
        content,
        categoryId,
        published,
        featured,
        publishedAt: published ? new Date() : null,
        tags: tags ? {
          set: [], // Сначала отключаем все теги
          connectOrCreate: tags.map((tag: string) => ({
            where: { slug: tag },
            create: { 
              name: tag.charAt(0).toUpperCase() + tag.slice(1),
              slug: tag 
            }
          }))
        } : undefined
      },
      include: {
        category: true,
        author: true,
        tags: true
      }
    });

    // Создаем ревизию для истории изменений
    await prisma.revision.create({
      data: {
        content,
        articleId: article.id,
        authorId: admin.id,
        comment: "Updated article"
      }
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[slug] - удалить статью
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    await prisma.article.delete({
      where: { slug: resolvedParams.slug }
    });

    return NextResponse.json(
      { message: 'Article deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
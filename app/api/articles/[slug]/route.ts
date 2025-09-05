import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";

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
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { 
      title, 
      slug,
      description, 
      content, 
      categoryId, 
      published,
      featured,
      tags
    } = body;

    // Находим пользователя по email из сессии
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Получаем текущую версию статьи
    const currentArticle = await prisma.article.findUnique({
      where: { slug: resolvedParams.slug }
    });

    if (!currentArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Проверяем, есть ли реальные изменения в контенте
    const hasContentChanges = 
      currentArticle.title !== title ||
      currentArticle.description !== description ||
      currentArticle.content !== content;

    // Обновляем статью и создаем версию если есть изменения
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем статью
      const updatedArticle = await tx.article.update({
        where: { slug: resolvedParams.slug },
        data: {
          title,
          slug: slug || currentArticle.slug,
          description,
          content,
          categoryId,
          published,
          featured,
          publishedAt: published ? (currentArticle.publishedAt || new Date()) : null,
          updatedAt: new Date(),
          tags: tags ? {
            set: [], // Сначала отключаем все теги
            connectOrCreate: tags.map((tag: string) => ({
              where: { slug: tag.toLowerCase().replace(/\s+/g, '-') },
              create: { 
                name: tag.charAt(0).toUpperCase() + tag.slice(1),
                slug: tag.toLowerCase().replace(/\s+/g, '-')
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

      // Если есть изменения в контенте, создаем новую версию
      if (hasContentChanges) {
        // Получаем последнюю версию для определения номера
        const lastRevision = await tx.revision.findFirst({
          where: { articleId: currentArticle.id },
          orderBy: { version: 'desc' }
        });

        const nextVersion = (lastRevision?.version || 0) + 1;

        // Создаем новую версию
        await tx.revision.create({
          data: {
            title,
            description,
            content,
            version: nextVersion,
            comment: `Обновление версии ${nextVersion}`,
            changeType: "UPDATE",
            articleId: currentArticle.id,
            authorId: user.id
          }
        });
      }

      return updatedArticle;
    });

    return NextResponse.json(result);
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
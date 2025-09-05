import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    articleId: string;
    revisionId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { articleId, revisionId } = resolvedParams;

    // Получаем версию для восстановления
    const revision = await prisma.revision.findUnique({
      where: { id: revisionId }
    });

    if (!revision || revision.articleId !== articleId) {
      return NextResponse.json({ error: "Revision not found" }, { status: 404 });
    }

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Получаем текущую версию статьи для сохранения в истории
    const currentArticle = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!currentArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Начинаем транзакцию
    const result = await prisma.$transaction(async (tx) => {
      // Сохраняем текущее состояние как версию перед восстановлением
      const lastRevision = await tx.revision.findFirst({
        where: { articleId },
        orderBy: { version: 'desc' }
      });

      await tx.revision.create({
        data: {
          title: currentArticle.title,
          description: currentArticle.description,
          content: currentArticle.content,
          version: (lastRevision?.version || 0) + 1,
          comment: `Автосохранение перед восстановлением версии ${revision.version}`,
          changeType: "UPDATE",
          articleId,
          authorId: user.id
        }
      });

      // Восстанавливаем статью из выбранной версии
      const updatedArticle = await tx.article.update({
        where: { id: articleId },
        data: {
          title: revision.title,
          description: revision.description,
          content: revision.content,
          updatedAt: new Date()
        }
      });

      // Создаем запись о восстановлении
      const restoredRevision = await tx.revision.create({
        data: {
          title: revision.title,
          description: revision.description,
          content: revision.content,
          version: (lastRevision?.version || 0) + 2,
          comment: `Восстановлено из версии ${revision.version}`,
          changeType: "RESTORE",
          articleId,
          authorId: user.id
        }
      });

      return { article: updatedArticle, revision: restoredRevision };
    });

    return NextResponse.json({
      success: true,
      article: result.article,
      revision: result.revision
    });
  } catch (error) {
    console.error("Error restoring revision:", error);
    return NextResponse.json(
      { error: "Failed to restore revision" },
      { status: 500 }
    );
  }
}
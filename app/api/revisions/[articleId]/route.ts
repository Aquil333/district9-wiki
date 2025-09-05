import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    articleId: string;
  }>;
}

// GET - получить все версии статьи
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { articleId } = resolvedParams;

    const revisions = await prisma.revision.findMany({
      where: { articleId },
      include: {
        author: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: { version: 'desc' }
    });

    return NextResponse.json(revisions);
  } catch (error) {
    console.error("Error fetching revisions:", error);
    return NextResponse.json(
      { error: "Failed to fetch revisions" },
      { status: 500 }
    );
  }
}

// POST - создать новую версию
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
    const { articleId } = resolvedParams;
    const { comment, changeType = "UPDATE" } = await request.json();

    // Получаем текущую статью
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: true
      }
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Получаем последнюю версию для определения номера
    const lastRevision = await prisma.revision.findFirst({
      where: { articleId },
      orderBy: { version: 'desc' }
    });

    const nextVersion = (lastRevision?.version || 0) + 1;

    // Находим пользователя по email из сессии
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Создаем новую версию
    const revision = await prisma.revision.create({
      data: {
        title: article.title,
        description: article.description,
        content: article.content,
        version: nextVersion,
        comment,
        changeType,
        articleId,
        authorId: user.id
      },
      include: {
        author: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(revision);
  } catch (error) {
    console.error("Error creating revision:", error);
    return NextResponse.json(
      { error: "Failed to create revision" },
      { status: 500 }
    );
  }
}
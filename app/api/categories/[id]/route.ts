import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/categories/[id] - обновить категорию
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { title, slug, description, icon, parentId, order } = body;  // Добавили icon

    // Проверка на существование категории
    const existing = await prisma.category.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Проверка на уникальность slug (если он изменился)
    if (slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug }
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        slug,
        description,
        icon: icon || null,  // Добавили icon
        parentId: parentId || null,
        order: order || 0
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - удалить категорию
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    
    // Проверка на наличие статей в категории
    const articlesCount = await prisma.article.count({
      where: { categoryId: resolvedParams.id }
    });

    if (articlesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with articles' },
        { status: 400 }
      );
    }

    // Проверка на наличие подкатегорий
    const childrenCount = await prisma.category.count({
      where: { parentId: resolvedParams.id }
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
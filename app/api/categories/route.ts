import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories - получить все категории
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        _count: {
          select: { articles: true }
        }
      },
      orderBy: [
        { order: 'asc' },
        { title: 'asc' }
      ]
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - создать категорию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, description, icon, parentId, order } = body;

    // Проверка на существование slug
    const existing = await prisma.category.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Если parentId передан и не пустой, проверяем его существование
    if (parentId && parentId !== "") {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parentExists) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    // Получаем максимальный order для новой категории
    let newOrder = order || 0;
    if (!order) {
      const maxOrderCategory = await prisma.category.findFirst({
        where: {
          parentId: (parentId && parentId !== "") ? parentId : null
        },
        orderBy: {
          order: 'desc'
        }
      });
      
      newOrder = (maxOrderCategory?.order || 0) + 1;
    }

    const category = await prisma.category.create({
      data: {
        title,
        slug,
        description: description || null,
        icon: icon || null,
        parentId: (parentId && parentId !== "") ? parentId : null,
        order: newOrder
      },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
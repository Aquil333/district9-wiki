import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Создаем тестовые данные...');

  // Создаем тестового админа
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@district9.ru' },
    update: {},
    create: {
      email: 'admin@district9.ru',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('✅ Создан админ:', admin.email);

  // Создаем категории
  const categories = [
    {
      title: 'Начало игры',
      slug: 'start',
      icon: 'Gamepad2',
      order: 1,
      subcategories: [
        { title: 'Как начать играть', slug: 'how-to-start' },
        { title: 'Ошибки RAGE MP', slug: 'rage-errors' },
        { title: 'Создание персонажа', slug: 'character' }
      ]
    },
    {
      title: 'Основы RP',
      slug: 'rp',
      icon: 'BookOpen',
      order: 2,
      subcategories: [
        { title: 'Что такое RP', slug: 'rp-basics' },
        { title: 'Правила RP', slug: 'rp-rules' },
        { title: 'Термины', slug: 'rp-terms' }
      ]
    },
    {
      title: 'Фракции',
      slug: 'factions',
      icon: 'Users',
      order: 3,
      subcategories: [
        { title: 'Государственные', slug: 'gov-factions' },
        { title: 'Криминальные', slug: 'crime-factions' }
      ]
    },
    {
      title: 'Работы',
      slug: 'jobs',
      icon: 'Briefcase',
      order: 4,
      subcategories: [
        { title: 'Начальные работы', slug: 'starter-jobs' },
        { title: 'Продвинутые', slug: 'advanced-jobs' }
      ]
    }
  ];

  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        title: cat.title,
        slug: cat.slug,
        icon: cat.icon,
        order: cat.order
      }
    });

    console.log('✅ Создана категория:', parent.title);

    // Создаем подкатегории
    if (cat.subcategories) {
      for (const subcat of cat.subcategories) {
        await prisma.category.upsert({
          where: { slug: subcat.slug },
          update: {},
          create: {
            title: subcat.title,
            slug: subcat.slug,
            parentId: parent.id
          }
        });
      }
    }
  }

  // Создаем пример статьи
  const startCategory = await prisma.category.findUnique({
    where: { slug: 'how-to-start' }
  });

  if (startCategory) {
    const article = await prisma.article.upsert({
      where: { slug: 'welcome-to-district9' },
      update: {},
      create: {
        title: 'Добро пожаловать на District 9 RP',
        slug: 'welcome-to-district9',
        description: 'Полное руководство для новичков',
        content: `# Добро пожаловать на District 9 RP!

## Что такое District 9 RP?
District 9 RP - это RP сервер для GTA 5 на платформе RAGE MP, где вы можете создать своего уникального персонажа и прожить его жизнь.

## С чего начать?
1. Установите GTA 5 (лицензионная версия)
2. Скачайте RAGE MP с официального сайта
3. Найдите наш сервер в списке
4. Создайте персонажа и начните игру!

## Первые шаги
После создания персонажа вы появитесь в аэропорту. Рекомендуем:
- Получить стартовый бонус
- Купить телефон
- Устроиться на первую работу
- Познакомиться с другими игроками

Удачной игры!`,
        published: true,
        featured: true,
        readTime: 5,
        categoryId: startCategory.id,
        authorId: admin.id
      }
    });

    console.log('✅ Создана тестовая статья:', article.title);
  }

  console.log('🎉 Все тестовые данные созданы!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
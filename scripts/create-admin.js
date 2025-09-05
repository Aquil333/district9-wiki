const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('1234', 10);
  
  try {
    const admin = await prisma.user.create({
      data: {
        email: 'logan@logan.com',
        username: 'Logan',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('Админ создан успешно!');
    console.log('Email:', admin.email);
    console.log('Password: 1234');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Пользователь уже существует');
      const updated = await prisma.user.update({
        where: { email: 'logan@logan.com' },
        data: { password: hashedPassword }
      });
      
      console.log('Пароль обновлен для:', updated.email);
    } else {
      console.error('Ошибка:', error);
    }
  }
}

createAdmin()
  .then(() => prisma.$disconnect())
  .catch(console.error);
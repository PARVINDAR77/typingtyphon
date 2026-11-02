const { PrismaClient } = require('@prisma/client');

async function test() {
  const urls = [
    'postgresql://postgres:postgres@localhost:5432/postgres?schema=public',
    'postgresql://postgres:root@localhost:5432/postgres?schema=public',
    'postgresql://postgres:admin@localhost:5432/postgres?schema=public',
    'postgresql://postgres:123456@localhost:5432/postgres?schema=public',
    'postgresql://postgres:postgres@localhost:5432/typingtyphon_dev?schema=public',
    'postgresql://typhon_user:typhon_password_local_dev@localhost:5432/typingtyphon_dev?schema=public',
    'postgresql://typhon_user:typhon_password_local_dev@localhost:5433/typingtyphon_dev?schema=public'
  ];
  for (const url of urls) {
    try {
      const prisma = new PrismaClient({ datasources: { db: { url } } });
      await prisma.$connect();
      console.log('SUCCESS CONNECTED:', url);
      await prisma.$disconnect();
      return;
    } catch (e) {
      console.log('FAILED:', url, e.message.split('\n')[0]);
    }
  }
}
test();

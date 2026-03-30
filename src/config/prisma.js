import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

const syncUsersRoleEnum = async () => {
  const roleColumns = await prisma.$queryRawUnsafe(`
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'role'
    LIMIT 1
  `);

  const roleColumn = Array.isArray(roleColumns) ? roleColumns[0] : null;
  const columnType = roleColumn?.COLUMN_TYPE || '';

  if (!columnType || columnType.includes("'professional'")) {
    return;
  }

  await prisma.$executeRawUnsafe(`
    UPDATE users
    SET role = 'user'
    WHERE role IS NULL
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE users
    MODIFY COLUMN role ENUM('user', 'admin', 'professional') NOT NULL DEFAULT 'user'
  `);

  console.log('Prisma schema sync: added professional to users.role enum');
};

let initializationPromise;

export const initializePrisma = async () => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await prisma.$connect();
      console.log('Prisma connected to MySQL database');
      await syncUsersRoleEnum();
    })().catch((error) => {
      initializationPromise = undefined;
      throw error;
    });
  }

  return initializationPromise;
};

export default prisma;

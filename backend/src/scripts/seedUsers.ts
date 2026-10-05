import dotenv from 'dotenv';
import prisma from '../config/prisma';
import { hashPassword } from '../utils/password';

dotenv.config();

type InitialUser = {
  userCode: string;
  fullName: string;
  role: 'admin' | 'surveyor';
  password: string;
};

async function seedUsers() {
  const source = process.env.INITIAL_USERS_JSON;
  if (!source) throw new Error('INITIAL_USERS_JSON must contain initial user accounts');

  const users = JSON.parse(source) as InitialUser[];
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error('INITIAL_USERS_JSON must be a non-empty JSON array');
  }
  if (!users.some((user) => user.role === 'admin')) {
    throw new Error('At least one initial admin account is required');
  }

  const userCodes = new Set<string>();
  for (const user of users) {
    if (!user.userCode?.trim() || !user.fullName?.trim() || !['admin', 'surveyor'].includes(user.role)) {
      throw new Error('Each initial account must have a userCode, fullName, and valid role');
    }
    if (typeof user.password !== 'string' || user.password.length < 12 || user.password.length > 128) {
      throw new Error(`Account ${user.userCode} must have a password between 12 and 128 characters`);
    }
    if (userCodes.has(user.userCode)) throw new Error(`Duplicate initial userCode: ${user.userCode}`);
    userCodes.add(user.userCode);

    const passwordHash = await hashPassword(user.password);
    await prisma.user.upsert({
      where: { userCode: user.userCode },
      update: {
        fullName: user.fullName,
        role: user.role,
        passwordHash
      },
      create: {
        userCode: user.userCode,
        fullName: user.fullName,
        role: user.role,
        passwordHash
      }
    });
    console.log(`Provisioned ${user.role} account ${user.userCode}`);
  }
}

seedUsers()
  .catch((error) => {
    console.error('User provisioning failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
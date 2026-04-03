import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { ApiError } from '../utils/ApiError';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
import { SignOptions } from 'jsonwebtoken';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

// const generateToken = (payload: { id: string; role: Role; email: string }): string => {
//   return jwt.sign(payload, process.env.JWT_SECRET as string, {
//     expiresIn: process.env.JWT_EXPIRES_IN || '7d',
//   });
// };

// const generateToken = (
//   payload: { id: string; role: Role; email: string }
// ): string => {
//   return jwt.sign(payload, JWT_SECRET, {
//     expiresIn: JWT_EXPIRES_IN,
//   });
// };

const generateToken = (
  payload: { id: string; role: Role; email: string }
): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const register = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('A user with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role || 'VIEWER',
    },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  const token = generateToken({ id: user.id, role: user.role, email: user.email });

  return { user, token };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Your account has been deactivated. Contact admin.');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken({ id: user.id, role: user.role, email: user.email });

  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  if (!user) throw ApiError.notFound('User not found');
  return user;
};

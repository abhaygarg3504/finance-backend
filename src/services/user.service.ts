import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/client';
import { ApiError } from '../utils/ApiError';
import { parsePaginationQuery, buildPagination } from '../utils/pagination';
import { Role } from '@prisma/client';

export const getAllUsers = async (query: Record<string, string>) => {
  const { page, limit, skip } = parsePaginationQuery(query.page, query.limit);

  const where: Record<string, unknown> = {};
  if (query.role) where.role = query.role as Role;
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, meta: buildPagination(total, page, limit) };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const updateUser = async (
  id: string,
  data: { name?: string; role?: Role; isActive?: boolean }
) => {
  await getUserById(id); 
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true, updatedAt: true },
  });
};

export const changePassword = async (
  id: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

  const hashedNew = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id },
    data: { password: hashedNew },
  });

  return { message: 'Password changed successfully' };
};

export const deleteUser = async (id: string) => {
  await getUserById(id);
  await prisma.user.delete({ where: { id } });
};

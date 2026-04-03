import { prisma } from '../prisma/client';
import { ApiError } from '../utils/ApiError';
import { parsePaginationQuery, buildPagination } from '../utils/pagination';
import { RecordFilterQuery } from '../types';
import { RecordType } from '@prisma/client';

interface CreateRecordInput {
  amount: number;
  type: RecordType;
  category: string;
  date: Date;
  note?: string;
}

export const createRecord = async (data: CreateRecordInput, userId: string) => {
  return prisma.record.create({
    data: { ...data, userId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
};

export const getRecords = async (query: RecordFilterQuery, requestingUserId?: string, isAdmin = false) => {
  const { page, limit, skip } = parsePaginationQuery(query.page, query.limit);

  const where: Record<string, unknown> = { isDeleted: false };

  if (!isAdmin && requestingUserId) {
    where.userId = requestingUserId;
  }

  if (query.type) where.type = query.type as RecordType;
  if (query.category) where.category = { contains: query.category, mode: 'insensitive' };

  if (query.startDate || query.endDate) {
    where.date = {
      ...(query.startDate && { gte: new Date(query.startDate) }),
      ...(query.endDate && { lte: new Date(query.endDate) }),
    };
  }

  if (query.search) {
    where.OR = [
      { note: { contains: query.search, mode: 'insensitive' } },
      { category: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const validSortFields = ['date', 'amount', 'createdAt', 'category'];
  const sortBy = validSortFields.includes(query.sortBy || '') ? query.sortBy! : 'date';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.record.count({ where }),
  ]);

  return { records, meta: buildPagination(total, page, limit) };
};

export const getRecordById = async (id: string, requestingUserId: string, isAdmin: boolean) => {
  const record = await prisma.record.findFirst({
    where: { id, isDeleted: false },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!record) throw ApiError.notFound('Record not found');

  if (!isAdmin && record.userId !== requestingUserId) {
    throw ApiError.forbidden();
  }

  return record;
};

export const updateRecord = async (
  id: string,
  data: Partial<CreateRecordInput>,
  requestingUserId: string,
  isAdmin: boolean
) => {
  const record = await prisma.record.findFirst({ where: { id, isDeleted: false } });
  if (!record) throw ApiError.notFound('Record not found');

  if (!isAdmin && record.userId !== requestingUserId) {
    throw ApiError.forbidden();
  }

  return prisma.record.update({
    where: { id },
    data,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
};

export const softDeleteRecord = async (
  id: string,
  requestingUserId: string,
  isAdmin: boolean
) => {
  const record = await prisma.record.findFirst({ where: { id, isDeleted: false } });
  if (!record) throw ApiError.notFound('Record not found');

  if (!isAdmin && record.userId !== requestingUserId) {
    throw ApiError.forbidden();
  }

  return prisma.record.update({ where: { id }, data: { isDeleted: true } });
};

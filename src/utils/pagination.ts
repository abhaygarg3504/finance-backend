import { PaginationMeta } from '../types';

export const buildPagination = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const lastPage = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    lastPage,
    hasNextPage: page < lastPage,
    hasPrevPage: page > 1,
  };
};

export const parsePaginationQuery = (
  pageStr?: string,
  limitStr?: string
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(pageStr || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(limitStr || '10', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

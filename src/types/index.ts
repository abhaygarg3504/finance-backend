import { Request } from "express";
import { Role } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface RecordFilterQuery {
  page?: string;
  limit?: string;
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

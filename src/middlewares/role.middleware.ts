import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';

export const allowRoles = (...roles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `This action requires one of the following roles: ${roles.join(', ')}`
        )
      );
    }

    next();
  };
};

export const allowOwnerOrAdmin = (getResourceUserId: (req: AuthRequest) => string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const resourceUserId = getResourceUserId(req);

    if (req.user.id !== resourceUserId && req.user.role !== 'ADMIN') {
      return next(ApiError.forbidden('You can only modify your own resources'));
    }

    next();
  };
};

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../prisma/client';

interface JwtPayload {
  id: string;
  role: string;
  email: string;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is missing or malformed');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, email: true, isActive: true },
    });

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Your account has been deactivated');
    }

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid or expired token'));
    } else {
      next(error);
    }
  }
};

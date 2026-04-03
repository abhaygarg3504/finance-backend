import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../types';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  ApiResponse.created(res, result, 'Registration successful');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  ApiResponse.success(res, result, 'Login successful');
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getProfile(req.user!.id);
  ApiResponse.success(res, user, 'Profile fetched');
});

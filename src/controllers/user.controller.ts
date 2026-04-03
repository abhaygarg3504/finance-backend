import { Response } from 'express';
import * as userService from '../services/user.service';
import { AuthRequest } from '../types';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await userService.getAllUsers(req.query as Record<string, string>);
  ApiResponse.paginated(res, result.users, result.meta, 'Users fetched');
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  ApiResponse.success(res, user, 'User fetched');
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);
  ApiResponse.success(res, user, 'User updated');
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await userService.changePassword(
    req.user!.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  ApiResponse.success(res, result);
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  await userService.deleteUser(req.params.id);
  ApiResponse.noContent(res);
});

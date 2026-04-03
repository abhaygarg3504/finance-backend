import { Response } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { AuthRequest } from '../types';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.role === 'VIEWER' ? req.user!.id : undefined;
  const summary = await dashboardService.getSummary(userId);
  ApiResponse.success(res, summary, 'Dashboard summary fetched');
});

export const getCategoryBreakdown = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.role === 'VIEWER' ? req.user!.id : undefined;
  const data = await dashboardService.getCategoryBreakdown(userId);
  ApiResponse.success(res, data, 'Category breakdown fetched');
});

export const getMonthlyTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.role === 'VIEWER' ? req.user!.id : undefined;
  const months = parseInt(req.query.months as string || '6', 10);
  const data = await dashboardService.getMonthlyTrends(userId, months);
  ApiResponse.success(res, data, 'Monthly trends fetched');
});

export const getWeeklyTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.role === 'VIEWER' ? req.user!.id : undefined;
  const data = await dashboardService.getWeeklyTrends(userId);
  ApiResponse.success(res, data, 'Weekly trends fetched');
});

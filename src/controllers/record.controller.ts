import { Response } from 'express';
import * as recordService from '../services/record.service';
import { AuthRequest, RecordFilterQuery } from '../types';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await recordService.createRecord(req.body, req.user!.id);
  ApiResponse.created(res, record, 'Record created');
});

export const getRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'ADMIN';
  const result = await recordService.getRecords(
    req.query as RecordFilterQuery,
    req.user!.id,
    isAdmin
  );
  ApiResponse.paginated(res, result.records, result.meta, 'Records fetched');
});

export const getRecordById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'ADMIN';
  const record = await recordService.getRecordById(req.params.id, req.user!.id, isAdmin);
  ApiResponse.success(res, record, 'Record fetched');
});

export const updateRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'ADMIN';
  const record = await recordService.updateRecord(
    req.params.id,
    req.body,
    req.user!.id,
    isAdmin
  );
  ApiResponse.success(res, record, 'Record updated');
});

export const deleteRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user!.role === 'ADMIN';
  await recordService.softDeleteRecord(req.params.id, req.user!.id, isAdmin);
  ApiResponse.noContent(res);
});

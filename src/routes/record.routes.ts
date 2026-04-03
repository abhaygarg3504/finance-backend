import { Router } from 'express';
import * as recordController from '../controllers/record.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createRecordSchema, updateRecordSchema } from '../validators/record.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  allowRoles('ADMIN'),
  validate(createRecordSchema),
  recordController.createRecord
);

router.get(
  '/',
  allowRoles('ADMIN', 'ANALYST', 'VIEWER'),
  recordController.getRecords
);

router.get(
  '/:id',
  allowRoles('ADMIN', 'ANALYST', 'VIEWER'),
  recordController.getRecordById
);

router.patch(
  '/:id',
  allowRoles('ADMIN'),
  validate(updateRecordSchema),
  recordController.updateRecord
);

router.delete(
  '/:id',
  allowRoles('ADMIN'),
  recordController.deleteRecord
);

export default router;

import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { updateUserSchema, changePasswordSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/', allowRoles('ADMIN'), userController.getAllUsers);

router.get('/:id', allowRoles('ADMIN'), userController.getUserById);

router.patch('/:id', allowRoles('ADMIN'), validate(updateUserSchema), userController.updateUser);

router.put('/password/change', validate(changePasswordSchema), userController.changePassword);

router.delete('/:id', allowRoles('ADMIN'), userController.deleteUser);

export default router;

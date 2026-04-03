import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { allowRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/summary', allowRoles('ADMIN', 'ANALYST', 'VIEWER'), dashboardController.getSummary);

router.get('/categories', allowRoles('ADMIN', 'ANALYST', 'VIEWER'), dashboardController.getCategoryBreakdown);

router.get('/trends/monthly', allowRoles('ADMIN', 'ANALYST', 'VIEWER'), dashboardController.getMonthlyTrends);

router.get('/trends/weekly', allowRoles('ADMIN', 'ANALYST', 'VIEWER'), dashboardController.getWeeklyTrends);

export default router;

import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import recordRoutes from './record.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/records', recordRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Finance API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;

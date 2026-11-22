import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { credentialsSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', authLimiter, validate({ body: credentialsSchema }), controller.register);
router.post('/login', authLimiter, validate({ body: credentialsSchema }), controller.login);
router.get('/me', requireAuth, controller.me);

export default router;

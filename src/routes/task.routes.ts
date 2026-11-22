import { Router } from 'express';
import * as controller from '../controllers/task.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamSchema,
  updateTaskSchema,
} from '../schemas/task.schema';

const router = Router();

router.use(requireAuth);

router.get('/', validate({ query: listTasksQuerySchema }), controller.list);
router.post('/', validate({ body: createTaskSchema }), controller.create);
router.get('/:id', validate({ params: taskIdParamSchema }), controller.getOne);
router.patch(
  '/:id',
  validate({ params: taskIdParamSchema, body: updateTaskSchema }),
  controller.update
);
router.delete('/:id', validate({ params: taskIdParamSchema }), controller.remove);

export default router;

import { Router } from "express";
import usersRouter from './users.mjs';
import chatlogsRouter from './chatlogs.mjs';
import answerRouter from './answer.mjs';

// роутер для всех роутеров
const router = Router();

router.use('/api/users', usersRouter);
router.use('/api/chatlogs', chatlogsRouter);
router.use('/api/answer', answerRouter);

export default router;
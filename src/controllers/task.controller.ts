import { Request, Response } from 'express';
import * as taskService from '../services/task.service';
import { asyncHandler } from '../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await taskService.listTasks(req.userId!, req.query as any));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.createTask(req.userId!, req.body);
  res.status(201).json({ data: task });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: await taskService.getTask(req.userId!, req.params.id) });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json({ data: await taskService.updateTask(req.userId!, req.params.id, req.body) });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await taskService.deleteTask(req.userId!, req.params.id);
  res.status(204).send();
});

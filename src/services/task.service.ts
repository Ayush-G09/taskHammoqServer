import { Task } from '../models/task.model';
import { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from '../schemas/task.schema';
import { AppError } from '../utils/AppError';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  createdAt: { createdAt: 1 },
  '-createdAt': { createdAt: -1 },
  dueDate: { dueDate: 1 },
  '-dueDate': { dueDate: -1 },
} as const;

// Every query below is scoped by `user`, so one user can never read or change another's tasks.

export async function listTasks(userId: string, query: ListTasksQuery) {
  const { status, priority, q, sort, page, limit } = query;

  const filter: Record<string, unknown> = { user: userId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (q) filter.title = { $regex: escapeRegex(q), $options: 'i' };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ ...SORTS[sort], _id: 1 }) // _id tiebreaker keeps pagination stable
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  return {
    data: tasks,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function createTask(userId: string, input: CreateTaskInput) {
  return Task.create({ ...input, user: userId });
}

export async function getTask(userId: string, id: string) {
  const task = await Task.findOne({ _id: id, user: userId });
  if (!task) throw AppError.notFound('Task not found');
  return task;
}

export async function updateTask(userId: string, id: string, input: UpdateTaskInput) {
  const task = await Task.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: input },
    { new: true, runValidators: true }
  );
  if (!task) throw AppError.notFound('Task not found');
  return task;
}

export async function deleteTask(userId: string, id: string) {
  const task = await Task.findOneAndDelete({ _id: id, user: userId });
  if (!task) throw AppError.notFound('Task not found');
}

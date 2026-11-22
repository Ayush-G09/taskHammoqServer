import { Schema, model } from 'mongoose';
import { TASK_PRIORITIES, TASK_STATUSES } from './constants';

const taskSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    status: { type: String, enum: TASK_STATUSES, default: 'todo' },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'medium' },
    dueDate: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.user = ret.user.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Supports the main list query: a user's tasks filtered by status, ordered by due date.
taskSchema.index({ user: 1, status: 1, dueDate: 1 });
// Supports the default list order: a user's newest tasks first.
taskSchema.index({ user: 1, createdAt: -1 });

export const Task = model('Task', taskSchema);

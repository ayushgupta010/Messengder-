import {z} from 'zod';

export const messageSchema = z.object({
      message: z.string().min(1, "Message cannot be empty").max(500, "Message must be at most 500 characters long"),
})

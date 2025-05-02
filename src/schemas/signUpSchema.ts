import {z} from 'zod';

export const usernameValidation = z
      .string()
      .min(2, "Username must be at least 2 characters long")
      .max(20, "Username must be at most 20 characters long")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")

export const signUpSchema = z.object({
      username: usernameValidation,
      password: z.string()
            .min(8, "Password must be at least 8 characters long")
            .max(20, "Password must be at most 20 characters long")
            .regex(/[a-zA-Z]/, "Password must contain at least one letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
      email: z.string()
            .email("Invalid email address"),  
})
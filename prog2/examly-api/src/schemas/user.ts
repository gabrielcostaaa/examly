// src/schemas/user.ts
import { z } from 'zod';

// Schema para criação de usuário, alinhado com a tabela app_user
export const createUserSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters long"),
  last_name: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(['student', 'teacher_coordinator', 'admin'])
});

// Schema para atualização de usuário (todos os campos são opcionais)
export const updateUserSchema = z.object({
  first_name: z.string().min(2).optional(),
  last_name: z.string().min(2).optional(),
  role: z.enum(['student', 'teacher_coordinator', 'admin']).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
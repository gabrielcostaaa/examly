// src/types/user.ts
export interface User {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string; // O hash da senha não deve ser exposto em todas as respostas
  role: 'student' | 'teacher_coordinator' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
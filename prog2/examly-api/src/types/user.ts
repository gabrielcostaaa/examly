export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: Date;
  updated_at: Date;
}
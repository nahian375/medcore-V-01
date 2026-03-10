// User model placeholder
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'patient' | 'doctor';
  createdAt: string;
}

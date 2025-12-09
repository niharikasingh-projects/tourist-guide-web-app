import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  username: string;
  email: string;
  password: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private users: User[] = [
    { username: 'admin', email: 'abc@gmail.com', password: '123', role: 'admin' }
  ];
  private currentUser: User | null = null;

  constructor(private router: Router) {
    try {
      const raw = localStorage.getItem('auth_user');
      if (raw) this.currentUser = JSON.parse(raw) as User;
    } catch {}
  }

  // Simulate async network calls (small delay) so components can show loading states
  async signIn(identifier: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    await this.delay(600);
    const user = this.users.find(u => u.username === identifier || u.email === identifier);
    if (!user) return { success: false, message: 'User not found' };
    if (user.password !== password) return { success: false, message: 'Invalid password' };
    this.currentUser = user;
    try { localStorage.setItem('auth_user', JSON.stringify(user)); } catch {}
    return { success: true, user };
  }

  async signUp(newUser: User): Promise<{ success: boolean; message?: string; user?: User }> {
    await this.delay(700);
    const exists = this.users.find(u => u.username === newUser.username || u.email === newUser.email);
    if (exists) return { success: false, message: 'User already exists' };
    this.users.push(newUser);
    return { success: true, user: newUser };
  }

  listUsers() {
    return this.users.slice();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  signOut(): void {
    this.currentUser = null;
    try { localStorage.removeItem('auth_user'); } catch {}
    try { this.router.navigate(['/signin']); } catch {}
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

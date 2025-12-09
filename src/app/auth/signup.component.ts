import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from './auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-signup',
  template: `
    <main class="auth-container">
      <h1 class="title-text">Create your tourist account</h1>

      <form (ngSubmit)="onSubmit()" class="auth-form">
        <input name="name" [(ngModel)]="name" placeholder="Name" required />
        <input name="email" [(ngModel)]="email" type="email" placeholder="Email" required />
        <input name="password" [(ngModel)]="password" type="password" placeholder="Password" required />
        <input name="confirm" [(ngModel)]="confirm" type="password" placeholder="Confirm password" required />

        <button type="submit" class="main-button" [disabled]="loading">
          <span *ngIf="!loading">Sign up</span>
          <span *ngIf="loading">Creating…</span>
        </button>

        <div class="separator"><span class="separator-text">Sign up with</span></div>
      </form>

      <div class="link-section">
        <p>Already have an account?</p>
        <a routerLink="/signin" class="main-link">Login</a>
      </div>

      <div aria-live="polite" *ngIf="message" role="status" style="margin-top:12px;">
        <span [style.color]="messageType === 'error' ? '#b00020' : '#064e3b'">{{ message }}</span>
      </div>
    </main>
  `,
  styleUrls: ['./auth.css']
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  confirm = '';
  message = '';
  messageType: 'error' | 'success' | '' = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.message = '';
    this.messageType = '';
    if (this.password !== this.confirm) {
      this.messageType = 'error';
      this.message = 'Passwords do not match';
      return;
    }

    const user: User = { username: this.name || this.email.split('@')[0], email: this.email, password: this.password };
    this.loading = true;
    try {
      const res = await this.auth.signUp(user);
      if (res.success) {
        this.messageType = 'success';
        this.message = 'Account created — you can sign in now';
        setTimeout(() => { try { this.router.navigate(['/signin']); } catch (e) {} }, 500);
      } else {
        this.messageType = 'error';
        this.message = res.message || 'Sign up failed';
      }
    } catch (err) {
      this.messageType = 'error';
      this.message = 'Unexpected error';
    } finally {
      this.loading = false;
    }
  }
}

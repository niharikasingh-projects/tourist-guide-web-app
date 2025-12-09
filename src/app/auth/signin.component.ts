import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-signin',
  template: `
    <main class="auth-container">
      <h1 class="title-text">Welcome</h1>

      <form (ngSubmit)="onSubmit()" class="auth-form" autocomplete="on">
        <input name="identifier" [(ngModel)]="identifier" placeholder="User name or email" required />
        <input name="password" [(ngModel)]="password" type="password" placeholder="Password" required />

        <a class="forgot-password" href="#">Forgot password?</a>

        <button type="submit" class="main-button" [disabled]="loading">
          <span *ngIf="!loading">Sign in</span>
          <span *ngIf="loading">Signing in…</span>
        </button>

        <div class="separator"><span class="separator-text">Or continue with</span></div>
      </form>

      <div class="link-section">
        <p>Not a member?</p>
        <a routerLink="/signup" class="main-link">Sign up</a>
      </div>

      <div
        *ngIf="message"
        #msgRef
        [attr.role]="messageType === 'error' ? 'alert' : 'status'"
        [attr.aria-live]="messageType === 'error' ? 'assertive' : 'polite'"
        class="auth-message"
        [class.error]="messageType === 'error'"
        [class.success]="messageType === 'success'"
        tabindex="-1"
      >
        {{ message }}
      </div>
    </main>
  `,
  styleUrls: ['./auth.css']
})
export class SigninComponent {
  identifier = '';
  password = '';
  message = '';
  messageType: 'error' | 'success' | '' = '';
  loading = false;
  @ViewChild('msgRef', { static: false }) msgRef?: ElementRef<HTMLDivElement>;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  async onSubmit() {
    this.message = '';
    this.messageType = '';
    this.loading = true;
    try {
      const res = await this.auth.signIn(this.identifier?.trim(), this.password);
      if (res.success) {
        this.messageType = 'success';
        this.message = 'Signed in successfully';
        // small delay so user sees success message before navigation
        setTimeout(() => {
          try { this.router.navigate(['/home']); } catch (e) {}
        }, 400);
      } else {
        this.messageType = 'error';
        this.message = res.message || 'Sign in failed';
        // ensure view updates then focus message for screen readers and keyboard users
        setTimeout(() => { try { this.msgRef?.nativeElement?.focus(); } catch (e) {} }, 0);
      }
    } catch (err) {
      this.messageType = 'error';
      this.message = 'Unexpected error';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}

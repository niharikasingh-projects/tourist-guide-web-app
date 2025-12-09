import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-signin',
  templateUrl: './signin.component.html',
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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from './auth.service';
import { SearchStateService } from '../services/search-state.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-signup',
  templateUrl: './signup.component.html',
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

  constructor(
    private auth: AuthService,
    private router: Router,
    private searchStateService: SearchStateService
  ) {}

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
        // Clear any existing search state
        this.searchStateService.clearSearchState();
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

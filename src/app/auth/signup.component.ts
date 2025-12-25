import { ChangeDetectorRef, Component } from '@angular/core';
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
  role = 'tourist';
  languages = '';
  profilePicture = '';
  profilePictureFile: File | undefined = undefined;
  location = '';
  phoneNumber = '';
  certifications = '';
  message = '';
  messageType: 'error' | 'success' | '' = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private searchStateService: SearchStateService,
    private cdr: ChangeDetectorRef
  ) {}

  onProfilePictureSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicture = e.target.result;
        this.profilePictureFile = file;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
      this.cdr.detectChanges();
    }
  }

  removeProfilePicture() {
    this.profilePicture = '';
    this.profilePictureFile = undefined;
    this.cdr.detectChanges();
  }

    isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10,10}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  async onSubmit() {
    this.message = '';
    this.messageType = '';
    if (this.password !== this.confirm) {
      this.messageType = 'error';
      this.message = 'Passwords do not match';
      return;
    }

    const user: User = { 
      name: this.name || this.email.split('@')[0], 
      email: this.email, 
      password: this.password,
      role: this.role,
      languages: this.role === 'guide' ? this.languages : undefined,
      profilePicture: this.role === 'guide' ? this.profilePicture : undefined,
      location: this.role === 'guide' ? this.location : undefined,
      phoneNumber: this.role === 'guide' ? this.phoneNumber : undefined,
      certifications: this.role === 'guide' ? this.certifications : undefined
    };
    this.loading = true;
    try {
      const res = await this.auth.signUp(user, this.profilePictureFile);
      if (res.success) {
        this.messageType = 'success';
        this.message = 'Account created — you can sign in now';
        // Clear any existing search state
        this.searchStateService.clearSearchState();
        // setTimeout(() => { try { this.router.navigate(['/signin']); } catch (e) {} }, 2000);
        this.cdr.detectChanges();
      } else {
        this.messageType = 'error';
        this.message = res.message || 'Sign up failed';
        this.cdr.detectChanges();
      }
    } catch (err) {
      this.messageType = 'error';
      this.message = 'Unexpected error';
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}

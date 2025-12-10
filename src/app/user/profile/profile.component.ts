import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile = {
    name: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    country: ''
  };

  isLoading = true;
  isSaving = false;
  error = '';
  successMessage = '';
  formSubmitted = false;

  countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
    'Germany', 'France', 'Italy', 'Spain', 'Japan', 'China', 'Brazil',
    'Mexico', 'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark',
    'Singapore', 'New Zealand', 'South Korea', 'UAE', 'Saudi Arabia',
    'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam',
    'Pakistan', 'Bangladesh', 'Egypt', 'South Africa', 'Argentina',
    'Chile', 'Colombia', 'Peru', 'Poland', 'Russia', 'Turkey', 'Other'
  ];

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/signin']);
      return;
    }

    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.profileService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.profile = { ...profile };
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load profile';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    this.error = '';
    this.successMessage = '';

    if (!this.isFormValid()) {
      return;
    }

    this.isSaving = true;
    this.profileService.updateUserProfile(this.profile).subscribe({
      next: (success) => {
        if (success) {
          this.successMessage = 'Profile updated successfully!';
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.error = 'Failed to update profile';
        }
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to update profile. Please try again.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  isFormValid(): boolean {
    const nameValid = this.profile.name.trim().length > 0;
    const emailValid = this.profile.email.trim().length > 0 && this.isValidEmail(this.profile.email);
    const phoneValid = !this.profile.phoneNumber || this.isValidPhone(this.profile.phoneNumber);
    
    return nameValid && emailValid && phoneValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    if (!phone || phone.trim() === '') return true; // Phone is optional
    const cleanedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(cleanedPhone);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}

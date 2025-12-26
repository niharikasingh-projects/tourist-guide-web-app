import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { environment } from '../../../environments/environment';

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
    country: '',
    location: '',
    languages: '',
    certifications: '',
    profileImageUrl: ''
  };

  isLoading = true;
  isSaving = false;
  error = '';
  successMessage = '';
  formSubmitted = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  userPictureFile: File | undefined = undefined;

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
          // Format dateOfBirth for the date input (yyyy-MM-dd format)
          if (this.profile.dateOfBirth) {
            this.profile.dateOfBirth = this.formatDateForInput(this.profile.dateOfBirth);
          }
          this.profile.profileImageUrl = this.getProfilePictureUrl(profile) || '';
          if (this.profile.profileImageUrl) {
            this.previewUrl = this.profile.profileImageUrl;
          }
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

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    // Extract just the date part (yyyy-MM-dd) from ISO string or other formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // If invalid, return as-is
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

    getProfilePictureUrl(profile: UserProfile): string | null {
      if (!profile?.profileImageUrl) {
        return null;
      }
      
      const profilePicture = profile.profileImageUrl;
      
      // If it's a relative URL (starts with /), prepend the backend API URL
      if (profilePicture.startsWith('/')) {
        return `${environment.apiUrl}/api${profilePicture}`;
      }
      
      // If it doesn't have a protocol (http:// or https://), treat as relative
      if (!profilePicture.match(/^https?:\/\//)) {
        return `${environment.apiUrl}/api${profilePicture}`;
      }
      
      // Otherwise return as is (full URL or base64)
      return profilePicture;
    }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.error = 'File size should not exceed 5MB';
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.error = 'Please select an image file';
        return;
      }

      this.selectedFile = file;
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
        this.profile.profileImageUrl = e.target.result; // Store base64 for now
        this.userPictureFile = file;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.formSubmitted = true;
    this.error = '';
    this.successMessage = '';

    if (!this.isFormValid()) {
      return;
    }

    this.isSaving = true;
    this.profileService.updateUserProfile(this.profile, this.userPictureFile).subscribe({
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

  isGuide(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === 'guide';
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}

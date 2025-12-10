import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ProfileService, UserProfile } from '../../services/profile.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuOpen = false;
  profileDropdownOpen = false;
  userProfile: UserProfile | null = null;

  constructor(
    public auth: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loadUserProfile();
  }

  @ViewChild('hamburger', { static: true }) hamburger!: ElementRef<HTMLButtonElement>;
  @ViewChild('firstLink', { static: false }) firstLink?: ElementRef<HTMLElement>;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.manageFocus();
  }

  onHover(event: Event) {
    // focus the hovered link for a stronger visual and keyboard indicator
    try {
      const target = event?.target as HTMLElement | null;
      if (target && typeof target.focus === 'function') target.focus();
    } catch {}
  }

  closeMenu() {
    this.menuOpen = false;
    this.manageFocus();
  }

  private manageFocus() {
    // When opening, move focus to first link; when closing, return focus to hamburger
    setTimeout(() => {
      if (this.menuOpen) {
        try { this.firstLink?.nativeElement?.focus(); } catch {}
      } else {
        try { this.hamburger?.nativeElement?.focus(); } catch {}
      }
    }, 0);
  }

  loadUserProfile() {
    if (this.auth.isAuthenticated()) {
      this.profileService.getUserProfile().subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading profile:', err);
        }
      });
    }
  }

  toggleProfileDropdown() {
    this.profileDropdownOpen = !this.profileDropdownOpen;
  }

  closeProfileDropdown() {
    this.profileDropdownOpen = false;
  }

  onProfileClick() {
    this.closeMenu();
    this.closeProfileDropdown();
    this.router.navigate(['/profile']);
  }

  onSignOut() {
    this.closeMenu();
    this.closeProfileDropdown();
    try { this.auth.signOut(); } catch {}
  }

  getUserInitials(): string {
    if (this.userProfile?.name) {
      const names = this.userProfile.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return this.userProfile.name.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-section')) {
      this.closeProfileDropdown();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: any) {
    if (this.menuOpen) {
      this.closeMenu();
      event.stopPropagation();
    }
    if (this.profileDropdownOpen) {
      this.closeProfileDropdown();
      event.stopPropagation();
    }
  }
}

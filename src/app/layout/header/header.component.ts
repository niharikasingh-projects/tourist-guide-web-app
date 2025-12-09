import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuOpen = false;
  constructor(public auth: AuthService) {}

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

  onSignOut() {
    this.closeMenu();
    try { this.auth.signOut(); } catch {}
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: any) {
    if (this.menuOpen) {
      this.closeMenu();
      event.stopPropagation();
    }
  }
}

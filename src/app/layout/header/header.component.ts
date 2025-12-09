import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  selector: 'app-header',
  template: `
    <header class="app-header">
      <div class="container">
        <div class="brand-wrap">
          <h1 class="brand">Tourist Guide</h1>
          <button
            #hamburger
            class="hamburger"
            type="button"
            aria-label="Toggle navigation menu"
            aria-controls="main-navigation"
            [attr.aria-expanded]="menuOpen"
            (click)="toggleMenu()"
          >
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </button>
        </div>

        <nav id="main-navigation" class="nav" [class.open]="menuOpen" role="navigation" [attr.aria-hidden]="!menuOpen">
          <a #firstLink routerLink="/home" (click)="closeMenu()">Home</a>
          <a routerLink="/booking" (click)="menuOpen = false">Booking</a>
          <a routerLink="/match" (click)="menuOpen = false">Request/Match</a>
          <a routerLink="/guide-profile" (click)="menuOpen = false">Guides</a>
          <a *ngIf="!auth.isAuthenticated()" routerLink="/signin" (click)="closeMenu()">Sign in</a>
          <a *ngIf="auth.isAuthenticated()" (click)="onSignOut()">Sign out</a>
        </nav>
      </div>
    </header>
  `,
  styles: [
    `
      .app-header { background: #f6f7fb; border-bottom: 1px solid #e3e6ee }
      .app-header .container { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:0.5rem 0 }
      .brand-wrap { display:flex; align-items:center; gap:0.5rem }
      .brand { display:inline-block; margin:0; font-weight:600 }
      .nav { display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center }
      .nav a { margin: 0; color: inherit; text-decoration: none }

      .hamburger { display:none; background:transparent; border:0; padding:0.25rem; cursor:pointer }
      .hamburger .bar { display:block; width:22px; height:2px; background:#111; margin:4px 0; transition: transform 0.15s ease }

      /* Small screens: show hamburger and collapse nav */
      @media (max-width: 600px) {
        .app-header .container { flex-direction:row; align-items:center }
        .hamburger { display:inline-flex; align-items:center }
        .nav { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #fff; flex-direction: column; gap:0; padding:0.5rem 1rem; display:none; box-shadow: 0 6px 18px rgba(0,0,0,0.08) }
        .nav.open { display:flex }
        .nav a { padding:0.5rem 0; border-bottom: 1px solid rgba(0,0,0,0.05) }
      }

      /* When menu open, animate hamburger bars into an X (optional subtle) */
      .hamburger[aria-expanded="true"] .bar:nth-child(1) { transform: translateY(6px) rotate(45deg) }
      .hamburger[aria-expanded="true"] .bar:nth-child(2) { opacity: 0 }
      .hamburger[aria-expanded="true"] .bar:nth-child(3) { transform: translateY(-6px) rotate(-45deg) }
    `
  ]
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

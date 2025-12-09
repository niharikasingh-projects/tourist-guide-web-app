import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SearchComponent } from './search.component';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';

@Component({
  standalone: true,
  imports: [CommonModule, SearchComponent, HeaderComponent, FooterComponent],
  selector: 'app-home',
  template: `
    <app-header></app-header>

    <main class="home-body container">
      <section class="hero">
        <h2>Find a local guide</h2>
        <app-search></app-search>
      </section>
    </main>

    <app-footer></app-footer>
  `,
  styles: [
    `
      .container { max-width:900px; margin:0 auto; padding:0.75rem }
      .home-body .hero { padding:1.25rem 0 }
      .home-body .hero h2 { margin-top:0 }

      /* Responsive adjustments */
      @media (max-width: 600px) {
        .home-body .hero { padding: 0.75rem 0 }
        .container { padding-left:0.5rem; padding-right:0.5rem }
      }
    `
  ]
})
export class HomeComponent {}

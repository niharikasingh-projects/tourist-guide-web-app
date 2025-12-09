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
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {}

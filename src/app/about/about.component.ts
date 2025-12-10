import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { FooterComponent } from '../layout/footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  constructor(private router: Router) {}

  locations = [
    {
      country: 'India',
      cities: ['Delhi', 'Mumbai', 'Bangalore', 'Jaipur', 'Goa', 'Kerala', 'Agra', 'Varanasi', 'Udaipur', 'Kolkata'],
      guides: 250
    },
    {
      country: 'Thailand',
      cities: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya'],
      guides: 85
    },
    {
      country: 'United Arab Emirates',
      cities: ['Dubai', 'Abu Dhabi', 'Sharjah'],
      guides: 60
    },
    {
      country: 'Singapore',
      cities: ['Singapore City'],
      guides: 45
    },
    {
      country: 'Malaysia',
      cities: ['Kuala Lumpur', 'Penang', 'Langkawi'],
      guides: 55
    },
    {
      country: 'Indonesia',
      cities: ['Bali', 'Jakarta', 'Yogyakarta'],
      guides: 70
    },
    {
      country: 'Sri Lanka',
      cities: ['Colombo', 'Kandy', 'Galle'],
      guides: 40
    },
    {
      country: 'Nepal',
      cities: ['Kathmandu', 'Pokhara'],
      guides: 35
    }
  ];

  features = [
    {
      icon: '🌍',
      title: 'Global Network',
      description: 'Connect with expert local guides across major tourist destinations worldwide'
    },
    {
      icon: '✨',
      title: 'Verified Guides',
      description: 'All our guides are thoroughly vetted and reviewed by travelers like you'
    },
    {
      icon: '💰',
      title: 'Transparent Pricing',
      description: 'No hidden fees. See upfront pricing and book with confidence'
    },
    {
      icon: '🎯',
      title: 'Personalized Experience',
      description: 'Find guides specializing in your interests - from culture to adventure'
    },
    {
      icon: '📱',
      title: 'Easy Booking',
      description: 'Book your guide in minutes with our simple and secure platform'
    },
    {
      icon: '🤝',
      title: 'Local Expertise',
      description: 'Get authentic insights and hidden gems only locals know about'
    }
  ];

  navigateToSearch() {
    this.router.navigate(['/home']);
  }
}

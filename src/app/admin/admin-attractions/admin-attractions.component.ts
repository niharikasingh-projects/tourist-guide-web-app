import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { AdminAttractionService, AdminAttraction, CreateAdminAttractionDto, UpdateAdminAttractionDto } from '../../services/admin-attraction.service';
import { AutosuggestService, LocationSuggestion } from '../../services/autosuggest.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  selector: 'app-admin-attractions',
  templateUrl: './admin-attractions.component.html',
  styleUrls: ['./admin-attractions.component.css']
})
export class AdminAttractionsComponent implements OnInit {
  attractions: AdminAttraction[] = [];
  showAddForm = false;
  editingId: string | null = null;
  loading = false;

  categories = [
    'Historical Sites',
    'Natural Wonders',
    'Museums',
    'Religious Sites',
    'Adventure',
    'Cultural',
    'Wildlife',
    'Beaches',
    'Architecture',
    'Food & Culinary',
    'Entertainment',
    'Shopping'
  ];

  newAttraction = {
    attractionName: '',
    location: '',
    city: '',
    country: '',
    description: '',
    category: '',
    pictures: [] as string[]
  };

  locationSuggestions: LocationSuggestion[] = [];
  showLocationSuggestions = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private adminAttractionService: AdminAttractionService,
    private autosuggestService: AutosuggestService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/']);
      return;
    }

    this.loadAttractions();
  }

  loadAttractions() {
    this.loading = true;
    this.adminAttractionService.getAllAttractions().subscribe({
      next: (attractions) => {
        this.attractions = attractions;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading attractions:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onLocationInput(event: any) {
    const query = event.target.value;
    if (query.length >= 2) {
      this.autosuggestService.getSuggestions(query).subscribe({
        next: (suggestions: LocationSuggestion[]) => {
          this.locationSuggestions = suggestions;
          this.showLocationSuggestions = suggestions.length > 0;
        },
        error: (err: any) => {
          console.error('Error fetching location suggestions:', err);
          this.showLocationSuggestions = false;
        }
      });
    } else {
      this.locationSuggestions = [];
      this.showLocationSuggestions = false;
    }
  }

  selectLocation(suggestion: LocationSuggestion) {
    const location = `${suggestion.name}, ${suggestion.country}`;
    this.newAttraction.location = location;
    this.newAttraction.city = suggestion.name;
    this.newAttraction.country = suggestion.country;
    this.showLocationSuggestions = false;
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.editingId = null;
    if (!this.showAddForm) {
      this.resetForm();
    }
    this.cdr.detectChanges();
  }

  addAttraction() {
    if (!this.newAttraction.attractionName || !this.newAttraction.location || !this.newAttraction.category) {
      alert('Please fill in required fields (Attraction Name, Location, and Category)');
      return;
    }

    const attractionDto: CreateAdminAttractionDto = {
      attractionName: this.newAttraction.attractionName,
      location: this.newAttraction.location,
      city: this.newAttraction.city,
      country: this.newAttraction.country,
      description: this.newAttraction.description,
      category: this.newAttraction.category,
      pictures: [...this.newAttraction.pictures]
    };

    this.loading = true;
    this.adminAttractionService.createAttraction(attractionDto).subscribe({
      next: (attraction) => {
        this.attractions.push(attraction);
        this.resetForm();
        this.showAddForm = false;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating attraction:', err);
        alert('Failed to create attraction. Please try again.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  editAttraction(attraction: AdminAttraction) {
    this.editingId = attraction.id;
    this.showAddForm = true;
    this.newAttraction = {
      attractionName: attraction.attractionName,
      location: attraction.location,
      city: attraction.city,
      country: attraction.country,
      description: attraction.description,
      category: attraction.category,
      pictures: [...(attraction.pictures || [])]
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateAttraction() {
    if (!this.newAttraction.attractionName || !this.newAttraction.location || !this.newAttraction.category) {
      alert('Please fill in required fields');
      return;
    }

    const index = this.attractions.findIndex(a => a.id === this.editingId);
    if (index !== -1) {
      const updateDto: UpdateAdminAttractionDto = {
        attractionName: this.newAttraction.attractionName,
        location: this.newAttraction.location,
        city: this.newAttraction.city,
        country: this.newAttraction.country,
        description: this.newAttraction.description,
        category: this.newAttraction.category,
        pictures: [...this.newAttraction.pictures]
      };

      this.loading = true;
      this.adminAttractionService.updateAttraction(this.editingId!, updateDto).subscribe({
        next: (updatedAttraction) => {
          this.attractions[index] = updatedAttraction;
          this.resetForm();
          this.editingId = null;
          this.showAddForm = false;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error updating attraction:', err);
          alert('Failed to update attraction. Please try again.');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteAttraction(id: string) {
    if (confirm('Are you sure you want to delete this attraction?')) {
      this.loading = true;
      this.adminAttractionService.deleteAttraction(id).subscribe({
        next: () => {
          this.attractions = this.attractions.filter(a => a.id !== id);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting attraction:', err);
          alert('Failed to delete attraction. Please try again.');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.newAttraction.pictures.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removePicture(index: number) {
    this.newAttraction.pictures.splice(index, 1);
  }

  private resetForm() {
    this.newAttraction = {
      attractionName: '',
      location: '',
      city: '',
      country: '',
      description: '',
      category: '',
      pictures: []
    };
    this.editingId = null;
    this.locationSuggestions = [];
    this.showLocationSuggestions = false;
  }
}

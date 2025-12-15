import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { AttractionService, GuideAttraction, CreateAttractionDto, UpdateAttractionDto } from '../../services/attraction.service';

interface AttractionAvailability extends GuideAttraction {}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  selector: 'app-manage-attractions',
  templateUrl: './manage-attractions.component.html',
  styleUrls: ['./manage-attractions.component.css']
})
export class ManageAttractionsComponent implements OnInit {
  attractions: AttractionAvailability[] = [];
  showAddForm = false;
  editingId: string | null = null;
  addingDateForId: string | null = null;
  newDateRange = { from: '', to: '' };
  loading = false;
  userEmail = '';
  
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
    'Food & Culinary'
  ];
  
  newAttraction = {
    attractionName: '',
    location: '',
    hourlyRate: 0,
    specialties: '',
    bio: '',
    fromDate: '',
    toDate: '',
    tourDuration: 0,
    category: '',
    pictures: [] as string[]
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private attractionService: AttractionService
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user || user.role !== 'guide') {
      this.router.navigate(['/']);
      return;
    }

    this.userEmail = user.email;
    this.loadAttractions();
  }

  loadAttractions() {
    this.loading = true;
    this.attractionService.getGuideAttractions(this.userEmail).subscribe({
      next: (attractions) => {
        this.attractions = attractions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading attractions:', err);
        this.loading = false;
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.editingId = null;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  addAttraction() {
    if (!this.newAttraction.attractionName || !this.newAttraction.location) {
      alert('Please fill in required fields');
      return;
    }

    const attractionDto: CreateAttractionDto = {
      attractionName: this.newAttraction.attractionName,
      location: this.newAttraction.location,
      hourlyRate: this.newAttraction.hourlyRate || 0,
      specialties: this.newAttraction.specialties.split(',').map(s => s.trim()).filter(s => s),
      bio: this.newAttraction.bio,
      tourDuration: this.newAttraction.tourDuration || 0,
      category: this.newAttraction.category,
      pictures: [...this.newAttraction.pictures],
      availableDates: this.newAttraction.fromDate && this.newAttraction.toDate
        ? [{ from: this.newAttraction.fromDate, to: this.newAttraction.toDate }]
        : []
    };

    this.loading = true;
    this.attractionService.createAttraction(this.userEmail, attractionDto).subscribe({
      next: (attraction) => {
        this.attractions.push(attraction);
        this.resetForm();
        this.showAddForm = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creating attraction:', err);
        alert('Failed to create attraction. Please try again.');
        this.loading = false;
      }
    });
  }

  toggleDateRangeForm(attractionId: string) {
    if (this.addingDateForId === attractionId) {
      this.addingDateForId = null;
      this.newDateRange = { from: '', to: '' };
    } else {
      this.addingDateForId = attractionId;
      this.newDateRange = { from: '', to: '' };
    }
  }

  submitDateRange(attraction: AttractionAvailability) {
    if (!this.newDateRange.from || !this.newDateRange.to) {
      alert('Please fill in both dates');
      return;
    }
    
    attraction.availableDates.push({ 
      from: this.newDateRange.from, 
      to: this.newDateRange.to 
    });
    
    // Update the attraction with new dates
    const updateDto: UpdateAttractionDto = {
      availableDates: attraction.availableDates
    };
    
    this.attractionService.updateAttraction(attraction.id, updateDto).subscribe({
      next: () => {
        this.addingDateForId = null;
        this.newDateRange = { from: '', to: '' };
      },
      error: (err) => {
        console.error('Error adding date range:', err);
        // Keep the local change even if API fails
        this.addingDateForId = null;
        this.newDateRange = { from: '', to: '' };
      }
    });
  }

  removeDateRange(attraction: AttractionAvailability, index: number) {
    if (confirm('Remove this date range?')) {
      attraction.availableDates.splice(index, 1);
      
      const updateDto: UpdateAttractionDto = {
        availableDates: attraction.availableDates
      };
      
      this.attractionService.updateAttraction(attraction.id, updateDto).subscribe({
        next: () => {
          // Date range removed successfully
        },
        error: (err) => {
          console.error('Error removing date range:', err);
          // Keep local change even if API fails
        }
      });
    }
  }

  editAttraction(attraction: AttractionAvailability) {
    this.editingId = attraction.id;
    this.showAddForm = true;
    this.newAttraction = {
      attractionName: attraction.attractionName,
      location: attraction.location,
      hourlyRate: attraction.hourlyRate,
      specialties: attraction.specialties.join(', '),
      bio: attraction.bio,
      tourDuration: attraction.tourDuration || 0,
      category: attraction.category || '',
      pictures: [...(attraction.pictures || [])],
      fromDate: '',
      toDate: ''
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateAttraction() {
    if (!this.newAttraction.attractionName || !this.newAttraction.location) {
      alert('Please fill in required fields');
      return;
    }

    const index = this.attractions.findIndex(a => a.id === this.editingId);
    if (index !== -1) {
      const updateDto: UpdateAttractionDto = {
        attractionName: this.newAttraction.attractionName,
        location: this.newAttraction.location,
        hourlyRate: this.newAttraction.hourlyRate || 0,
        specialties: this.newAttraction.specialties.split(',').map(s => s.trim()).filter(s => s),
        bio: this.newAttraction.bio,
        tourDuration: this.newAttraction.tourDuration || 0,
        category: this.newAttraction.category,
        pictures: [...this.newAttraction.pictures],
        availableDates: this.attractions[index].availableDates
      };
      
      this.loading = true;
      this.attractionService.updateAttraction(this.editingId!, updateDto).subscribe({
        next: (updatedAttraction) => {
          this.attractions[index] = { ...this.attractions[index], ...updatedAttraction };
          this.resetForm();
          this.editingId = null;
          this.showAddForm = false;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error updating attraction:', err);
          alert('Failed to update attraction. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  deleteAttraction(id: string) {
    if (confirm('Are you sure you want to delete this attraction?')) {
      this.loading = true;
      this.attractionService.deleteAttraction(id, this.userEmail).subscribe({
        next: () => {
          this.attractions = this.attractions.filter(a => a.id !== id);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error deleting attraction:', err);
          alert('Failed to delete attraction. Please try again.');
          this.loading = false;
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
      hourlyRate: 0,
      specialties: '',
      bio: '',
      fromDate: '',
      toDate: '',
      tourDuration: 0,
      category: '',
      pictures: []
    };
    this.editingId = null;
  }
}

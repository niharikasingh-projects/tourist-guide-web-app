import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { GuideProfileService, GuideProfile, CreateGuideProfileDto, UpdateGuideProfileDto } from '../../services/guide-profile.service';
import { AdminAttractionService, AdminAttraction } from '../../services/admin-attraction.service';
import { AutosuggestService, LocationSuggestion } from '../../services/autosuggest.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  selector: 'app-guide-manage-attractions',
  templateUrl: './guide-manage-attractions.component.html',
  styleUrls: ['./guide-manage-attractions.component.css']
})
export class GuideManageAttractionsComponent implements OnInit {
  guideProfiles: GuideProfile[] = [];
  showAddForm = false;
  editingId: string | null = null;
  addingDateForId: string | null = null;
  newDateRange = { from: '', to: '' };
  loading = false;
  userEmail = '';
  userName = '';

  locationSuggestions: LocationSuggestion[] = [];
  showLocationSuggestions = false;
  availableAttractions: AdminAttraction[] = [];
  filteredAttractions: AdminAttraction[] = [];

  newProfile = {
    location: '',
    attractionId: '',
    attractionName: '',
    hourlyRate: 0,
    tourDuration: 0,
    languages: [] as string[],
    languagesInput: '',
    bio: '',
    specialties: '',
    fromDate: '',
    toDate: ''
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private guideProfileService: GuideProfileService,
    private adminAttractionService: AdminAttractionService,
    private autosuggestService: AutosuggestService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user || user.role !== 'guide') {
      this.router.navigate(['/']);
      return;
    }

    this.userEmail = user.email;
    this.userName = user.username;
    this.loadGuideProfiles();
  }

  loadGuideProfiles() {
    this.loading = true;
    this.guideProfileService.getGuideProfiles(this.userEmail).subscribe({
      next: (profiles) => {
        this.guideProfiles = profiles;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading guide profiles:', err);
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
        }
      });
    } else {
      this.locationSuggestions = [];
      this.showLocationSuggestions = false;
      this.filteredAttractions = [];
    }
  }

  selectLocation(suggestion: LocationSuggestion) {
    const location = `${suggestion.name}, ${suggestion.country}`;
    this.newProfile.location = location;
    this.showLocationSuggestions = false;
    this.loadAttractionsByLocation(location);
  }

  loadAttractionsByLocation(location: string) {
    this.adminAttractionService.getAttractionsByLocation(location).subscribe({
      next: (attractions) => {
        this.availableAttractions = attractions;
        this.filteredAttractions = attractions;
      },
      error: (err) => {
        console.error('Error loading attractions:', err);
        this.filteredAttractions = [];
      }
    });
  }

  onAttractionSelect(event: any) {
    const attractionId = event.target.value;
    const attraction = this.filteredAttractions.find(a => a.id === attractionId);
    if (attraction) {
      this.newProfile.attractionId = attraction.id;
      this.newProfile.attractionName = attraction.attractionName;
    }
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.editingId = null;
    if (!this.showAddForm) {
      this.resetForm();
    }
    this.cdr.detectChanges();
  }

  addGuideProfile() {
    if (!this.newProfile.location || !this.newProfile.attractionId || !this.newProfile.hourlyRate) {
      alert('Please fill in required fields (Location, Attraction, and Hourly Rate)');
      return;
    }

    const languages = this.newProfile.languagesInput
      .split(',')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const profileDto: CreateGuideProfileDto = {
      guideName: this.userName,
      guideEmail: this.userEmail,
      attractionId: this.newProfile.attractionId,
      attractionName: this.newProfile.attractionName,
      location: this.newProfile.location,
      hourlyRate: this.newProfile.hourlyRate,
      tourDuration: this.newProfile.tourDuration || 0,
      languages: languages,
      specialties: this.newProfile.specialties.split(',').map(s => s.trim()).filter(s => s),
      bio: this.newProfile.bio,
      availableDates: this.newProfile.fromDate && this.newProfile.toDate
        ? [{ from: this.newProfile.fromDate, to: this.newProfile.toDate }]
        : []
    };

    this.loading = true;
    this.guideProfileService.createGuideProfile(profileDto).subscribe({
      next: (profile) => {
        this.guideProfiles.push(profile);
        this.resetForm();
        this.showAddForm = false;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating guide profile:', err);
        alert('Failed to create guide profile. Please try again.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  editGuideProfile(profile: GuideProfile) {
    this.editingId = profile.id;
    this.showAddForm = true;
    this.newProfile = {
      location: profile.location,
      attractionId: profile.attractionId,
      attractionName: profile.attractionName,
      hourlyRate: profile.hourlyRate,
      tourDuration: profile.tourDuration || 0,
      languages: [...profile.languages],
      languagesInput: profile.languages.join(', '),
      bio: profile.bio || '',
      specialties: (profile.specialties || []).join(', '),
      fromDate: '',
      toDate: ''
    };
    this.loadAttractionsByLocation(profile.location);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateGuideProfile() {
    if (!this.newProfile.hourlyRate) {
      alert('Please fill in required fields');
      return;
    }

    const index = this.guideProfiles.findIndex(p => p.id === this.editingId);
    if (index !== -1) {
      const languages = this.newProfile.languagesInput
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      const updateDto: UpdateGuideProfileDto = {
        hourlyRate: this.newProfile.hourlyRate,
        tourDuration: this.newProfile.tourDuration || 0,
        languages: languages,
        specialties: this.newProfile.specialties.split(',').map(s => s.trim()).filter(s => s),
        bio: this.newProfile.bio,
        availableDates: this.guideProfiles[index].availableDates
      };

      this.loading = true;
      this.guideProfileService.updateGuideProfile(this.editingId!, updateDto).subscribe({
        next: (updatedProfile) => {
          this.guideProfiles[index] = { ...this.guideProfiles[index], ...updatedProfile };
          this.editingId = null;
          this.showAddForm = false;
          this.resetForm();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error updating guide profile:', err);
          alert('Failed to update guide profile. Please try again.');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteGuideProfile(id: string) {
    if (confirm('Are you sure you want to delete this guide profile?')) {
      this.loading = true;
      this.guideProfileService.deleteGuideProfile(id, this.userEmail).subscribe({
        next: () => {
          this.guideProfiles = this.guideProfiles.filter(p => p.id !== id);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting guide profile:', err);
          alert('Failed to delete guide profile. Please try again.');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleDateRangeForm(profileId: string) {
    if (this.addingDateForId === profileId) {
      this.addingDateForId = null;
      this.newDateRange = { from: '', to: '' };
    } else {
      this.addingDateForId = profileId;
      this.newDateRange = { from: '', to: '' };
    }
  }

  submitDateRange(profile: GuideProfile) {
    if (!this.newDateRange.from || !this.newDateRange.to) {
      alert('Please fill in both dates');
      return;
    }

    profile.availableDates.push({
      from: this.newDateRange.from,
      to: this.newDateRange.to
    });

    const updateDto: UpdateGuideProfileDto = {
      availableDates: profile.availableDates
    };

    this.guideProfileService.updateGuideProfile(profile.id, updateDto).subscribe({
      next: () => {
        this.addingDateForId = null;
        this.newDateRange = { from: '', to: '' };
      },
      error: (err) => {
        console.error('Error adding date range:', err);
        this.addingDateForId = null;
        this.newDateRange = { from: '', to: '' };
      }
    });
  }

  removeDateRange(profile: GuideProfile, index: number) {
    if (confirm('Remove this date range?')) {
      profile.availableDates.splice(index, 1);

      const updateDto: UpdateGuideProfileDto = {
        availableDates: profile.availableDates
      };

      this.guideProfileService.updateGuideProfile(profile.id, updateDto).subscribe({
        next: () => {},
        error: (err) => {
          console.error('Error removing date range:', err);
        }
      });
    }
  }

  private resetForm() {
    this.newProfile = {
      location: '',
      attractionId: '',
      attractionName: '',
      hourlyRate: 0,
      tourDuration: 0,
      languages: [],
      languagesInput: '',
      bio: '',
      specialties: '',
      fromDate: '',
      toDate: ''
    };
    this.editingId = null;
    this.locationSuggestions = [];
    this.showLocationSuggestions = false;
    this.filteredAttractions = [];
  }
}

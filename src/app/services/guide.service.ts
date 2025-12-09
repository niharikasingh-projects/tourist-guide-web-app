import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Guide {
  id: string;
  name: string;
  imageUrl: string;
  languages: string[];
  availability: string;
  hourlyRate: number;
  rating: number;
  experienceYears: number;
  specialties: string[];
  bio: string;
  availableDates: { from: string; to: string }[];
  contact?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private guides: Guide[] = [
    // Paris guides (pa-1, pa-2, pa-3)
    {
      id: 'g-pa-1',
      name: 'Pierre Dubois',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      languages: ['English', 'French', 'Spanish'],
      availability: 'Available',
      hourlyRate: 35,
      rating: 4.8,
      experienceYears: 10,
      specialties: ['Paris History', 'Architecture', 'Fine Arts'],
      bio: 'Parisian guide with extensive knowledge of the city\'s art, history, and hidden gems.',
      availableDates: [
        { from: '2025-12-10', to: '2025-12-31' },
        { from: '2026-01-05', to: '2026-01-25' },
        { from: '2026-02-01', to: '2026-02-28' }
      ]
    },
    {
      id: 'g-pa-2',
      name: 'Sophie Laurent',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      languages: ['English', 'French', 'Italian', 'German'],
      availability: 'Available',
      hourlyRate: 38,
      rating: 4.9,
      experienceYears: 12,
      specialties: ['Louvre Museum', 'French Cuisine', 'Shopping'],
      bio: 'Art historian specializing in French Renaissance and Impressionist art.',
      availableDates: [
        { from: '2025-12-09', to: '2025-12-20' },
        { from: '2025-12-26', to: '2026-01-15' },
        { from: '2026-01-20', to: '2026-03-31' }
      ]
    },
    {
      id: 'g-pa-3',
      name: 'Antoine Martin',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      languages: ['English', 'French', 'Japanese'],
      availability: 'Available',
      hourlyRate: 32,
      rating: 4.7,
      experienceYears: 8,
      specialties: ['Eiffel Tower', 'Photography', 'Romance Tours'],
      bio: 'Passionate photographer and guide showing Paris through a creative lens.',
      availableDates: [
        { from: '2025-12-15', to: '2026-01-10' },
        { from: '2026-01-25', to: '2026-02-20' }
      ]
    },
    // London guides (lo-1, lo-2, lo-3)
    {
      id: 'g-lo-1',
      name: 'James Harrison',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      languages: ['English', 'French', 'Spanish'],
      availability: 'Available',
      hourlyRate: 40,
      rating: 4.8,
      experienceYears: 15,
      specialties: ['British History', 'Royal Family', 'Parliament'],
      bio: 'Former history professor with encyclopedic knowledge of London\'s past.',
      availableDates: [
        { from: '2025-12-12', to: '2026-01-15' },
        { from: '2026-01-20', to: '2026-03-10' }
      ]
    },
    {
      id: 'g-lo-2',
      name: 'Emma Thompson',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      languages: ['English', 'German', 'Mandarin'],
      availability: 'Available',
      hourlyRate: 42,
      rating: 4.9,
      experienceYears: 11,
      specialties: ['Museums', 'Culture', 'Hidden London'],
      bio: 'Museum curator turned guide, revealing London\'s cultural treasures.',
      availableDates: [
        { from: '2025-12-10', to: '2025-12-28' },
        { from: '2026-01-10', to: '2026-02-20' },
        { from: '2026-03-01', to: '2026-03-31' }
      ]
    },
    {
      id: 'g-lo-3',
      name: 'Oliver Davies',
      imageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop',
      languages: ['English', 'French'],
      availability: 'Available',
      hourlyRate: 36,
      rating: 4.6,
      experienceYears: 7,
      specialties: ['Walking Tours', 'Pubs', 'Modern London'],
      bio: 'Local Londoner sharing insider tips and authentic experiences.',
      availableDates: [
        { from: '2025-12-18', to: '2026-01-08' },
        { from: '2026-02-01', to: '2026-03-15' }
      ]
    },
    // New York guides (ny-1, ny-2, ny-3)
    {
      id: 'g-ny-1',
      name: 'Michael Rodriguez',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      languages: ['English', 'Spanish', 'French'],
      availability: 'Available',
      hourlyRate: 45,
      rating: 4.9,
      experienceYears: 13,
      specialties: ['NYC History', 'Architecture', 'Immigration'],
      bio: 'Native New Yorker with deep knowledge of the city\'s diverse neighborhoods and history.',
      availableDates: [
        { from: '2025-12-15', to: '2026-01-10' },
        { from: '2026-01-25', to: '2026-03-05' }
      ]
    },
    {
      id: 'g-ny-2',
      name: 'Sarah Chen',
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
      languages: ['English', 'Mandarin', 'Japanese'],
      availability: 'Available',
      hourlyRate: 42,
      rating: 4.8,
      experienceYears: 9,
      specialties: ['Central Park', 'Museums', 'Food Tours'],
      bio: 'Urban planner and nature enthusiast specializing in NYC parks and green spaces.',
      availableDates: [
        { from: '2025-12-10', to: '2025-12-25' },
        { from: '2026-01-05', to: '2026-02-15' },
        { from: '2026-02-25', to: '2026-03-20' }
      ]
    },
    {
      id: 'g-ny-3',
      name: 'David Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop',
      languages: ['English', 'German'],
      availability: 'Available',
      hourlyRate: 48,
      rating: 4.7,
      experienceYears: 16,
      specialties: ['Skyscrapers', 'Art Deco', 'Photography'],
      bio: 'Architectural photographer capturing NYC\'s iconic skyline for over a decade.',
      availableDates: [
        { from: '2025-12-20', to: '2026-01-20' },
        { from: '2026-02-10', to: '2026-03-31' }
      ]
    },
    // Rome guides (ro-1, ro-2, ro-3)
    {
      id: 'g-ro-1',
      name: 'Marco Rossi',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      languages: ['English', 'Italian', 'Spanish', 'French'],
      availability: 'Available',
      hourlyRate: 38,
      rating: 4.9,
      experienceYears: 14,
      specialties: ['Ancient Rome', 'Archaeology', 'Roman History'],
      bio: 'Archaeologist with extensive experience excavating and studying Roman ruins.',
      availableDates: [
        { from: '2025-12-11', to: '2026-01-05' },
        { from: '2026-01-15', to: '2026-02-28' }
      ]
    },
    {
      id: 'g-ro-2',
      name: 'Giulia Bianchi',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
      languages: ['English', 'Italian', 'German'],
      availability: 'Available',
      hourlyRate: 40,
      rating: 4.8,
      experienceYears: 10,
      specialties: ['Vatican', 'Renaissance Art', 'Religious History'],
      bio: 'Art history professor specializing in Vatican treasures and Renaissance masters.',
      availableDates: [
        { from: '2025-12-09', to: '2025-12-30' },
        { from: '2026-01-10', to: '2026-02-15' },
        { from: '2026-03-01', to: '2026-03-25' }
      ]
    },
    {
      id: 'g-ro-3',
      name: 'Alessandro Ferrari',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      languages: ['English', 'Italian', 'Japanese'],
      availability: 'Available',
      hourlyRate: 35,
      rating: 4.7,
      experienceYears: 8,
      specialties: ['Roman Cuisine', 'Walking Tours', 'Local Life'],
      bio: 'Food and culture enthusiast sharing Rome\'s culinary and artistic heritage.',
      availableDates: [
        { from: '2025-12-16', to: '2026-01-12' },
        { from: '2026-02-05', to: '2026-03-20' }
      ]
    },
    // Tokyo guides (to-1, to-2, to-3)
    {
      id: 'g-to-1',
      name: 'Hiroshi Tanaka',
      imageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop',
      languages: ['English', 'Japanese', 'Mandarin'],
      availability: 'Available',
      hourlyRate: 42,
      rating: 4.9,
      experienceYears: 12,
      specialties: ['Mount Fuji', 'Japanese Culture', 'Nature Tours'],
      bio: 'Mountain guide with deep respect for Japanese traditions and natural beauty.',
      availableDates: [
        { from: '2025-12-14', to: '2026-01-18' },
        { from: '2026-02-01', to: '2026-03-10' }
      ]
    },
    {
      id: 'g-to-2',
      name: 'Yuki Yamamoto',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
      languages: ['English', 'Japanese', 'Korean'],
      availability: 'Available',
      hourlyRate: 38,
      rating: 4.8,
      experienceYears: 9,
      specialties: ['Japanese Cuisine', 'Street Food', 'Local Markets'],
      bio: 'Chef turned guide, passionate about sharing authentic Japanese flavors.',
      availableDates: [
        { from: '2025-12-10', to: '2025-12-24' },
        { from: '2026-01-08', to: '2026-02-10' },
        { from: '2026-02-20', to: '2026-03-31' }
      ]
    },
    {
      id: 'g-to-3',
      name: 'Kenji Sato',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      languages: ['English', 'Japanese', 'French'],
      availability: 'Available',
      hourlyRate: 40,
      rating: 4.7,
      experienceYears: 11,
      specialties: ['Temples', 'Buddhism', 'Traditional Arts'],
      bio: 'Buddhist scholar sharing the spiritual and cultural heart of Tokyo.',
      availableDates: [
        { from: '2025-12-17', to: '2026-01-14' },
        { from: '2026-02-05', to: '2026-03-15' }
      ]
    },
    // Taj Mahal guides (ag-1)
    {
      id: 'g-tj-1',
      name: 'Rajesh Kumar',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'French'],
      availability: 'Available',
      hourlyRate: 25,
      rating: 4.9,
      experienceYears: 12,
      specialties: ['Mughal History', 'Architecture', 'Photography'],
      bio: 'Expert in Mughal architecture with over a decade of experience guiding tourists at the Taj Mahal.',
      availableDates: [
        { from: '2025-12-10', to: '2026-01-10' },
        { from: '2026-01-20', to: '2026-03-15' }
      ]
    },
    {
      id: 'g-tj-2',
      name: 'Priya Sharma',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Spanish', 'German'],
      availability: 'Available',
      hourlyRate: 30,
      rating: 5.0,
      experienceYears: 8,
      specialties: ['History', 'Cultural Tours', 'Storytelling'],
      bio: 'Passionate storyteller bringing the love story of Taj Mahal to life for visitors from around the world.',
      availableDates: [
        { from: '2025-12-12', to: '2025-12-31' },
        { from: '2026-01-15', to: '2026-02-25' },
        { from: '2026-03-05', to: '2026-03-31' }
      ]
    },
    {
      id: 'g-tj-3',
      name: 'Mohammed Ali',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Urdu', 'Arabic'],
      availability: 'Available',
      hourlyRate: 22,
      rating: 4.7,
      experienceYears: 10,
      specialties: ['Islamic Architecture', 'Local Cuisine', 'Shopping'],
      bio: 'Local expert with deep knowledge of Agra\'s culture, history, and hidden gems.',
      availableDates: [
        { from: '2025-12-14', to: '2026-01-08' },
        { from: '2026-02-01', to: '2026-03-20' }
      ]
    },
    // Red Fort Delhi guides (dl-1)
    {
      id: 'g-dl-1',
      name: 'Vikram Singh',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Punjabi'],
      availability: 'Available',
      hourlyRate: 20,
      rating: 4.8,
      experienceYears: 15,
      specialties: ['Delhi History', 'British Colonial Era', 'Independence Movement'],
      bio: 'Historian specializing in Delhi\'s rich past from Mughal times to modern India.',
      availableDates: [
        { from: '2025-12-09', to: '2026-01-05' },
        { from: '2026-01-18', to: '2026-02-28' },
        { from: '2026-03-10', to: '2026-03-31' }
      ]
    },
    {
      id: 'g-dl-2',
      name: 'Anjali Verma',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'French', 'Japanese'],
      availability: 'Available',
      hourlyRate: 28,
      rating: 4.9,
      experienceYears: 9,
      specialties: ['Architecture', 'Art History', 'Photography Tours'],
      bio: 'Art historian with expertise in Indo-Islamic architecture and cultural heritage.',
      availableDates: [
        { from: '2025-12-11', to: '2025-12-29' },
        { from: '2026-01-12', to: '2026-02-18' }
      ]
    },
    // Jaipur - Hawa Mahal guides (jp-2)
    {
      id: 'g-jp-1',
      name: 'Arjun Rathore',
      imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Rajasthani'],
      availability: 'Available',
      hourlyRate: 18,
      rating: 4.6,
      experienceYears: 7,
      specialties: ['Rajput History', 'Pink City Tours', 'Local Markets'],
      bio: 'Born and raised in Jaipur, passionate about sharing the stories of the royal city.',
      availableDates: [
        { from: '2025-12-15', to: '2026-01-12' },
        { from: '2026-02-01', to: '2026-03-10' }
      ]
    },
    {
      id: 'g-jp-2',
      name: 'Meera Chouhan',
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'German', 'Italian'],
      availability: 'Available',
      hourlyRate: 25,
      rating: 4.8,
      experienceYears: 11,
      specialties: ['Royal Heritage', 'Jewelry Tours', 'Traditional Crafts'],
      bio: 'Expert in Rajasthani culture with special focus on traditional arts and crafts.',
      availableDates: [
        { from: '2025-12-10', to: '2025-12-27' },
        { from: '2026-01-10', to: '2026-02-20' },
        { from: '2026-03-01', to: '2026-03-31' }
      ]
    },
    // Mumbai - Gateway of India guides (mb-1)
    {
      id: 'g-mb-1',
      name: 'Karan Desai',
      imageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Marathi', 'Gujarati'],
      availability: 'Available',
      hourlyRate: 22,
      rating: 4.7,
      experienceYears: 6,
      specialties: ['Colonial History', 'Bollywood', 'Street Food'],
      bio: 'Mumbai native with insider knowledge of the city\'s vibrant culture and history.',
      availableDates: [
        { from: '2025-12-13', to: '2026-01-15' },
        { from: '2026-02-05', to: '2026-03-25' }
      ]
    },
    {
      id: 'g-mb-2',
      name: 'Shalini Iyer',
      imageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Marathi', 'Tamil'],
      availability: 'Available',
      hourlyRate: 24,
      rating: 4.9,
      experienceYears: 8,
      specialties: ['Architecture', 'Heritage Walks', 'Photography'],
      bio: 'Architectural enthusiast specializing in Mumbai\'s diverse building styles and heritage.',
      availableDates: [
        { from: '2025-12-10', to: '2025-12-30' },
        { from: '2026-01-08', to: '2026-02-12' },
        { from: '2026-02-25', to: '2026-03-31' }
      ]
    },
    // Goa Beach guides (go-1)
    {
      id: 'g-go-1',
      name: 'Carlos Fernandes',
      imageUrl: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Portuguese', 'Konkani'],
      availability: 'Available',
      hourlyRate: 20,
      rating: 4.8,
      experienceYears: 10,
      specialties: ['Beach Activities', 'Water Sports', 'Portuguese Heritage'],
      bio: 'Goan local with expertise in beach culture, water sports, and Portuguese colonial history.',
      availableDates: [
        { from: '2025-12-16', to: '2026-01-20' },
        { from: '2026-02-10', to: '2026-03-15' }
      ]
    },
    {
      id: 'g-go-2',
      name: 'Maria D\'Souza',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Portuguese', 'Marathi'],
      availability: 'Available',
      hourlyRate: 18,
      rating: 4.7,
      experienceYears: 5,
      specialties: ['Churches', 'Goan Cuisine', 'Cultural Tours'],
      bio: 'Passionate about sharing Goa\'s unique blend of Indian and Portuguese cultures.',
      availableDates: [
        { from: '2025-12-12', to: '2026-01-08' },
        { from: '2026-01-25', to: '2026-02-28' },
        { from: '2026-03-10', to: '2026-03-31' }
      ]
    },
    // Kerala Backwaters guides (ke-1)
    {
      id: 'g-ke-1',
      name: 'Arun Nair',
      imageUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Malayalam', 'Tamil'],
      availability: 'Available',
      hourlyRate: 22,
      rating: 4.9,
      experienceYears: 14,
      specialties: ['Backwater Tours', 'Ayurveda', 'Local Wildlife'],
      bio: 'Kerala tourism expert with deep knowledge of backwaters, nature, and traditional healing.',
      availableDates: [
        { from: '2025-12-09', to: '2026-01-10' },
        { from: '2026-01-22', to: '2026-03-05' }
      ]
    },
    {
      id: 'g-ke-2',
      name: 'Lakshmi Menon',
      imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Malayalam'],
      availability: 'Available',
      hourlyRate: 20,
      rating: 4.8,
      experienceYears: 7,
      specialties: ['Houseboat Tours', 'Kerala Cuisine', 'Village Life'],
      bio: 'Local guide specializing in authentic Kerala experiences and traditional village tours.',
      availableDates: [
        { from: '2025-12-14', to: '2025-12-31' },
        { from: '2026-01-15', to: '2026-02-20' },
        { from: '2026-03-01', to: '2026-03-31' }
      ]
    },
    // Varanasi guides (vr-1)
    {
      id: 'g-vr-1',
      name: 'Pandit Sharma',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Sanskrit'],
      availability: 'Available',
      hourlyRate: 18,
      rating: 5.0,
      experienceYears: 20,
      specialties: ['Spirituality', 'Hindu Rituals', 'Ancient History'],
      bio: 'Spiritual guide with decades of experience in Varanasi\'s sacred traditions and rituals.',
      availableDates: [
        { from: '2025-12-11', to: '2026-01-12' },
        { from: '2026-02-01', to: '2026-03-20' }
      ]
    },
    {
      id: 'g-vr-2',
      name: 'Kavita Rai',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Japanese'],
      availability: 'Available',
      hourlyRate: 20,
      rating: 4.7,
      experienceYears: 8,
      specialties: ['Ganga Aarti', 'Temples', 'Cultural Immersion'],
      bio: 'Cultural guide helping visitors understand the spiritual essence of Varanasi.',
      availableDates: [
        { from: '2025-12-15', to: '2026-01-05' },
        { from: '2026-01-20', to: '2026-02-25' },
        { from: '2026-03-10', to: '2026-03-31' }
      ]
    },
    // Udaipur guides (ud-1)
    {
      id: 'g-ud-1',
      name: 'Ravi Mewar',
      imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Rajasthani'],
      availability: 'Available',
      hourlyRate: 22,
      rating: 4.8,
      experienceYears: 11,
      specialties: ['Royal History', 'Lake Tours', 'Palace Architecture'],
      bio: 'Expert guide with deep knowledge of Udaipur\'s royal heritage and stunning palaces.',
      availableDates: [
        { from: '2025-12-10', to: '2026-01-15' },
        { from: '2026-02-01', to: '2026-03-10' }
      ]
    },
    {
      id: 'g-ud-2',
      name: 'Priyanka Rathore',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'French', 'German'],
      availability: 'Available',
      hourlyRate: 24,
      rating: 4.9,
      experienceYears: 9,
      specialties: ['Cultural Shows', 'Photography', 'Romantic Tours'],
      bio: 'Passionate about showcasing Udaipur\'s romantic ambiance and cultural richness.',
      availableDates: [
        { from: '2025-12-12', to: '2025-12-28' },
        { from: '2026-01-10', to: '2026-02-15' },
        { from: '2026-03-01', to: '2026-03-31' }
      ]
    },
    // Rishikesh guides (ri-1)
    {
      id: 'g-ri-1',
      name: 'Amit Sharma',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'German'],
      availability: 'Available',
      hourlyRate: 26,
      rating: 4.9,
      experienceYears: 10,
      specialties: ['Rafting', 'Adventure Sports', 'River Safety'],
      bio: 'Certified adventure guide with extensive experience in white water rafting and bungee jumping.',
      availableDates: [
        { from: '2025-12-14', to: '2026-01-18' },
        { from: '2026-02-05', to: '2026-03-15' }
      ]
    },
    {
      id: 'g-ri-2',
      name: 'Swami Ananda',
      imageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Sanskrit'],
      availability: 'Available',
      hourlyRate: 20,
      rating: 4.8,
      experienceYears: 15,
      specialties: ['Yoga', 'Meditation', 'Spiritual Guidance'],
      bio: 'Yoga master teaching traditional practices in the yoga capital of the world.',
      availableDates: [
        { from: '2025-12-10', to: '2026-01-08' },
        { from: '2026-01-25', to: '2026-02-28' },
        { from: '2026-03-10', to: '2026-03-31' }
      ]
    },
    // Bangalore guides (bl-1)
    {
      id: 'g-bl-1',
      name: 'Suresh Reddy',
      imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Kannada', 'Tamil'],
      availability: 'Available',
      hourlyRate: 20,
      rating: 4.6,
      experienceYears: 5,
      specialties: ['Gardens', 'Tech Tours', 'Pub Culture'],
      bio: 'Tech-savvy guide showcasing Bangalore\'s blend of nature, innovation, and nightlife.',
      availableDates: [
        { from: '2025-12-16', to: '2026-01-14' },
        { from: '2026-02-01', to: '2026-03-20' }
      ]
    },
    {
      id: 'g-bl-2',
      name: 'Divya Krishnan',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Kannada', 'Telugu'],
      availability: 'Available',
      hourlyRate: 22,
      rating: 4.8,
      experienceYears: 6,
      specialties: ['Heritage', 'Food Tours', 'Shopping'],
      bio: 'Bangalore native passionate about the city\'s heritage, cuisine, and modern culture.',
      availableDates: [
        { from: '2025-12-11', to: '2025-12-31' },
        { from: '2026-01-12', to: '2026-02-18' },
        { from: '2026-03-01', to: '2026-03-31' }
      ]
    },
    // Pune guides (pu-1)
    {
      id: 'g-pu-1',
      name: 'Rohit Patil',
      imageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Marathi'],
      availability: 'Available',
      hourlyRate: 18,
      rating: 4.7,
      experienceYears: 9,
      specialties: ['Maratha History', 'Forts', 'Trekking'],
      bio: 'History enthusiast and trekking guide specializing in Pune\'s Maratha heritage.',
      availableDates: [
        { from: '2025-12-13', to: '2026-01-16' },
        { from: '2026-02-05', to: '2026-03-12' }
      ]
    },
    {
      id: 'g-pu-2',
      name: 'Sneha Kulkarni',
      imageUrl: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&h=400&fit=crop',
      languages: ['English', 'Hindi', 'Marathi', 'German'],
      availability: 'Available',
      hourlyRate: 20,
      rating: 4.9,
      experienceYears: 7,
      specialties: ['Cultural Tours', 'Street Food', 'Art Galleries'],
      bio: 'Cultural ambassador showcasing Pune\'s vibrant art scene and culinary delights.',
      availableDates: [
        { from: '2025-12-10', to: '2025-12-29' },
        { from: '2026-01-10', to: '2026-02-20' },
        { from: '2026-03-05', to: '2026-03-31' }
      ]
    }
  ];

  constructor() { }

  getGuidesByAttractionId(attractionId: string, fromDate?: string | null, toDate?: string | null): Observable<Guide[]> {
    // Map attraction IDs to guide IDs
    const attractionGuideMap: { [key: string]: string[] } = {
      // Paris
      'pa-1': ['g-pa-1', 'g-pa-2', 'g-pa-3'],
      'pa-2': ['g-pa-1', 'g-pa-2'],
      'pa-3': ['g-pa-2', 'g-pa-3'],
      // London
      'lo-1': ['g-lo-1', 'g-lo-2', 'g-lo-3'],
      'lo-2': ['g-lo-2', 'g-lo-3'],
      'lo-3': ['g-lo-1', 'g-lo-3'],
      // New York
      'ny-1': ['g-ny-1', 'g-ny-2', 'g-ny-3'],
      'ny-2': ['g-ny-2', 'g-ny-3'],
      'ny-3': ['g-ny-1', 'g-ny-3'],
      // Rome
      'ro-1': ['g-ro-1', 'g-ro-2', 'g-ro-3'],
      'ro-2': ['g-ro-2', 'g-ro-3'],
      'ro-3': ['g-ro-1', 'g-ro-3'],
      // Tokyo
      'to-1': ['g-to-1', 'g-to-2', 'g-to-3'],
      'to-2': ['g-to-2', 'g-to-3'],
      'to-3': ['g-to-1', 'g-to-3'],
      // Delhi
      'de-1': ['g-dl-1', 'g-dl-2'],
      'de-2': ['g-dl-1', 'g-dl-2'],
      'de-3': ['g-dl-1', 'g-dl-2'],
      'de-4': ['g-dl-1', 'g-dl-2'],
      'de-5': ['g-dl-1', 'g-dl-2'],
      'de-6': ['g-dl-1', 'g-dl-2'],
      'de-7': ['g-dl-1', 'g-dl-2'],
      'de-8': ['g-dl-1', 'g-dl-2'],
      'de-9': ['g-dl-1', 'g-dl-2'],
      'de-10': ['g-dl-1', 'g-dl-2'],
      // Agra
      'ag-1': ['g-tj-1', 'g-tj-2', 'g-tj-3'],
      'ag-2': ['g-tj-1', 'g-tj-2', 'g-tj-3'],
      'ag-3': ['g-tj-1', 'g-tj-2'],
      'ag-4': ['g-tj-1', 'g-tj-3'],
      'ag-5': ['g-tj-1', 'g-tj-2', 'g-tj-3'],
      'ag-6': ['g-tj-2', 'g-tj-3'],
      'ag-7': ['g-tj-1', 'g-tj-2'],
      'ag-8': ['g-tj-1', 'g-tj-2', 'g-tj-3'],
      // Jaipur
      'ja-1': ['g-jp-1', 'g-jp-2'],
      'ja-2': ['g-jp-1', 'g-jp-2'],
      'ja-3': ['g-jp-1', 'g-jp-2'],
      'ja-4': ['g-jp-1', 'g-jp-2'],
      'ja-5': ['g-jp-1', 'g-jp-2'],
      'ja-6': ['g-jp-1', 'g-jp-2'],
      'ja-7': ['g-jp-1', 'g-jp-2'],
      'ja-8': ['g-jp-1', 'g-jp-2'],
      'ja-9': ['g-jp-1', 'g-jp-2'],
      // Mumbai
      'mu-1': ['g-mb-1', 'g-mb-2'],
      'mu-2': ['g-mb-1', 'g-mb-2'],
      'mu-3': ['g-mb-1', 'g-mb-2'],
      'mu-5': ['g-mb-1', 'g-mb-2'],
      'mu-6': ['g-mb-1', 'g-mb-2'],
      'mu-7': ['g-mb-1', 'g-mb-2'],
      'mu-8': ['g-mb-1', 'g-mb-2'],
      'mu-9': ['g-mb-1', 'g-mb-2'],
      'mu-10': ['g-mb-1', 'g-mb-2'],
      // Goa
      'go-1': ['g-go-1', 'g-go-2'],
      'go-2': ['g-go-1', 'g-go-2'],
      'go-3': ['g-go-1', 'g-go-2'],
      'go-4': ['g-go-1', 'g-go-2'],
      'go-5': ['g-go-1', 'g-go-2'],
      'go-6': ['g-go-1', 'g-go-2'],
      'go-7': ['g-go-1', 'g-go-2'],
      'go-8': ['g-go-1', 'g-go-2'],
      // Kerala
      'ke-1': ['g-ke-1', 'g-ke-2'],
      'ke-2': ['g-ke-1', 'g-ke-2'],
      'ke-3': ['g-ke-1', 'g-ke-2'],
      'ke-4': ['g-ke-1', 'g-ke-2'],
      'ke-5': ['g-ke-1', 'g-ke-2'],
      'ke-6': ['g-ke-1', 'g-ke-2'],
      'ke-7': ['g-ke-1', 'g-ke-2'],
      // Udaipur
      'ud-1': ['g-ud-1', 'g-ud-2'],
      'ud-2': ['g-ud-1', 'g-ud-2'],
      'ud-3': ['g-ud-1', 'g-ud-2'],
      'ud-4': ['g-ud-1', 'g-ud-2'],
      'ud-5': ['g-ud-1', 'g-ud-2'],
      'ud-6': ['g-ud-1', 'g-ud-2'],
      'ud-7': ['g-ud-1', 'g-ud-2'],
      // Varanasi
      'va-1': ['g-vr-1', 'g-vr-2'],
      'va-2': ['g-vr-1', 'g-vr-2'],
      'va-3': ['g-vr-1', 'g-vr-2'],
      'va-4': ['g-vr-1', 'g-vr-2'],
      'va-5': ['g-vr-1', 'g-vr-2'],
      'va-6': ['g-vr-1', 'g-vr-2'],
      'va-7': ['g-vr-1', 'g-vr-2'],
      // Rishikesh
      'ri-1': ['g-ri-1', 'g-ri-2'],
      'ri-2': ['g-ri-1', 'g-ri-2'],
      'ri-3': ['g-ri-1', 'g-ri-2'],
      'ri-4': ['g-ri-1', 'g-ri-2'],
      'ri-5': ['g-ri-1', 'g-ri-2'],
      'ri-6': ['g-ri-1', 'g-ri-2'],
      'ri-7': ['g-ri-1', 'g-ri-2'],
      // Bangalore
      'ba-1': ['g-bl-1', 'g-bl-2'],
      'ba-2': ['g-bl-1', 'g-bl-2'],
      'ba-3': ['g-bl-1', 'g-bl-2'],
      'ba-4': ['g-bl-1', 'g-bl-2'],
      'ba-5': ['g-bl-1', 'g-bl-2'],
      'ba-6': ['g-bl-1', 'g-bl-2'],
      'ba-7': ['g-bl-1', 'g-bl-2'],
      // Pune
      'pu-1': ['g-pu-1', 'g-pu-2'],
      'pu-2': ['g-pu-1', 'g-pu-2'],
      'pu-3': ['g-pu-1', 'g-pu-2'],
      'pu-4': ['g-pu-1', 'g-pu-2'],
      'pu-5': ['g-pu-1', 'g-pu-2'],
      'pu-6': ['g-pu-1', 'g-pu-2'],
      'pu-7': ['g-pu-1', 'g-pu-2'],
      'pu-8': ['g-pu-1', 'g-pu-2']
      // Dubai attractions (du-1, du-2, du-3) intentionally excluded - no guides
    };

    const guideIds = attractionGuideMap[attractionId] || [];
    let availableGuides = this.guides.filter(guide => guideIds.includes(guide.id));
    
    // Filter by date availability if dates are provided
    if (fromDate && toDate) {
      availableGuides = availableGuides.filter(guide => 
        this.isGuideAvailable(guide, fromDate, toDate)
      );
    }
    
    return of(availableGuides).pipe(delay(200));
  }

  getGuideById(guideId: string): Observable<Guide | undefined> {
    const guide = this.guides.find(g => g.id === guideId);
    return of(guide).pipe(delay(100));
  }

  private isGuideAvailable(guide: Guide, fromDate: string, toDate: string): boolean {
    const requestFrom = new Date(fromDate);
    const requestTo = new Date(toDate);
    
    return guide.availableDates.some(dateRange => {
      const availableFrom = new Date(dateRange.from);
      const availableTo = new Date(dateRange.to);
      
      // Check if requested date range overlaps with available date range
      return requestFrom <= availableTo && requestTo >= availableFrom;
    });
  }
}

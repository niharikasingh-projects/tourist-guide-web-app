import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface TouristAttraction {
  id: string;
  name: string;
  location: string;
  country: string;
  city: string;
  description: string;
  imageUrl: string;
  rating: number;
  price?: number;
  duration?: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  private mockAttractions: any[] = [
    // Paris, France
    { id: 'pa-1', name: 'Eiffel Tower Tour', location: 'Paris', country: 'France', description: 'Visit the iconic Eiffel Tower with skip-the-line access and stunning views of Paris', imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400', rating: 4.8, price: 1200, duration: '3 hours', category: 'Landmark' },
    { id: 'pa-2', name: 'Louvre Museum Visit', location: 'Paris', country: 'France', description: 'Explore the world\'s largest art museum and see the Mona Lisa', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400', rating: 4.7, price: 850, duration: '4 hours', category: 'Museum' },
    { id: 'pa-3', name: 'Seine River Cruise', location: 'Paris', country: 'France', description: 'Romantic evening cruise along the Seine with dinner included', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', rating: 4.6, price: 950, duration: '2 hours', category: 'Cruise' },
    
    // London, UK
    { id: 'lo-1', name: 'Big Ben & Parliament Tour', location: 'London', country: 'United Kingdom', description: 'Guided tour of the iconic clock tower and Houses of Parliament', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400', rating: 4.7, price: 750, duration: '2.5 hours', category: 'Landmark' },
    { id: 'lo-2', name: 'British Museum Experience', location: 'London', country: 'United Kingdom', description: 'Discover world history and culture at this renowned museum', imageUrl: 'https://images.unsplash.com/photo-1543942276-28e9dd24e716?w=400', rating: 4.8, price: 650, duration: '3 hours', category: 'Museum' },
    { id: 'lo-3', name: 'London Eye Flight', location: 'London', country: 'United Kingdom', description: 'Experience breathtaking 360-degree views from Europe\'s tallest Ferris wheel', imageUrl: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=400', rating: 4.5, price: 550, duration: '30 minutes', category: 'Attraction' },
    
    // New York, USA
    { id: 'ny-1', name: 'Statue of Liberty & Ellis Island', location: 'New York', country: 'United States', description: 'Ferry trip to Liberty Island with crown access and Ellis Island Immigration Museum', imageUrl: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=400', rating: 4.9, price: 1100, duration: '4 hours', category: 'Landmark' },
    { id: 'ny-2', name: 'Central Park Walking Tour', location: 'New York', country: 'United States', description: 'Explore NYC\'s most famous park with an expert local guide', imageUrl: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=400', rating: 4.6, price: 450, duration: '2 hours', category: 'Nature' },
    { id: 'ny-3', name: 'Empire State Building', location: 'New York', country: 'United States', description: 'Visit the iconic Art Deco skyscraper with observatory access', imageUrl: 'https://images.unsplash.com/photo-1546436836-07a91091f160?w=400', rating: 4.7, price: 800, duration: '2 hours', category: 'Landmark' },
    
    // Rome, Italy
    { id: 'ro-1', name: 'Colosseum & Roman Forum', location: 'Rome', country: 'Italy', description: 'Skip-the-line tour of ancient Rome\'s most iconic monuments', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400', rating: 4.9, price: 950, duration: '3 hours', category: 'Historical' },
    { id: 'ro-2', name: 'Vatican Museums & Sistine Chapel', location: 'Rome', country: 'Italy', description: 'Private tour of Vatican art collections and Michelangelo\'s masterpiece', imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400', rating: 4.8, price: 1050, duration: '4 hours', category: 'Museum' },
    { id: 'ro-3', name: 'Trevi Fountain Evening Walk', location: 'Rome', country: 'Italy', description: 'Romantic evening walking tour of Rome\'s beautiful fountains', imageUrl: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=400', rating: 4.5, price: 400, duration: '2 hours', category: 'Walking Tour' },
    
    // Tokyo, Japan
    { id: 'to-1', name: 'Mount Fuji Day Trip', location: 'Tokyo', country: 'Japan', description: 'Full day excursion to Japan\'s most sacred mountain', imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400', rating: 4.9, price: 1450, duration: '10 hours', category: 'Nature' },
    { id: 'to-2', name: 'Tokyo Street Food Tour', location: 'Tokyo', country: 'Japan', description: 'Taste authentic Japanese cuisine in local neighborhoods', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', rating: 4.7, price: 700, duration: '3 hours', category: 'Food Tour' },
    { id: 'to-3', name: 'Senso-ji Temple Visit', location: 'Tokyo', country: 'Japan', description: 'Explore Tokyo\'s oldest and most significant Buddhist temple', imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400', rating: 4.6, price: 500, duration: '2 hours', category: 'Temple' },    

    // Dubai, UAE
    { id: 'du-1', name: 'Burj Khalifa At The Top', location: 'Dubai', country: 'United Arab Emirates', description: 'Visit the world\'s tallest building with observation deck access', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400', rating: 4.9, price: 140, duration: '2 hours', category: 'Landmark' },
    { id: 'du-2', name: 'Desert Safari Experience', location: 'Dubai', country: 'United Arab Emirates', description: 'Dune bashing, camel ride, and traditional Bedouin dinner', imageUrl: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=400', rating: 4.8, price: 1200, duration: '6 hours', category: 'Adventure' },
    { id: 'du-3', name: 'Dubai Marina Dhow Cruise', location: 'Dubai', country: 'United Arab Emirates', description: 'Luxury dinner cruise with stunning city views', imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400', rating: 4.6, price: 850, duration: '2 hours', category: 'Cruise' },
    
    // Delhi, India (10 attractions)
    { id: 'de-1', name: 'Red Fort & Old Delhi Tour', location: 'Delhi', country: 'India', description: 'Explore the magnificent Mughal fortress and bustling old city', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', rating: 4.7, price: 450, duration: '4 hours', category: 'Historical' },
    { id: 'de-2', name: 'Qutub Minar Complex', location: 'Delhi', country: 'India', description: 'Visit the UNESCO World Heritage site and tallest brick minaret', imageUrl: 'https://images.unsplash.com/photo-1596423150473-bffa16b82bcd?w=400', rating: 4.6, price: 350, duration: '2 hours', category: 'Monument' },
    { id: 'de-3', name: 'India Gate & Government Quarter', location: 'Delhi', country: 'India', description: 'Tour of Delhi\'s most iconic war memorial and administrative center', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', rating: 4.5, price: 300, duration: '2 hours', category: 'Landmark' },
    { id: 'de-4', name: 'Humayun\'s Tomb Experience', location: 'Delhi', country: 'India', description: 'Explore the stunning Mughal architecture and beautiful gardens', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', rating: 4.8, price: 400, duration: '2.5 hours', category: 'Monument' },
    { id: 'de-5', name: 'Lotus Temple Visit', location: 'Delhi', country: 'India', description: 'Experience peace at this unique Bahai House of Worship', imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400', rating: 4.6, price: 250, duration: '1.5 hours', category: 'Temple' },
    { id: 'de-6', name: 'Akshardham Temple Tour', location: 'Delhi', country: 'India', description: 'Marvel at the modern architectural wonder with light show', imageUrl: 'https://images.unsplash.com/photo-1601815023024-7b80ab8c0f0e?w=400', rating: 4.9, price: 500, duration: '3 hours', category: 'Temple' },
    { id: 'de-7', name: 'Chandni Chowk Food Walk', location: 'Delhi', country: 'India', description: 'Taste authentic street food in Old Delhi\'s famous market', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', rating: 4.7, price: 350, duration: '3 hours', category: 'Food Tour' },
    { id: 'de-8', name: 'Lodhi Garden Heritage Walk', location: 'Delhi', country: 'India', description: 'Peaceful walk through historical monuments and gardens', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', rating: 4.4, price: 200, duration: '2 hours', category: 'Nature' },
    { id: 'de-9', name: 'Hauz Khas Village Tour', location: 'Delhi', country: 'India', description: 'Explore trendy cafes and ancient ruins in hip neighborhood', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', rating: 4.5, price: 300, duration: '2.5 hours', category: 'Cultural' },
    { id: 'de-10', name: 'Jama Masjid & Rickshaw Ride', location: 'Delhi', country: 'India', description: 'Visit India\'s largest mosque with thrilling rickshaw ride', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', rating: 4.6, price: 400, duration: '3 hours', category: 'Religious' },
    
    // Agra, India (8 attractions)
    { id: 'ag-1', name: 'Taj Mahal Sunrise Tour', location: 'Agra', country: 'India', description: 'Witness the beauty of the Taj Mahal at sunrise with skip-the-line access', imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400', rating: 5.0, price: 550, duration: '3 hours', category: 'Monument' },
    { id: 'ag-2', name: 'Agra Fort Experience', location: 'Agra', country: 'India', description: 'Explore the massive red sandstone fort of the Mughal emperors', imageUrl: 'https://images.unsplash.com/photo-1609952181726-d7b8c66e58b5?w=400', rating: 4.7, price: 400, duration: '2.5 hours', category: 'Fort' },
    { id: 'ag-3', name: 'Mehtab Bagh Sunset View', location: 'Agra', country: 'India', description: 'View the Taj Mahal from across the Yamuna River at sunset', imageUrl: 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=400', rating: 4.8, price: 250, duration: '1.5 hours', category: 'Garden' },
    { id: 'ag-4', name: 'Fatehpur Sikri Day Trip', location: 'Agra', country: 'India', description: 'Visit the abandoned Mughal capital with stunning architecture', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', rating: 4.6, price: 500, duration: '4 hours', category: 'Historical' },
    { id: 'ag-5', name: 'Taj Mahal Night Viewing', location: 'Agra', country: 'India', description: 'Experience the Taj Mahal under moonlight (selected days)', imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400', rating: 4.9, price: 650, duration: '2 hours', category: 'Monument' },
    { id: 'ag-6', name: 'Agra Street Food Tour', location: 'Agra', country: 'India', description: 'Taste Agra\'s famous petha and other local delicacies', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', rating: 4.5, price: 300, duration: '2.5 hours', category: 'Food Tour' },
    { id: 'ag-7', name: 'Itmad-ud-Daulah Baby Taj', location: 'Agra', country: 'India', description: 'Discover the exquisite marble tomb and precursor to Taj Mahal', imageUrl: 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=400', rating: 4.4, price: 350, duration: '2 hours', category: 'Monument' },
    { id: 'ag-8', name: 'Mughal Heritage Walk', location: 'Agra', country: 'India', description: 'Comprehensive tour of Agra\'s Mughal-era monuments', imageUrl: 'https://images.unsplash.com/photo-1609952181726-d7b8c66e58b5?w=400', rating: 4.7, price: 700, duration: '6 hours', category: 'Historical' },
    
    // Jaipur, India (9 attractions)
    { id: 'ja-1', name: 'Amber Fort & Palace', location: 'Jaipur', country: 'India', description: 'Majestic hilltop fort with optional elephant ride', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', rating: 4.9, price: 600, duration: '3 hours', category: 'Fort' },
    { id: 'ja-2', name: 'City Palace & Hawa Mahal', location: 'Jaipur', country: 'India', description: 'Discover the royal residence and the iconic Palace of Winds', imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400', rating: 4.7, price: 500, duration: '3 hours', category: 'Palace' },
    { id: 'ja-3', name: 'Jaipur Night Market Tour', location: 'Jaipur', country: 'India', description: 'Experience vibrant bazaars and traditional Rajasthani shopping', imageUrl: 'https://images.unsplash.com/photo-1613395877781-ed8b6f8ff864?w=400', rating: 4.5, price: 350, duration: '2.5 hours', category: 'Shopping' },
    { id: 'ja-4', name: 'Jantar Mantar Observatory', location: 'Jaipur', country: 'India', description: 'Explore the world\'s largest stone astronomical instruments', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', rating: 4.6, price: 300, duration: '1.5 hours', category: 'Historical' },
    { id: 'ja-5', name: 'Nahargarh Fort Sunset', location: 'Jaipur', country: 'India', description: 'Watch sunset over Pink City from the Tiger Fort', imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400', rating: 4.8, price: 400, duration: '2 hours', category: 'Fort' },
    { id: 'ja-6', name: 'Jal Mahal Lake Palace', location: 'Jaipur', country: 'India', description: 'Photo stop at the stunning Water Palace in Man Sagar Lake', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', rating: 4.4, price: 250, duration: '1 hour', category: 'Palace' },
    { id: 'ja-7', name: 'Albert Hall Museum Tour', location: 'Jaipur', country: 'India', description: 'Discover Rajasthani art and artifacts in Indo-Saracenic building', imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400', rating: 4.5, price: 350, duration: '2 hours', category: 'Museum' },
    { id: 'ja-8', name: 'Rajasthani Cultural Evening', location: 'Jaipur', country: 'India', description: 'Traditional dance, music, and dinner at Chokhi Dhani village', imageUrl: 'https://images.unsplash.com/photo-1613395877781-ed8b6f8ff864?w=400', rating: 4.9, price: 750, duration: '4 hours', category: 'Cultural' },
    { id: 'ja-9', name: 'Jaipur Photography Walk', location: 'Jaipur', country: 'India', description: 'Capture the Pink City\'s colorful streets and architecture', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', rating: 4.6, price: 450, duration: '3 hours', category: 'Photography' },
    
    // Mumbai, India (10 attractions)
    { id: 'mu-1', name: 'Gateway of India & Boat Tour', location: 'Mumbai', country: 'India', description: 'Iconic arch monument with Elephanta Caves boat excursion', imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400', rating: 4.6, price: 550, duration: '5 hours', category: 'Landmark' },
    { id: 'mu-2', name: 'Bollywood Studio Tour', location: 'Mumbai', country: 'India', description: 'Behind-the-scenes look at India\'s famous film industry', imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400', rating: 4.8, price: 700, duration: '4 hours', category: 'Entertainment' },
    { id: 'mu-3', name: 'Marine Drive Sunset Walk', location: 'Mumbai', country: 'India', description: 'Scenic promenade walk along the Arabian Sea', imageUrl: 'https://images.unsplash.com/photo-1595659393187-ff5bc1448e6f?w=400', rating: 4.4, price: 200, duration: '1.5 hours', category: 'Walking Tour' },
    // { id: 'mu-4', name: 'Dharavi Slum Tour', location: 'Mumbai', country: 'India', description: 'Eye-opening community tour with local guide', imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400', rating: 4.7, price: 40, duration: '2.5 hours', category: 'Cultural' },
    { id: 'mu-5', name: 'Crawford Market Food Walk', location: 'Mumbai', country: 'India', description: 'Taste Mumbai\'s famous street food and shop local markets', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', rating: 4.6, price: 350, duration: '3 hours', category: 'Food Tour' },
    { id: 'mu-6', name: 'Hanging Gardens & Malabar Hill', location: 'Mumbai', country: 'India', description: 'Visit terraced gardens with panoramic city views', imageUrl: 'https://images.unsplash.com/photo-1595659393187-ff5bc1448e6f?w=400', rating: 4.3, price: 250, duration: '2 hours', category: 'Nature' },
    { id: 'mu-7', name: 'Siddhivinayak Temple Visit', location: 'Mumbai', country: 'India', description: 'Experience Mumbai\'s most famous Hindu temple', imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400', rating: 4.5, price: 200, duration: '1.5 hours', category: 'Religious' },
    { id: 'mu-8', name: 'Colaba Causeway Shopping', location: 'Mumbai', country: 'India', description: 'Shop for souvenirs and bargains in busy street market', imageUrl: 'https://images.unsplash.com/photo-1595659393187-ff5bc1448e6f?w=400', rating: 4.4, price: 300, duration: '2.5 hours', category: 'Shopping' },
    { id: 'mu-9', name: 'Haji Ali Dargah Tour', location: 'Mumbai', country: 'India', description: 'Visit the mosque on an islet in the Arabian Sea', imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400', rating: 4.6, price: 250, duration: '2 hours', category: 'Religious' },
    { id: 'mu-10', name: 'Mumbai Heritage Architecture Walk', location: 'Mumbai', country: 'India', description: 'Explore Victorian Gothic and Art Deco buildings', imageUrl: 'https://images.unsplash.com/photo-1595659393187-ff5bc1448e6f?w=400', rating: 4.7, price: 450, duration: '3 hours', category: 'Historical' },
    
    // Goa, India (8 attractions)
    { id: 'go-1', name: 'Baga Beach Water Sports', location: 'Goa', country: 'India', description: 'Parasailing, jet skiing, and banana boat rides', imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', rating: 4.7, price: 650, duration: '3 hours', category: 'Adventure' },
    { id: 'go-2', name: 'Old Goa Church Tour', location: 'Goa', country: 'India', description: 'Visit historic Portuguese churches and Basilica of Bom Jesus', imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400', rating: 4.6, price: 400, duration: '3 hours', category: 'Heritage' },
    { id: 'go-3', name: 'Spice Plantation Tour', location: 'Goa', country: 'India', description: 'Explore organic spice farms with traditional lunch', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b52e87279e?w=400', rating: 4.8, price: 550, duration: '4 hours', category: 'Nature' },
    { id: 'go-4', name: 'Dudhsagar Waterfalls Trip', location: 'Goa', country: 'India', description: 'Visit India\'s tallest waterfall with jeep safari', imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', rating: 4.9, price: 800, duration: '6 hours', category: 'Nature' },
    { id: 'go-5', name: 'Goa Night Market', location: 'Goa', country: 'India', description: 'Shop at Anjuna or Arpora flea market with live music', imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400', rating: 4.5, price: 300, duration: '3 hours', category: 'Shopping' },
    { id: 'go-6', name: 'Sunset Cruise on Mandovi River', location: 'Goa', country: 'India', description: 'Evening cruise with Goan folk performances', imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', rating: 4.6, price: 500, duration: '2 hours', category: 'Cruise' },
    { id: 'go-7', name: 'Scuba Diving Experience', location: 'Goa', country: 'India', description: 'Discover underwater marine life at Grande Island', imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', rating: 4.8, price: 950, duration: '4 hours', category: 'Adventure' },
    { id: 'go-8', name: 'Goan Cooking Class', location: 'Goa', country: 'India', description: 'Learn to prepare authentic Goan seafood dishes', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b52e87279e?w=400', rating: 4.7, price: 600, duration: '3 hours', category: 'Food Tour' },
    
    // Kerala, India (7 attractions)
    { id: 'ke-1', name: 'Backwaters Houseboat Cruise', location: 'Kerala', country: 'India', description: 'Overnight stay on traditional kettuvallam houseboat', imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400', rating: 4.9, price: 1200, duration: '24 hours', category: 'Nature' },
    { id: 'ke-2', name: 'Munnar Tea Plantation Tour', location: 'Kerala', country: 'India', description: 'Explore lush tea gardens and learn about tea processing', imageUrl: 'https://images.unsplash.com/photo-1564525943084-a8e046971a94?w=400', rating: 4.7, price: 550, duration: '4 hours', category: 'Nature' },
    { id: 'ke-3', name: 'Kathakali Dance Performance', location: 'Kerala', country: 'India', description: 'Watch traditional Kerala classical dance with makeup demo', imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400', rating: 4.6, price: 400, duration: '2 hours', category: 'Cultural' },
    { id: 'ke-4', name: 'Ayurvedic Spa Experience', location: 'Kerala', country: 'India', description: 'Rejuvenate with traditional Kerala massage therapy', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400', rating: 4.8, price: 700, duration: '2.5 hours', category: 'Wellness' },
    { id: 'ke-5', name: 'Periyar Wildlife Sanctuary', location: 'Kerala', country: 'India', description: 'Boat safari to spot elephants and exotic birds', imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400', rating: 4.7, price: 650, duration: '5 hours', category: 'Wildlife' },
    { id: 'ke-6', name: 'Fort Kochi Heritage Walk', location: 'Kerala', country: 'India', description: 'Explore colonial architecture and Chinese fishing nets', imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400', rating: 4.5, price: 350, duration: '3 hours', category: 'Historical' },
    { id: 'ke-7', name: 'Kerala Cooking Class', location: 'Kerala', country: 'India', description: 'Learn to make authentic Kerala cuisine with local chef', imageUrl: 'https://images.unsplash.com/photo-1564525943084-a8e046971a94?w=400', rating: 4.6, price: 500, duration: '3 hours', category: 'Food Tour' },
    
    // Udaipur, India (7 attractions)
    { id: 'ud-1', name: 'City Palace Udaipur', location: 'Udaipur', country: 'India', description: 'Explore the grand lakeside palace complex', imageUrl: 'https://images.unsplash.com/photo-1597103693120-04b75ba6f74c?w=400', rating: 4.8, price: 550, duration: '3 hours', category: 'Palace' },
    { id: 'ud-2', name: 'Lake Pichola Boat Ride', location: 'Udaipur', country: 'India', description: 'Sunset cruise with views of Lake Palace and City Palace', imageUrl: 'https://images.unsplash.com/photo-1597103693120-04b75ba6f74c?w=400', rating: 4.9, price: 450, duration: '1.5 hours', category: 'Nature' },
    { id: 'ud-3', name: 'Jag Mandir Island Palace', location: 'Udaipur', country: 'India', description: 'Visit the stunning marble palace on Lake Pichola', imageUrl: 'https://images.unsplash.com/photo-1597103693120-04b75ba6f74c?w=400', rating: 4.7, price: 400, duration: '2 hours', category: 'Palace' },
    { id: 'ud-4', name: 'Sajjangarh Monsoon Palace', location: 'Udaipur', country: 'India', description: 'Watch sunset from hilltop palace overlooking Udaipur', imageUrl: 'https://images.unsplash.com/photo-1597103693120-04b75ba6f74c?w=400', rating: 4.6, price: 350, duration: '2 hours', category: 'Palace' },
    { id: 'ud-5', name: 'Bagore Ki Haveli Cultural Show', location: 'Udaipur', country: 'India', description: 'Evening folk dance and music performance', imageUrl: 'https://images.unsplash.com/photo-1597103693120-04b75ba6f74c?w=400', rating: 4.5, price: 300, duration: '1.5 hours', category: 'Cultural' },
    { id: 'ud-6', name: 'Udaipur Old City Walking Tour', location: 'Udaipur', country: 'India', description: 'Explore narrow streets, temples, and local markets', imageUrl: 'https://images.unsplash.com/photo-1597103693120-04b75ba6f74c?w=400', rating: 4.4, price: 250, duration: '2.5 hours', category: 'Walking Tour' },
    { id: 'ud-7', name: 'Vintage Car Museum Visit', location: 'Udaipur', country: 'India', description: 'See the royal family\'s classic car collection', imageUrl: 'https://images.unsplash.com/photo-1597103693120-04b75ba6f74c?w=400', rating: 4.3, price: 300, duration: '1.5 hours', category: 'Museum' },
    
    // Varanasi, India (7 attractions)
    { id: 'va-1', name: 'Ganges Sunrise Boat Ride', location: 'Varanasi', country: 'India', description: 'Witness morning prayers and rituals on the holy river', imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400', rating: 5.0, price: 400, duration: '2 hours', category: 'Religious' },
    { id: 'va-2', name: 'Evening Ganga Aarti Ceremony', location: 'Varanasi', country: 'India', description: 'Experience the mesmerizing fire prayer ritual at Dashashwamedh Ghat', imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400', rating: 4.9, price: 300, duration: '1.5 hours', category: 'Religious' },
    { id: 'va-3', name: 'Sarnath Buddhist Tour', location: 'Varanasi', country: 'India', description: 'Visit where Buddha gave his first sermon', imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400', rating: 4.7, price: 450, duration: '3 hours', category: 'Historical' },
    { id: 'va-4', name: 'Old Varanasi Walking Tour', location: 'Varanasi', country: 'India', description: 'Navigate ancient lanes and hidden temples', imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400', rating: 4.6, price: 350, duration: '3 hours', category: 'Walking Tour' },
    { id: 'va-5', name: 'Varanasi Street Food Tour', location: 'Varanasi', country: 'India', description: 'Taste famous Banarasi chaat and sweets', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', rating: 4.8, price: 400, duration: '2.5 hours', category: 'Food Tour' },
    { id: 'va-6', name: 'Silk Weaving Workshop Visit', location: 'Varanasi', country: 'India', description: 'See traditional Banarasi silk saree making', imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400', rating: 4.5, price: 300, duration: '2 hours', category: 'Cultural' },
    { id: 'va-7', name: 'Yoga & Meditation Session', location: 'Varanasi', country: 'India', description: 'Morning yoga class by the Ganges', imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400', rating: 4.7, price: 350, duration: '2 hours', category: 'Wellness' },
    
    // Rishikesh, India (7 attractions)
    { id: 'ri-1', name: 'White Water Rafting Adventure', location: 'Rishikesh', country: 'India', description: 'Thrilling rapids experience on the Ganges River', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', rating: 4.9, price: 750, duration: '3 hours', category: 'Adventure' },
    { id: 'ri-2', name: 'Laxman Jhula & Ram Jhula Tour', location: 'Rishikesh', country: 'India', description: 'Walk across iconic suspension bridges', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', rating: 4.6, price: 250, duration: '2 hours', category: 'Landmark' },
    { id: 'ri-3', name: 'Yoga & Meditation Retreat', location: 'Rishikesh', country: 'India', description: 'Full-day wellness experience at ashram', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', rating: 4.8, price: 600, duration: '6 hours', category: 'Wellness' },
    { id: 'ri-4', name: 'Beatles Ashram Visit', location: 'Rishikesh', country: 'India', description: 'Explore the abandoned ashram with graffiti art', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', rating: 4.5, price: 300, duration: '1.5 hours', category: 'Historical' },
    { id: 'ri-5', name: 'Bungee Jumping Experience', location: 'Rishikesh', country: 'India', description: 'India\'s highest bungee jump at 83 meters', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', rating: 4.9, price: 1200, duration: '2 hours', category: 'Adventure' },
    { id: 'ri-6', name: 'Evening Ganga Aarti at Parmarth Niketan', location: 'Rishikesh', country: 'India', description: 'Spiritual prayer ceremony by the river', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', rating: 4.7, price: 200, duration: '1 hour', category: 'Religious' },
    { id: 'ri-7', name: 'Neer Garh Waterfall Trek', location: 'Rishikesh', country: 'India', description: 'Scenic hike to refreshing natural waterfall', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', rating: 4.6, price: 350, duration: '3 hours', category: 'Nature' },
    
    // Bangalore, India (7 attractions)
    { id: 'ba-1', name: 'Lalbagh Botanical Garden', location: 'Bangalore', country: 'India', description: 'Explore 240 acres of diverse plants and historic glass house', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b52e87279e?w=400', rating: 4.5, price: 200, duration: '2 hours', category: 'Nature' },
    { id: 'ba-2', name: 'Bangalore Palace Tour', location: 'Bangalore', country: 'India', description: 'Visit the Tudor-style royal palace with audio guide', imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400', rating: 4.6, price: 450, duration: '2 hours', category: 'Palace' },
    { id: 'ba-3', name: 'Cubbon Park Morning Walk', location: 'Bangalore', country: 'India', description: 'Peaceful stroll through the city\'s green lung', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b52e87279e?w=400', rating: 4.3, price: 150, duration: '1.5 hours', category: 'Nature' },
    { id: 'ba-4', name: 'ISKCON Temple Visit', location: 'Bangalore', country: 'India', description: 'Experience devotional atmosphere at Krishna temple', imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400', rating: 4.6, price: 250, duration: '2 hours', category: 'Religious' },
    { id: 'ba-5', name: 'Bangalore Brewery Tour', location: 'Bangalore', country: 'India', description: 'Visit India\'s craft beer capital with tastings', imageUrl: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=400', rating: 4.7, price: 550, duration: '3 hours', category: 'Food Tour' },
    { id: 'ba-6', name: 'Tipu Sultan Summer Palace', location: 'Bangalore', country: 'India', description: 'Explore the Indo-Islamic architecture masterpiece', imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400', rating: 4.4, price: 300, duration: '1.5 hours', category: 'Historical' },
    { id: 'ba-7', name: 'Commercial Street Shopping', location: 'Bangalore', country: 'India', description: 'Shop for clothes, jewelry, and local handicrafts', imageUrl: 'https://images.unsplash.com/photo-1613395877781-ed8b6f8ff864?w=400', rating: 4.2, price: 200, duration: '2.5 hours', category: 'Shopping' },
    
    // Pune, India (8 attractions)
    { id: 'pu-1', name: 'Shaniwar Wada Fort', location: 'Pune', country: 'India', description: 'Historic 18th-century Maratha Empire palace fortress', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', rating: 4.5, price: 300, duration: '2 hours', category: 'Historical' },
    { id: 'pu-2', name: 'Aga Khan Palace Tour', location: 'Pune', country: 'India', description: 'Visit Gandhi National Memorial and beautiful Italianate architecture', imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400', rating: 4.6, price: 350, duration: '2.5 hours', category: 'Historical' },
    { id: 'pu-3', name: 'Sinhagad Fort Trek', location: 'Pune', country: 'India', description: 'Thrilling trek to hilltop fort with panoramic views', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', rating: 4.8, price: 500, duration: '4 hours', category: 'Adventure' },
    { id: 'pu-4', name: 'Osho Ashram Experience', location: 'Pune', country: 'India', description: 'Meditation and spiritual wellness at famous international center', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', rating: 4.4, price: 400, duration: '3 hours', category: 'Wellness' },
    { id: 'pu-5', name: 'Dagdusheth Ganpati Temple', location: 'Pune', country: 'India', description: 'Visit one of India\'s most revered Ganesha temples', imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=400', rating: 4.7, price: 200, duration: '1.5 hours', category: 'Religious' },
    { id: 'pu-6', name: 'Raja Dinkar Kelkar Museum', location: 'Pune', country: 'India', description: 'Explore collection of 20,000 Indian artifacts and crafts', imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400', rating: 4.5, price: 250, duration: '2 hours', category: 'Museum' },
    { id: 'pu-7', name: 'FC Road Food Walk', location: 'Pune', country: 'India', description: 'Taste famous Puneri street food and local delicacies', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', rating: 4.6, price: 350, duration: '2.5 hours', category: 'Food Tour' },
    { id: 'pu-8', name: 'Parvati Hill Sunset Point', location: 'Pune', country: 'India', description: 'Climb to historic temples with stunning city views', imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400', rating: 4.3, price: 150, duration: '2 hours', category: 'Nature' },
  ];

  /**
   * Search for tourist attractions by location
   * @param location Location name to search for
   * @param fromDate Optional from date
   * @param toDate Optional to date
   * @returns Observable of tourist attractions
   */
  searchAttractionsByLocation(location: string, fromDate?: string, toDate?: string): Observable<TouristAttraction[]> {
    if (!location) {
      return of([]);
    }

    let url = `${this.apiUrl}/attractions/search?location=${encodeURIComponent(location)}`;
    if (fromDate) {
      url += `&fromDate=${fromDate}`;
    }
    if (toDate) {
      url += `&toDate=${toDate}`;
    }

    return this.http.get<TouristAttraction[]>(url).pipe(
      catchError(() => {
        // Fallback to mock data if API fails
        console.warn('API call failed, using mock data');
        const normalizedLocation = location.toLowerCase().trim();
        const results = this.mockAttractions.filter(attraction => 
          attraction.location.toLowerCase() === normalizedLocation ||
          attraction.name.toLowerCase().includes(normalizedLocation)
        );
        return of(results).pipe(delay(200));
      })
    );
  }

  /**
   * Get all attractions
   * @returns Observable of all tourist attractions
   */
  getAllAttractions(): Observable<TouristAttraction[]> {
    return this.http.get<TouristAttraction[]>(`${this.apiUrl}/attractions`).pipe(
      catchError(() => {
        console.warn('API call failed, using mock data');
        return of(this.mockAttractions);
      })
    );
  }

  /**
   * Get attraction by ID
   * @param id Attraction ID
   * @returns Observable of tourist attraction or null
   */
  getAttractionById(id: string): Observable<TouristAttraction | null> {
    return this.http.get<TouristAttraction>(`${this.apiUrl}/attractions/${id}`).pipe(
      catchError(() => {
        console.warn('API call failed, using mock data');
        const attraction = this.mockAttractions.find(a => a.id === id);
        return of(attraction || null);
      })
    );
  }
}

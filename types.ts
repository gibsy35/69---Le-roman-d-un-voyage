export interface Chapter {
  id: string;
  title: string;
  date: string;
  location: string;
  country: string;
  anecdote: string;
  illustrated: string; // url or placeholder description
  stats: {
    distance?: number; // km
    flightHours?: number;
    iconicPlace: string;
  };
}

export interface BookOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  bookFormat: 'printed' | 'hardcover' | 'pdf';
  price: number;
  date: string;
  status: 'pending' | 'shipped';
  carrier?: string;
  trackingNumber?: string;
  weightGrams?: number;
  packaging?: string;
  shippingCost?: number;
  destinationCountry?: string;
  dedicationRequest?: string;
}

export interface SocialPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  content: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledDate: string;
}

export interface AdCampaign {
  id: string;
  title: string;
  audience: string;
  budget: number; // daily in €
  status: 'active' | 'paused' | 'draft';
  clicks: number;
  impressions: number;
  conversions: number;
  adText: string;
}

export interface LuggageItem {
  id: string;
  name: string;
  weight: number; // kg
  category: 'soute' | 'cabine' | 'perso';
}

export interface BookConfig {
  coverImageUrl: string;
  coverBorderColor: string;
  authorName: string;
  bookTitle: string;
  bookSubtitle: string;
  topBadge: string;
  bottomLine: string;
  backQuote: string;
  backAboutTitle: string;
  backAboutSubtitle: string;
  backAboutContent: string;
}

export interface GuestbookMessage {
  id: string;
  name: string;
  message: string;
  location: string;
  date: string;
}


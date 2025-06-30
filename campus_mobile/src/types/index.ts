// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  profile_picture?: string;
  bio?: string;
  location?: string;
  instagram?: string;
  linkedin?: string;
  snapchat?: string;
  created_at: string;
  is_email_verified: boolean;
}

// Listing Types
export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string;
  image?: string;
  seller: User;
  created_at: string;
}

// Chat Types
export interface Chat {
  id: number;
  participants: User[];
  last_message?: Message;
  created_at: string;
  updated_at: string;
  unread_count?: number;
}

export interface Message {
  id: number;
  content: string;
  sender: User;
  chat: number;
  created_at: string;
  is_read: boolean;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  message?: string;
  access_token?: string;
  refresh_token?: string;
  user: User;
}

// API Response Types
export interface ListingResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Listing[];
}

export interface UserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

// Navigation Types
export type RootStackParamList = {
  Welcome: undefined;
  SignIn: { returnTo?: string } | undefined;
  SignUp: { returnTo?: string } | undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  ListingDetail: { id: number };
  PostListing: undefined;
  EditListing: { id: number };
  ChatDetail: { chatId: number; otherUser?: User };
  Profile: { userId?: number };
  EditProfile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Marketplace: undefined;
  Messages: undefined;
  Board: undefined;
  Profile: undefined;
};

// Form types
export interface ListingFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition?: string;
  image?: string;
}

export interface ProfileFormData {
  name: string;
  bio?: string;
  location?: string;
  instagram?: string;
  linkedin?: string;
  snapchat?: string;
  profile_picture?: string;
} 
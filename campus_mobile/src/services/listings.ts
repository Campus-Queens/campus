import API from './api';
import { Listing, ListingResponse } from '../types';

export const listingsService = {
  // Get all listings with pagination
  async getListings(page: number = 1): Promise<ListingResponse> {
    try {
      console.log('Fetching listings from:', `${API.defaults.baseURL}/listings/`);
      const response = await API.get(`/listings/?page=${page}`);
      console.log('Listings response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch listings');
    }
  },

  // Get a single listing by ID
  async getListing(id: string): Promise<Listing> {
    try {
      console.log('Fetching listing:', id);
      const response = await API.get(`/listings/${id}/`);
      console.log('Listing response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching listing:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch listing');
    }
  },

  // Create a new listing
  async createListing(listingData: Partial<Listing>): Promise<Listing> {
    try {
      console.log('Creating listing:', listingData);
      const response = await API.post('/listings/', listingData);
      console.log('Create listing response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating listing:', error);
      throw new Error(error.response?.data?.message || 'Failed to create listing');
    }
  },

  // Update a listing
  async updateListing(id: string, listingData: Partial<Listing>): Promise<Listing> {
    try {
      console.log('Updating listing:', id, listingData);
      const response = await API.put(`/listings/${id}/`, listingData);
      console.log('Update listing response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating listing:', error);
      throw new Error(error.response?.data?.message || 'Failed to update listing');
    }
  },

  // Delete a listing
  async deleteListing(id: string): Promise<void> {
    try {
      console.log('Deleting listing:', id);
      await API.delete(`/listings/${id}/`);
      console.log('Listing deleted successfully');
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete listing');
    }
  },

  // Search listings
  async searchListings(query: string, category?: string): Promise<ListingResponse> {
    try {
      console.log('Searching listings:', { query, category });
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (category) params.append('category', category);
      
      const response = await API.get(`/listings/?${params.toString()}`);
      console.log('Search response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error searching listings:', error);
      throw new Error(error.response?.data?.message || 'Failed to search listings');
    }
  },

  // Get listings by category
  async getListingsByCategory(category: string): Promise<ListingResponse> {
    try {
      console.log('Fetching listings by category:', category);
      const response = await API.get(`/listings/?category=${category}`);
      console.log('Category listings response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching category listings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch category listings');
    }
  },

  // Get user's listings
  async getUserListings(): Promise<ListingResponse> {
    try {
      console.log('Fetching user listings');
      const response = await API.get('/listings/my-listings/');
      console.log('User listings response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user listings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user listings');
    }
  },

  // Save/unsave a listing
  async toggleSaveListing(listingId: string): Promise<void> {
    try {
      console.log('Toggling save for listing:', listingId);
      await API.post(`/listings/${listingId}/save/`);
      console.log('Save toggled successfully');
    } catch (error: any) {
      console.error('Error toggling save:', error);
      throw new Error(error.response?.data?.message || 'Failed to save listing');
    }
  },

  // Get saved listings
  async getSavedListings(): Promise<ListingResponse> {
    try {
      console.log('Fetching saved listings');
      const response = await API.get('/listings/saved/');
      console.log('Saved listings response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching saved listings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch saved listings');
    }
  }
}; 
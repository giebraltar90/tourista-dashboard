
import { VentrataToursResponse, VentrataBookingsResponse, VentrataTour } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/TourCard";

// Ventrata API configuration
const API_BASE_URL = "https://api.ventrata.com/v1"; // Replace with actual Ventrata API URL
const API_KEY = "your-ventrata-api-key"; // This should be stored securely in production

// API headers
const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_KEY}`,
};

/**
 * Fetch tours from Ventrata API
 */
export const fetchTours = async (params?: { 
  startDate?: string; 
  endDate?: string;
  location?: string;
}): Promise<TourCardProps[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.location) queryParams.append("location", params.location);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    const response = await fetch(`${API_BASE_URL}/tours${queryString}`, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Ventrata API error: ${response.status}`);
    }
    
    const data: VentrataToursResponse = await response.json();
    
    // Transform the API response to match our TourCardProps structure
    return data.data.map(tour => ({
      id: tour.id,
      date: new Date(tour.date),
      location: tour.location,
      tourName: tour.tourName,
      tourType: tour.tourType,
      startTime: tour.startTime,
      referenceCode: tour.referenceCode,
      guide1: tour.guide1,
      guide2: tour.guide2,
      tourGroups: tour.tourGroups,
      numTickets: tour.numTickets
    }));
  } catch (error) {
    console.error("Error fetching tours from Ventrata:", error);
    // In case of API failure, return mock data as fallback
    return [];
  }
};

/**
 * Fetch a single tour by ID
 */
export const fetchTourById = async (tourId: string): Promise<TourCardProps | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Ventrata API error: ${response.status}`);
    }
    
    const tour: VentrataTour = await response.json();
    
    return {
      id: tour.id,
      date: new Date(tour.date),
      location: tour.location,
      tourName: tour.tourName,
      tourType: tour.tourType,
      startTime: tour.startTime,
      referenceCode: tour.referenceCode,
      guide1: tour.guide1,
      guide2: tour.guide2,
      tourGroups: tour.tourGroups,
      numTickets: tour.numTickets
    };
  } catch (error) {
    console.error(`Error fetching tour ${tourId} from Ventrata:`, error);
    return null;
  }
};

/**
 * Fetch bookings for a specific tour
 */
export const fetchBookingsForTour = async (tourId: string): Promise<VentrataBookingsResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings?tourId=${tourId}`, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Ventrata API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching bookings for tour ${tourId}:`, error);
    return null;
  }
};

/**
 * Update a tour group (e.g., move participants between groups)
 */
export const updateTourGroups = async (
  tourId: string, 
  updatedGroups: any
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tours/${tourId}/groups`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ groups: updatedGroups }),
    });
    
    return response.ok;
  } catch (error) {
    console.error(`Error updating tour ${tourId} groups:`, error);
    return false;
  }
};

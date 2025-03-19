
import { VentrataTour, VentrataTourGroup, TourModification } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { mockTours } from "@/data/mockData";
import { API_BASE_URL, headers } from "./apiConfig";

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
      console.log("API error, using mock data instead");
      return mockTours;
    }
    
    const data = await response.json();
    
    // Transform the API response to match our TourCardProps structure
    return transformTours(data);
  } catch (error) {
    console.error("Error fetching tours from Ventrata:", error);
    // In case of API failure, return mock data as fallback
    return mockTours;
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
      console.log(`API error for tour ${tourId}, using mock data instead`);
      return mockTours.find(tour => tour.id === tourId) || null;
    }
    
    const tour: VentrataTour = await response.json();
    
    return {
      id: tour.id,
      date: new Date(tour.date),  // Convert string to Date
      location: tour.location,
      tourName: tour.tourName,
      tourType: tour.tourType,
      startTime: tour.startTime,
      referenceCode: tour.referenceCode,
      guide1: tour.guide1,
      guide2: tour.guide2,
      guide3: tour.guide3,
      tourGroups: tour.tourGroups,
      numTickets: tour.numTickets,
      isHighSeason: tour.isHighSeason
    };
  } catch (error) {
    console.error(`Error fetching tour ${tourId} from Ventrata:`, error);
    // Return mock data as fallback
    return mockTours.find(tour => tour.id === tourId) || null;
  }
};

/**
 * Update tour groups (e.g., move participants between groups)
 */
export const updateTourGroups = async (
  tourId: string, 
  updatedGroups: VentrataTourGroup[]
): Promise<boolean> => {
  try {
    // For demo purposes, simulate an API call with a success response
    console.log(`Updating groups for tour ${tourId}`, updatedGroups);
    
    // Mock success response for development
    return true;
  } catch (error) {
    console.error(`Error updating tour ${tourId} groups:`, error);
    throw error;
  }
};

/**
 * Update tour capacity settings (e.g., toggle high season mode)
 */
export const updateTourCapacity = async (
  tourId: string,
  updatedTour: VentrataTour
): Promise<boolean> => {
  try {
    console.log(`Updating tour capacity for tour ${tourId}`, updatedTour);
    
    // Mock success response for development
    return true;
  } catch (error) {
    console.error(`Error updating tour ${tourId} capacity:`, error);
    throw error;
  }
};

/**
 * Update tour modifications
 */
export const updateTourModification = async (
  tourId: string,
  modifications: TourModification[]
): Promise<boolean> => {
  try {
    console.log(`Updating modifications for tour ${tourId}`, modifications);
    
    // Mock success response for development
    return true;
  } catch (error) {
    console.error(`Error updating tour ${tourId} modifications:`, error);
    throw error;
  }
};

// Helper function to convert API response to our app's data structure
const transformTours = (response: any): TourCardProps[] => {
  return response.data.map((tour: any) => ({
    id: tour.id,
    date: new Date(tour.date), 
    location: tour.location,
    tourName: tour.tourName,
    tourType: tour.tourType,
    startTime: tour.startTime,
    referenceCode: tour.referenceCode,
    guide1: tour.guide1,
    guide2: tour.guide2,
    guide3: tour.guide3,
    tourGroups: tour.tourGroups,
    numTickets: tour.numTickets,
    isHighSeason: Boolean(tour.isHighSeason)
  }));
};

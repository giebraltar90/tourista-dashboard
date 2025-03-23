
import { VentrataTour } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { mockTours } from "@/data/mockData";
import { headers, buildApiUrl, handleApiError } from "../apiConfig";

/**
 * Fetch a single tour from API
 */
export const fetchTourFromAPI = async (tourId: string): Promise<TourCardProps | null> => {
  if (!tourId) {
    console.error("fetchTourFromAPI called with empty tourId");
    return null;
  }

  try {
    // Use the buildApiUrl helper to create the URL
    const url = buildApiUrl(`tours/${tourId}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      console.log(`API error (${response.status}) for tour ${tourId}, using mock data instead`);
      const mockTour = mockTours.find(tour => tour.id === tourId);
      
      if (mockTour && !mockTour.modifications) {
        mockTour.modifications = []; // Ensure modifications exists
      }
      
      return mockTour || null;
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
      guide3: tour.guide3,
      tourGroups: tour.tourGroups,
      numTickets: tour.numTickets,
      isHighSeason: Boolean(tour.isHighSeason),
      modifications: tour.modifications || [] // Ensure modifications is included
    };
  } catch (error) {
    handleApiError(error, `tours/${tourId}`);
    console.log("Falling back to mock data due to API error");
    
    // Return mock data as fallback
    const mockTour = mockTours.find(tour => tour.id === tourId);
      
    if (mockTour && !mockTour.modifications) {
      mockTour.modifications = []; // Ensure modifications exists
    }
    
    return mockTour || null;
  }
};

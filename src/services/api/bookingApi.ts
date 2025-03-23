
import { VentrataBookingsResponse } from "@/types/ventrata";
import { headers, buildApiUrl, handleApiError } from "./apiConfig";

/**
 * Fetch bookings for a specific tour
 */
export const fetchBookingsForTour = async (tourId: string): Promise<VentrataBookingsResponse | null> => {
  if (!tourId) {
    console.error("fetchBookingsForTour called with empty tourId");
    return null;
  }

  try {
    // Use the buildApiUrl helper to create the URL
    const url = buildApiUrl('bookings', { tourId });
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Ventrata API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error, 'bookings');
    console.error(`Error fetching bookings for tour ${tourId}:`, error);
    return null;
  }
};

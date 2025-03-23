
import { TourCardProps } from "@/components/tours/tour-card/types";
import { mockTours } from "@/data/mockData";
import { API_BASE_URL, headers, buildApiUrl, handleApiError } from "../apiConfig";
import { transformTours } from "@/hooks/tourData/helpers";

/**
 * Fetch tours from API
 */
export const fetchToursFromAPI = async (params?: {
  startDate?: string;
  endDate?: string;
  location?: string;
}): Promise<TourCardProps[]> => {
  try {
    // Use the buildApiUrl helper to create the URL
    const url = buildApiUrl('tours', params as Record<string, string>);
    
    const response = await fetch(url, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      console.log(`API error (${response.status}) fetching tours, using mock data instead`);
      return mockTours;
    }
    
    const data = await response.json();
    
    // Transform the API response to match our TourCardProps structure
    return transformTours(data);
  } catch (error) {
    handleApiError(error, 'tours');
    console.log("Falling back to mock data due to API error");
    // In case of API failure, return mock data as fallback
    return mockTours;
  }
};

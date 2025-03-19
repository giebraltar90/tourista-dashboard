
import { useQuery } from "@tanstack/react-query";
import { VentrataToursResponse } from "@/types/ventrata";
import { fetchTours } from "@/services/ventrataApi";
import { TourCardProps } from "@/components/tours/TourCard";
import { mockTours } from "@/data/mockData";

// Define the options type for the useTours hook
interface UseToursOptions {
  enabled?: boolean;
}

export const useTours = (options: UseToursOptions = {}) => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async (): Promise<TourCardProps[]> => {
      // In a real app, we would call the API and transform the response:
      // const response = await fetchTours();
      // return transformTours(response);
      
      // For now, we're using mock data
      return mockTours;
    },
    // Pass through any options provided
    ...options,
  });
};

// Function to convert API response to our app's data structure
const transformTours = (response: VentrataToursResponse): TourCardProps[] => {
  return response.data.map(tour => ({
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
};

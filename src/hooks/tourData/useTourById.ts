
import { useQuery } from '@tanstack/react-query';
import { fetchTourById } from '@/services/api/tourApi';
import { TourCardProps } from '@/components/tours/tour-card/types';

/**
 * Custom hook to fetch tour data by ID with improved error handling
 */
export const useTourById = (tourId: string) => {
  return useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      // Guard against empty tour IDs
      if (!tourId) {
        console.error('useTourById called with empty tourId');
        return null;
      }
      
      try {
        const tourData = await fetchTourById(tourId);
        
        // Normalize the tour data to ensure all properties exist
        if (tourData) {
          const normalizedTour: TourCardProps = {
            id: tourData.id || tourId,
            date: tourData.date instanceof Date ? tourData.date : new Date(),
            location: tourData.location || "",
            tourName: tourData.tourName || "",
            tourType: tourData.tourType || "default",
            startTime: tourData.startTime || "",
            referenceCode: tourData.referenceCode || "",
            guide1: tourData.guide1 || "",
            guide2: tourData.guide2 || "",
            guide3: tourData.guide3 || "",
            tourGroups: Array.isArray(tourData.tourGroups) ? tourData.tourGroups.map(group => ({
              id: group.id || "",
              name: group.name || "",
              size: group.size || 0,
              entryTime: group.entryTime || "",
              guideId: group.guideId,
              childCount: group.childCount || 0,
              participants: Array.isArray(group.participants) ? group.participants : []
            })) : [],
            numTickets: tourData.numTickets || 0,
            isHighSeason: Boolean(tourData.isHighSeason),
            modifications: Array.isArray(tourData.modifications) ? tourData.modifications : []
          };
          
          return normalizedTour;
        }
        
        return null;
      } catch (error) {
        console.error(`Error in useTourById for tour ${tourId}:`, error);
        return null;
      }
    },
    enabled: !!tourId,
    staleTime: 30000, // Data becomes stale after 30 seconds
    gcTime: 300000, // Keep unused data in cache for 5 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: attemptIndex => Math.min(1000 * Math.pow(2, attemptIndex), 10000), // Exponential backoff
  });
};

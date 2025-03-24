
import { useQuery } from "@tanstack/react-query";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { fetchToursByGuideId } from "@/services/api/tour";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/**
 * Hook to fetch tours for a specific guide
 */
export const useGuideTours = () => {
  const { user, profile } = useAuth();
  const guideName = profile?.firstName || "Guide";
  
  return {
    ...useQuery({
      queryKey: ["guideTours", user?.id],
      queryFn: async (): Promise<TourCardProps[]> => {
        if (!user || !user.id) {
          return [];
        }
        
        try {
          const tours = await fetchToursByGuideId(user.id);
          return tours;
        } catch (error) {
          toast.error("Failed to load guide tours");
          throw error;
        }
      },
      enabled: !!user?.id,
      refetchOnWindowFocus: false,
      staleTime: 60000,
      meta: {
        guideName: guideName
      }
    }),
    guideName
  };
};

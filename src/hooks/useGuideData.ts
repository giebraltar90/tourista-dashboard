
import { useMemo } from "react";
import { useTours } from "./tourData/useTours";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { GuideInfo, GuideType } from "@/types/ventrata";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGuideData() {
  const { data, isLoading } = useQuery({
    queryKey: ['guides'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('guides')
          .select('*')
          .order('name');
          
        if (error) {
          console.error("Error fetching guides:", error);
          throw error;
        }
        
        return data.map(guide => ({
          id: guide.id,
          name: guide.name,
          birthday: new Date(guide.birthday),
          guideType: guide.guide_type as GuideType
        }));
      } catch (error) {
        console.error("Error in useGuideData:", error);
        return [];
      }
    }
  });
  
  const guides = useMemo(() => {
    return data || [];
  }, [data]);
  
  return { guides, isLoading };
}

export function useGuideInfo(guideName: string): GuideInfo | null {
  const { guides } = useGuideData();
  
  return useMemo(() => {
    if (!guideName) return null;
    
    const guide = guides.find(g => g.name === guideName);
    if (guide) return guide;
    
    // If not found by name, create a basic guide info object
    return {
      name: guideName,
      birthday: new Date(),
      guideType: "GA Free" as GuideType
    };
  }, [guides, guideName]);
}

export function useGuideTours() {
  const { data: allTours, isLoading, error } = useTours();
  const { guideView } = useRole();
  
  const guideName = guideView?.guideName || "";
  
  const guideTours = useMemo(() => {
    if (!allTours) return [];
    
    // Filter tours where the guide is either guide1 or guide2
    return allTours.filter(tour => 
      tour.guide1 === guideName || tour.guide2 === guideName || tour.guide3 === guideName
    );
  }, [allTours, guideName]);
  
  // If we're in guide view but there are no tours, show a notification
  useMemo(() => {
    if (guideView && allTours && !isLoading && guideTours.length === 0) {
      toast.info(`No tours found for guide: ${guideName}`);
    }
  }, [guideView, allTours, isLoading, guideTours.length, guideName]);
  
  return {
    data: guideTours,
    isLoading,
    error,
    guideName,
    guideInfo: useGuideInfo(guideName)
  };
}

// Helper function to determine if a guide needs a ticket based on tour location and guide type
export function doesGuideNeedTicket(guide: GuideInfo, tourLocation: string): boolean {
  // Only Versailles tours require special ticket handling for guides
  if (!tourLocation.toLowerCase().includes('versailles')) {
    return false;
  }
  
  // Based on guide type
  switch (guide.guideType) {
    case 'GA Ticket':
      return true; // Needs an adult ticket
    case 'GA Free':
      return true; // Needs a child ticket
    case 'GC':
      return false; // No ticket needed
    default:
      return false;
  }
}

// Helper function to get the type of ticket needed for a guide
export function getGuideTicketType(guide: GuideInfo): 'adult' | 'child' | null {
  switch (guide.guideType) {
    case 'GA Ticket':
      return 'adult'; // Needs an adult ticket
    case 'GA Free':
      return 'child'; // Needs a child ticket
    case 'GC':
    default:
      return null; // No ticket needed
  }
}

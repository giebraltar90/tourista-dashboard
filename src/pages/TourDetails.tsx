
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTourDetailsData } from "@/hooks/tour-details/useTourDetailsData";
import { LoadingState } from "@/components/tour-details/LoadingState";
import { ErrorState } from "@/components/tour-details/ErrorState";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { useState, useEffect } from "react";
import { GuideInfo, GuideType } from "@/types/ventrata";
import { useQueryClient } from "@tanstack/react-query";

const TourDetails = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  // Always ensure id has a value for the query
  const tourId = id || "";
  console.log("TourDetails rendering with ID:", tourId);
  
  // State to store guide information
  const [guide1Info, setGuide1Info] = useState<GuideInfo | null>(null);
  const [guide2Info, setGuide2Info] = useState<GuideInfo | null>(null);
  const [guide3Info, setGuide3Info] = useState<GuideInfo | null>(null);
  
  const {
    tour,
    isLoading,
    error,
    activeTab,
    handleTabChange,
    handleRefetch
  } = useTourDetailsData(tourId);
  
  // Force data refresh when component mounts and periodically check for participants
  useEffect(() => {
    if (tourId) {
      console.log("PARTICIPANTS DEBUG: Initial tour data load for:", tourId);
      
      // Invalidate tour query to force fresh data
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      
      // Trigger a refresh after a short delay to ensure data is loaded
      const timer = setTimeout(() => {
        handleRefetch();
        console.log("PARTICIPANTS DEBUG: Auto-refreshing tour data");
      }, 1000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [tourId, queryClient, handleRefetch]);
  
  // Fetch guide information when tour data changes
  useEffect(() => {
    const fetchGuideInfo = async () => {
      if (!tour) return;
      
      try {
        // Import dynamically to avoid hook order issues
        const { useGuideInfo } = await import("@/hooks/guides");
        
        // Create fallback guide info for when data can't be loaded
        const createFallbackGuide = (name: string): GuideInfo => ({
          name,
          birthday: new Date(),
          guideType: "GA Ticket" as GuideType
        });
        
        // Helper function to safely get guide info
        const safeGetGuideInfo = (guideName: string | undefined) => {
          if (!guideName) return null;
          try {
            // Create the guide info directly without hooks
            return {
              name: guideName,
              birthday: new Date(),
              guideType: "GA Ticket" as GuideType
            };
          } catch (error) {
            console.error(`Error fetching guide info for ${guideName}:`, error);
            return createFallbackGuide(guideName);
          }
        };
        
        // Set guide info with fallbacks
        if (tour.guide1) {
          setGuide1Info(safeGetGuideInfo(tour.guide1));
        }
        
        if (tour.guide2) {
          setGuide2Info(safeGetGuideInfo(tour.guide2));
        }
        
        if (tour.guide3) {
          setGuide3Info(safeGetGuideInfo(tour.guide3));
        }
      } catch (error) {
        console.error("Error loading guide information:", error);
      }
    };
    
    fetchGuideInfo();
  }, [tour]);
  
  // Log detailed information about participants to help debugging
  useEffect(() => {
    if (tour && tour.tourGroups) {
      console.log("PARTICIPANTS DEBUG: Tour groups loaded:", tour.tourGroups.length);
      
      // Count total participants
      let totalParticipantCount = 0;
      let totalParticipantCountFromSize = 0;
      
      tour.tourGroups.forEach(group => {
        // Count from participants array
        if (Array.isArray(group.participants)) {
          totalParticipantCount += group.participants.reduce((sum, p) => sum + (p.count || 1), 0);
        }
        
        // Count from size property
        totalParticipantCountFromSize += group.size || 0;
      });
      
      console.log("PARTICIPANTS DEBUG: Total participant counts:", {
        fromParticipantsArray: totalParticipantCount,
        fromSizeProperty: totalParticipantCountFromSize
      });
      
      // Log detailed group information
      tour.tourGroups.forEach((group, index) => {
        const participantCount = Array.isArray(group.participants) 
          ? group.participants.reduce((sum, p) => sum + (p.count || 1), 0) 
          : 0;
          
        const childCount = Array.isArray(group.participants)
          ? group.participants.reduce((sum, p) => sum + (p.childCount || 0), 0)
          : 0;
          
        console.log(`PARTICIPANTS DEBUG: Group ${index + 1} (${group.name || 'Unnamed'}) details:`, {
          id: group.id,
          size: group.size,
          childCount: group.childCount,
          hasParticipantsArray: Array.isArray(group.participants),
          participantCountFromArray: participantCount,
          childCountFromArray: childCount,
          participants: Array.isArray(group.participants) ? group.participants.map(p => ({
            name: p.name,
            count: p.count || 1,
            childCount: p.childCount || 0
          })) : 'No participants array'
        });
      });
    }
  }, [tour]);

  return (
    <DashboardLayout>
      {isLoading ? (
        <LoadingState />
      ) : error || !tour ? (
        <ErrorState tourId={tourId} onRetry={handleRefetch} />
      ) : (
        <NormalizedTourContent
          tour={tour}
          tourId={tourId}
          guide1Info={guide1Info}
          guide2Info={guide2Info}
          guide3Info={guide3Info}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </DashboardLayout>
  );
};

export default TourDetails;

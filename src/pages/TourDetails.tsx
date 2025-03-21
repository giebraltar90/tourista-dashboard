
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTourDetailsData } from "@/hooks/tour-details/useTourDetailsData";
import { LoadingState } from "@/components/tour-details/LoadingState";
import { ErrorState } from "@/components/tour-details/ErrorState";
import { NormalizedTourContent } from "@/components/tour-details/NormalizedTourContent";
import { useState, useEffect, useRef } from "react";
import { GuideInfo, GuideType } from "@/types/ventrata";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TourDetails = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const initialCheckCompleted = useRef(false);
  
  // Always ensure id has a value for the query
  const tourId = id || "";
  console.log("DATABASE DEBUG: TourDetails rendering with ID:", tourId);
  
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
  
  // Force data refresh when component mounts and load participants
  useEffect(() => {
    if (tourId && !initialCheckCompleted.current) {
      console.log("DATABASE DEBUG: Initial tour data load for:", tourId);
      initialCheckCompleted.current = true;
      
      // Invalidate tour query to force fresh data
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      
      // Trigger a refresh to ensure data is loaded
      handleRefetch();
      
      // Check database tables directly first
      const checkDatabaseSchema = async () => {
        console.log("DATABASE DEBUG: Checking database schema...");
        
        // Check tour_groups table
        const { count: groupsCount, error: groupsError } = await supabase
          .from('tour_groups')
          .select('*', { count: 'exact', head: true });
          
        if (groupsError) {
          console.error("DATABASE DEBUG: Error checking tour_groups table:", groupsError);
        } else {
          console.log(`DATABASE DEBUG: tour_groups table has ${groupsCount} total records`);
        }
        
        // Check participants table
        const { count: participantsCount, error: participantsError } = await supabase
          .from('participants')
          .select('*', { count: 'exact', head: true });
          
        if (participantsError) {
          console.error("DATABASE DEBUG: Error checking participants table:", participantsError);
          console.log("DATABASE DEBUG: This could indicate that the participants table doesn't exist!");
        } else {
          console.log(`DATABASE DEBUG: participants table has ${participantsCount} total records`);
        }
        
        // Check tour_groups for this specific tour
        const { data: tourGroups, error: tourGroupsError } = await supabase
          .from('tour_groups')
          .select('id, name, size')
          .eq('tour_id', tourId);
          
        if (tourGroupsError) {
          console.error("DATABASE DEBUG: Error fetching tour groups for this tour:", tourGroupsError);
        } else {
          console.log(`DATABASE DEBUG: Found ${tourGroups?.length || 0} groups for this tour:`, 
            tourGroups?.map(g => ({ id: g.id, name: g.name, size: g.size })));
          
          if (tourGroups && tourGroups.length > 0) {
            // Get all group IDs
            const groupIds = tourGroups.map(g => g.id);
            
            // Check for participants in these groups
            const { data: groupParticipants, error: groupParticipantsError } = await supabase
              .from('participants')
              .select('id, name, group_id, count')
              .in('group_id', groupIds);
              
            if (groupParticipantsError) {
              console.error("DATABASE DEBUG: Error fetching participants for groups:", groupParticipantsError);
            } else {
              console.log(`DATABASE DEBUG: Found ${groupParticipants?.length || 0} participants for this tour's groups`);
              
              // Log each participant by group
              if (groupParticipants) {
                const participantsByGroup = groupIds.map(groupId => {
                  const participants = groupParticipants.filter(p => p.group_id === groupId);
                  const group = tourGroups.find(g => g.id === groupId);
                  return {
                    groupId,
                    groupName: group?.name || 'Unknown Group',
                    participantsCount: participants.length,
                    participants: participants
                  };
                });
                
                console.log("DATABASE DEBUG: Participants by group:", participantsByGroup);
              }
            }
          }
        }
      };
      
      // Run the database schema check
      checkDatabaseSchema();
      
      // Load participants directly if possible - but only ONCE not multiple times
      // We'll rely on the GroupsManagement component to handle loading participants
    }
  }, [tourId, queryClient, handleRefetch]);
  
  // Listen for refresh-participants event
  useEffect(() => {
    const handleRefreshParticipants = () => {
      if (tourId) {
        console.log("DATABASE DEBUG: Received refresh-participants event");
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        handleRefetch();
      }
    };
    
    window.addEventListener('refresh-participants', handleRefreshParticipants);
    
    return () => {
      window.removeEventListener('refresh-participants', handleRefreshParticipants);
    };
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

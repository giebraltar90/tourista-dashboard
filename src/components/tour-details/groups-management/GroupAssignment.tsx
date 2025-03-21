
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideInfo, useGuideData } from "@/hooks/guides";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { useState, useEffect, useMemo } from "react";
import { GroupCard } from "./GroupCard";
import { AssignGuideDialog } from "./dialogs/AssignGuideDialog";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { useGroupManagement } from "@/hooks/group-management";
import { MoveParticipantSheet } from "./MoveParticipantSheet";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface GroupAssignmentProps {
  tour: TourCardProps;
}

export const GroupAssignment = ({ tour }: GroupAssignmentProps) => {
  console.log("DATABASE DEBUG: GroupAssignment rendering with tour:", tour);
  
  const guide1Info = tour.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour.guide3 ? useGuideInfo(tour.guide3) : null;
  const { guides = [] } = useGuideData() || { guides: [] };
  
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [availableGuides, setAvailableGuides] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbCheckResult, setDbCheckResult] = useState<{
    hasTable: boolean;
    participantCount: number;
    error?: string;
  } | null>(null);

  // Get participant management capabilities
  const {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setSelectedParticipant,
    isMovePending,
    refreshParticipants,
    loadParticipants
  } = useGroupManagement(tour);
  
  // Check database structure on mount
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        console.log("DATABASE DEBUG: Checking database structure");
        
        // Check if participants table exists and has any data
        const { count, error } = await supabase
          .from('participants')
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error("DATABASE DEBUG: Error checking participants table:", error);
          setDbCheckResult({
            hasTable: false,
            participantCount: 0,
            error: error.message
          });
        } else {
          console.log(`DATABASE DEBUG: Participants table exists with ${count} records`);
          setDbCheckResult({
            hasTable: true,
            participantCount: count || 0
          });
          
          // If we have participants, let's check if any belong to our tour
          if (count && count > 0) {
            // Get the group IDs for this tour
            const { data: groups } = await supabase
              .from('tour_groups')
              .select('id')
              .eq('tour_id', tour.id);
              
            if (groups && groups.length > 0) {
              const groupIds = groups.map(g => g.id);
              
              // Check for participants in these groups
              const { data: tourParticipants, error: tourParticipantsError } = await supabase
                .from('participants')
                .select('id')
                .in('group_id', groupIds)
                .limit(10);
                
              if (tourParticipantsError) {
                console.error("DATABASE DEBUG: Error checking tour participants:", tourParticipantsError);
              } else {
                console.log(`DATABASE DEBUG: This tour has ${tourParticipants?.length || 0} participants`);
              }
            }
          }
        }
      } catch (error) {
        console.error("DATABASE DEBUG: Error in database check:", error);
      }
    };
    
    checkDatabase();
  }, [tour.id]);
  
  // Manually load participants when component mounts
  useEffect(() => {
    if (tour.id) {
      console.log("DATABASE DEBUG: Loading participants for tour:", tour.id);
      // Force an initial load when the component mounts
      const timer = setTimeout(() => {
        loadParticipants(tour.id);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [tour.id, loadParticipants]);
  
  // Use a stable reference for the groups to prevent reordering during renders
  const stableTourGroups = useMemo(() => {
    console.log("DATABASE DEBUG: Creating stable tour groups from:", {
      localTourGroupsLength: localTourGroups?.length || 0,
      tourGroupsLength: tour.tourGroups?.length || 0
    });
    
    if (!localTourGroups || localTourGroups.length === 0) {
      console.log("DATABASE DEBUG: Using tour.tourGroups as fallback");
      if (!tour.tourGroups) return [];
      
      // Create a copy of the groups with their original indices preserved
      return tour.tourGroups.map((group, index) => ({
        ...group,
        originalIndex: index,
        displayName: group.name || `Group ${index + 1}`
      }));
    }
    
    // Create a copy of the groups with their original indices preserved
    return localTourGroups.map((group, index) => ({
      ...group,
      originalIndex: index,
      displayName: group.name || `Group ${index + 1}`
    }));
  }, [localTourGroups, tour.tourGroups]);
  
  console.log("DATABASE DEBUG: Stable tour groups:", stableTourGroups.map(g => ({
    id: g.id,
    name: g.displayName,
    participantsCount: g.participants?.length || 0
  })));
  
  // Handle manual refresh of participant data
  const handleRefreshParticipants = async () => {
    if (!tour.id) return;
    
    setIsRefreshing(true);
    try {
      console.log("DATABASE DEBUG: Manually refreshing participants for tour:", tour.id);
      
      // Check if the participants table exists
      const { error: tableCheckError } = await supabase
        .from('participants')
        .select('id')
        .limit(1);
        
      if (tableCheckError) {
        console.error("DATABASE DEBUG: Error checking participants table:", tableCheckError);
        toast.error("Participants table not found in database");
        setDbCheckResult({
          hasTable: false,
          participantCount: 0,
          error: tableCheckError.message
        });
        return;
      }
      
      // Table exists, refresh participants
      await refreshParticipants();
      toast.success("Participant data refreshed");
    } catch (error) {
      console.error("DATABASE DEBUG: Error refreshing participants:", error);
      toast.error("Failed to refresh participants");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Process guides once when component loads or dependencies change
  useEffect(() => {
    // Get valid guides for guide selection - ONLY use guides from the database (with valid UUIDs)
    const validGuides = guides
      .filter(guide => guide.id && isValidUuid(guide.id) && guide.name)
      .map(guide => ({
        id: guide.id,
        name: guide.name,
        info: guide
      }));
    
    setAvailableGuides(validGuides);
  }, [guides]);
  
  const handleOpenAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Group & Participant Management</CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefreshParticipants}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Participants'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Database status alert */}
          {dbCheckResult && !dbCheckResult.hasTable && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Participants table not found in database. Please check your database setup.
              </AlertDescription>
            </Alert>
          )}
          
          {dbCheckResult && dbCheckResult.hasTable && dbCheckResult.participantCount === 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Participants table exists but contains no records. You need to add participants to the database.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Display tour groups with their assigned guides and participants */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stableTourGroups.map((group) => {
                const index = group.originalIndex !== undefined ? group.originalIndex : 0;
                
                console.log(`DATABASE DEBUG: Rendering group ${index} (${group.displayName}):`, {
                  id: group.id,
                  participantsCount: Array.isArray(group.participants) ? group.participants.length : 0
                });
                
                return (
                  <GroupCard
                    key={group.id || index}
                    group={group}
                    groupIndex={index}
                    tour={tour}
                    guide1Info={guide1Info}
                    guide2Info={guide2Info}
                    guide3Info={guide3Info}
                    onAssignGuide={handleOpenAssignGuide}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDragStart={handleDragStart}
                    onDragEnd={() => {}} // Empty function to satisfy prop
                    onMoveClick={setSelectedParticipant}
                    selectedParticipant={selectedParticipant}
                    handleMoveParticipant={handleMoveParticipant}
                    isMovePending={isMovePending}
                    onRefreshParticipants={handleRefreshParticipants}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>

      {selectedGroupIndex !== null && (
        <AssignGuideDialog
          isOpen={isAssignGuideOpen}
          onOpenChange={setIsAssignGuideOpen}
          tourId={tour.id}
          groupIndex={selectedGroupIndex}
          guides={availableGuides}
          currentGuideId={stableTourGroups[selectedGroupIndex]?.guideId}
        />
      )}

      {/* Move participant dialog */}
      {selectedParticipant && (
        <MoveParticipantSheet
          selectedParticipant={selectedParticipant}
          tourGroups={localTourGroups}
          onClose={() => setSelectedParticipant(null)}
          onMove={handleMoveParticipant}
          isMovePending={isMovePending}
        />
      )}
    </Card>
  );
};

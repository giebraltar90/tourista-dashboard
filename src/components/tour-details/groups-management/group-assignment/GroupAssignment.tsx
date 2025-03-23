
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RefreshCw, AlertCircle, PlusCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGroupManagement } from "@/hooks/group-management";
import { GroupGrid } from "./GroupGrid";
import { RefreshControls } from "./RefreshControls";
import { DatabaseStatus } from "./DatabaseStatus";
import { AssignGuideDialog } from "../dialogs/AssignGuideDialog";
import { MoveParticipantSheet } from "../MoveParticipantSheet";
import { supabase } from "@/integrations/supabase/client";
import { addTestParticipants } from "@/hooks/testData/createTestData";
import { Button } from "@/components/ui/button";

interface GroupAssignmentProps {
  tour: TourCardProps;
}

export const GroupAssignment = ({ tour }: GroupAssignmentProps) => {
  console.log("GROUP ASSIGNMENT: Rendering with tour ID:", tour.id);
  
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [availableGuides, setAvailableGuides] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbCheckResult, setDbCheckResult] = useState<{
    hasTable: boolean;
    participantCount: number;
    error?: string;
  } | null>(null);

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
  
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        console.log("DATABASE DEBUG: Checking database structure for tour:", tour.id);
        
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
          
          if (count && count > 0) {
            const { data: groups } = await supabase
              .from('tour_groups')
              .select('id')
              .eq('tour_id', tour.id);
              
            if (groups && groups.length > 0) {
              const groupIds = groups.map(g => g.id);
              
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
  
  useEffect(() => {
    if (tour.id) {
      console.log("DATABASE DEBUG: Loading participants for tour:", tour.id);
      const timer = setTimeout(() => {
        loadParticipants(tour.id);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [tour.id, loadParticipants]);
  
  const handleRefreshParticipants = async () => {
    if (!tour.id) return;
    
    setIsRefreshing(true);
    try {
      console.log("DATABASE DEBUG: Manually refreshing participants for tour:", tour.id);
      
      const { error: tableCheck } = await supabase
        .from('participants')
        .select('id')
        .limit(1);
        
      if (tableCheck) {
        console.error("DATABASE DEBUG: Error checking participants table:", tableCheck);
        toast.error("Participants table not found in database");
        setDbCheckResult({
          hasTable: false,
          participantCount: 0,
          error: tableCheck.message
        });
        return;
      }
      
      await refreshParticipants();
      toast.success("Participant data refreshed");
    } catch (error) {
      console.error("DATABASE DEBUG: Error refreshing participants:", error);
      toast.error("Failed to refresh participants");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleAddTestParticipants = async () => {
    if (!tour.id) return;
    
    setIsRefreshing(true);
    try {
      await addTestParticipants(tour.id);
      toast.success("Test participants added successfully");
      
      // Force refresh after adding test participants
      setTimeout(() => {
        refreshParticipants();
      }, 500);
    } catch (error) {
      console.error("Error adding test participants:", error);
      toast.error("Failed to add test participants");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleOpenAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };

  console.log("GROUP ASSIGNMENT: Tour groups available:", {
    localGroupsCount: localTourGroups?.length || 0,
    tourGroupsCount: tour.tourGroups?.length || 0
  });
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Group & Participant Management</CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAddTestParticipants}
              disabled={isRefreshing}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Test Participants
            </Button>
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
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <DatabaseStatus dbCheckResult={dbCheckResult} />
          
          {localTourGroups && localTourGroups.length > 0 ? (
            <GroupGrid
              tour={tour}
              localTourGroups={localTourGroups}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              onOpenAssignGuide={handleOpenAssignGuide}
              selectedParticipant={selectedParticipant}
              setSelectedParticipant={setSelectedParticipant}
              handleMoveParticipant={handleMoveParticipant}
              isMovePending={isMovePending}
              onRefreshParticipants={handleRefreshParticipants}
            />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                No tour groups or participants found. Click "Add Test Participants" to create sample data.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>

      {selectedGroupIndex !== null && (
        <AssignGuideDialog
          isOpen={isAssignGuideOpen}
          onOpenChange={setIsAssignGuideOpen}
          tourId={tour.id}
          groupIndex={selectedGroupIndex}
          guides={availableGuides}
          currentGuideId={localTourGroups?.[selectedGroupIndex]?.guideId}
        />
      )}

      {selectedParticipant && (
        <MoveParticipantSheet
          selectedParticipant={selectedParticipant}
          tourGroups={localTourGroups || []}
          onClose={() => setSelectedParticipant(null)}
          onMove={handleMoveParticipant}
          isMovePending={isMovePending}
        />
      )}
    </Card>
  );
};

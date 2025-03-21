
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GroupsGrid } from "./GroupsGrid";
import { useGroupManagement } from "@/hooks/group-management";
import { useGuideInfo } from "@/hooks/guides";
import { VentrataTourGroup } from "@/types/ventrata";
import { GroupDialogsContainer } from "./components/GroupDialogsContainer";
import { Button } from "@/components/ui/button";
import { RefreshCw, DatabaseIcon, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { autoFixDatabaseIssues } from "@/services/api/checkDatabaseTables";
import { toast } from "sonner";
import { createTestParticipants } from "@/hooks/testData/createParticipants";

interface GroupsManagementProps {
  tour: TourCardProps;
}

export const GroupsManagement = ({ tour }: GroupsManagementProps) => {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [isFixingDatabase, setIsFixingDatabase] = useState(false);
  
  // Get guide information safely with null checks
  const guide1Info = tour.guide1 ? useGuideInfo(tour.guide1) : null;
  const guide2Info = tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour.guide3 ? useGuideInfo(tour.guide3) : null;

  // Ensure tourGroups are properly initialized with participants arrays
  const normalizedTourGroups: VentrataTourGroup[] = Array.isArray(tour.tourGroups) ? tour.tourGroups.map(group => ({
    ...group,
    participants: Array.isArray(group.participants) ? group.participants : []
  })) : [];
  
  const {
    localTourGroups,
    selectedParticipant,
    handleMoveParticipant,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setSelectedParticipant,
    isMovePending,
    loadParticipants,
    refreshParticipants
  } = useGroupManagement(tour);

  // Load participants data when component mounts - but only once and without toast
  useEffect(() => {
    if (tour.id) {
      console.log("GroupsManagement: Initial loading of participants for tour:", tour.id);
      
      // Pass false to prevent showing toast during initial load
      loadParticipants(tour.id, false);
      
      // Also try to directly check the table existence
      const checkTableExistence = async () => {
        try {
          // Try to directly query the participants table
          const { error } = await supabase
            .from('participants')
            .select('count(*)', { count: 'exact', head: true });
            
          if (error) {
            console.error("DATABASE DEBUG: Error checking participants table:", error);
            
            if (error.code === '42P01') { // relation doesn't exist error
              setDatabaseError("The participants table does not exist in the database. Click 'Fix Database' to create it.");
            } else {
              setDatabaseError(`Database error: ${error.message}`);
            }
          } else {
            setDatabaseError(null);
          }
        } catch (error) {
          console.error("DATABASE DEBUG: Exception checking participants table:", error);
        }
      };
      
      checkTableExistence();
    }
  }, [tour.id, loadParticipants]);
  
  // Handle manual refresh
  const handleManualRefresh = () => {
    setIsManualRefreshing(true);
    refreshParticipants(); // This will handle showing a toast itself
    setTimeout(() => setIsManualRefreshing(false), 1500);
  };
  
  // Handle database fix
  const handleFixDatabase = async () => {
    setIsFixingDatabase(true);
    try {
      const success = await autoFixDatabaseIssues();
      if (success) {
        toast.success("Database issues have been fixed");
        setDatabaseError(null);
        
        // Attempt to add test participants for all groups after fixing the database
        if (tour.tourGroups && tour.tourGroups.length > 0) {
          const createdParticipants = await createTestParticipants(tour.tourGroups);
          if (createdParticipants.length > 0) {
            toast.success(`Created ${createdParticipants.length} test participants`);
          }
        }
        
        // Refresh participants after fixing the database
        setTimeout(() => {
          refreshParticipants();
        }, 1000);
      } else {
        toast.error("Could not fix database issues");
      }
    } catch (error) {
      console.error("Error fixing database:", error);
      toast.error("Error while fixing database");
    } finally {
      setIsFixingDatabase(false);
    }
  };
  
  // Get dialog management - pass the tour object
  const dialogUtils = GroupDialogsContainer({
    tour,
    guide1Info,
    guide2Info,
    guide3Info,
    selectedGroupIndex,
    setSelectedGroupIndex
  });

  const { dialogsComponent } = dialogUtils;

  // Add CSS for drag and drop styling
  useEffect(() => {
    // Add global styles for drag and drop operations
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .drag-over {
        background-color: rgba(var(--primary-rgb), 0.1);
        border: 2px dashed hsl(var(--primary));
        border-radius: 0.5rem;
      }
      
      [data-drop-target="true"] {
        min-height: 100px;
      }
      
      [data-drop-target="true"]:empty:not(.drag-over) {
        border: 1px dashed rgba(0, 0, 0, 0.1);
      }
    `;
    document.head.appendChild(styleElement);
    
    // Clean up the style element on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Participant Management</CardTitle>
          <CardDescription>Drag and drop participants between groups</CardDescription>
        </div>
        <div className="flex gap-2">
          {databaseError && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleFixDatabase}
              disabled={isFixingDatabase}
              className="flex items-center text-amber-600 border-amber-300 bg-amber-50 hover:bg-amber-100"
            >
              <DatabaseIcon className={`h-4 w-4 mr-1 ${isFixingDatabase ? 'animate-spin' : ''}`} />
              {isFixingDatabase ? 'Fixing...' : 'Fix Database'}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleManualRefresh} 
            disabled={isMovePending || isManualRefreshing}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isManualRefreshing ? 'animate-spin' : ''}`} />
            Refresh Participants
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {databaseError && (
            <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                {databaseError} Click "Fix Database" to attempt to resolve this issue.
              </AlertDescription>
            </Alert>
          )}
          
          <GroupsGrid
            tourGroups={localTourGroups}
            tour={tour}
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd} 
            onMoveClick={setSelectedParticipant}
            selectedParticipant={selectedParticipant}
            handleMoveParticipant={handleMoveParticipant}
            isMovePending={isMovePending}
            onRefreshParticipants={refreshParticipants} 
          />
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 text-sm text-muted-foreground">
        Note: Changes to participants and group assignments are saved automatically.
      </CardFooter>

      {/* Render all dialogs */}
      {dialogsComponent}
    </Card>
  );
};

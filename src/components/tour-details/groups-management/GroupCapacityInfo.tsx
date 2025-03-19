
import { TourCardProps } from "@/components/tours/tour-card/types";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { Button } from "@/components/ui/button";
import { useUpdateTourCapacity } from "@/hooks/useTourCapacity";

interface GroupCapacityInfoProps {
  tour: TourCardProps;
  isHighSeason: boolean;
  totalParticipants: number;
}

export const GroupCapacityInfo = ({ 
  tour, 
  isHighSeason, 
  totalParticipants 
}: GroupCapacityInfoProps) => {
  const { updateTourCapacity, isUpdating } = useUpdateTourCapacity(tour.id);
  
  const capacity = isHighSeason ? 
    DEFAULT_CAPACITY_SETTINGS.highSeason : 
    totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard ? 
      DEFAULT_CAPACITY_SETTINGS.exception : 
      DEFAULT_CAPACITY_SETTINGS.standard;
  
  const requiredGroups = isHighSeason ? 
    DEFAULT_CAPACITY_SETTINGS.highSeasonGroups : 
    DEFAULT_CAPACITY_SETTINGS.standardGroups;
    
  const handleToggleHighSeason = async () => {
    // Update the tour's high season flag
    await updateTourCapacity({
      ...tour,
      isHighSeason: !isHighSeason,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">Group & Guide Management</h3>
          <p className="text-sm text-muted-foreground">Manage groups and assign guides to them</p>
        </div>
        <Button 
          size="sm" 
          variant={isHighSeason ? "default" : "outline"}
          onClick={handleToggleHighSeason}
          disabled={isUpdating}
        >
          {isHighSeason ? "High Season Mode" : "Standard Mode"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-medium">Current Capacity</h3>
          <div className="flex justify-between items-center p-4 bg-muted/30 rounded-md">
            <div>
              <p className="text-sm font-medium">Participants</p>
              <p className="text-2xl">{totalParticipants} / {capacity}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Groups</p>
              <p className="text-2xl">{tour.tourGroups.length} / {requiredGroups}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Booking Rules</h3>
          <div className="text-sm p-4 bg-muted/30 rounded-md space-y-1">
            <p><strong>Standard:</strong> 24 bookings (2 groups)</p>
            <p><strong>Exception:</strong> Up to 29 bookings (2 groups)</p>
            <p><strong>High Season:</strong> 36 bookings (3 groups)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

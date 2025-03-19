
import { TourCardProps } from "@/components/tours/tour-card/types";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { Button } from "@/components/ui/button";
import { useUpdateTourCapacity } from "@/hooks/useTourCapacity";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

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
  const [openDropdown, setOpenDropdown] = useState(false);
  
  const capacity = isHighSeason ? 
    DEFAULT_CAPACITY_SETTINGS.highSeason : 
    totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard ? 
      DEFAULT_CAPACITY_SETTINGS.exception : 
      DEFAULT_CAPACITY_SETTINGS.standard;
  
  const requiredGroups = isHighSeason ? 
    DEFAULT_CAPACITY_SETTINGS.highSeasonGroups : 
    DEFAULT_CAPACITY_SETTINGS.standardGroups;
    
  const handleModeChange = async (mode: 'standard' | 'exception' | 'high_season') => {
    // Update the tour's high season flag
    await updateTourCapacity({
      ...tour,
      isHighSeason: mode === 'high_season',
    });
    setOpenDropdown(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">Group & Guide Management</h3>
          <p className="text-sm text-muted-foreground">Manage groups and assign guides to them</p>
        </div>
        <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              variant={isHighSeason ? "default" : "outline"}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              {isHighSeason 
                ? "High Season Mode" 
                : totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard 
                  ? "Exception Mode" 
                  : "Standard Mode"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem 
              onClick={() => handleModeChange('standard')}
              className={!isHighSeason && totalParticipants <= DEFAULT_CAPACITY_SETTINGS.standard ? "bg-muted/50" : ""}
            >
              Standard Mode (2 groups, 24 people)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleModeChange('exception')}
              className={!isHighSeason && totalParticipants > DEFAULT_CAPACITY_SETTINGS.standard ? "bg-muted/50" : ""}
            >
              Exception Mode (2 groups, up to 29 people)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleModeChange('high_season')}
              className={isHighSeason ? "bg-muted/50" : ""}
            >
              High Season Mode (3 groups, 36 people)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-medium">Current Capacity</h3>
          <div className="flex justify-between items-center p-4 bg-muted/30 rounded-md">
            <div>
              <p className="text-sm font-medium">People</p>
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
            <p><strong>Standard:</strong> 24 people (2 groups)</p>
            <p><strong>Exception:</strong> Up to 29 people (2 groups)</p>
            <p><strong>High Season:</strong> 36 people (3 groups)</p>
          </div>
        </div>
      </div>
    </div>
  );
};


import { TourCardProps } from "@/components/tours/tour-card/types";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { DEFAULT_CAPACITY_SETTINGS } from "@/types/ventrata";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";
import { useEffect, useMemo } from "react";

interface GroupCapacityInfoProps {
  tour: TourCardProps;
  isHighSeason: boolean;
  totalParticipants?: number;
}

export const GroupCapacityInfo = ({ 
  tour, 
  isHighSeason, 
  totalParticipants: providedTotalParticipants 
}: GroupCapacityInfoProps) => {
  // Ensure tour.tourGroups exists and is an array
  const tourGroups = Array.isArray(tour.tourGroups) ? tour.tourGroups : [];
  
  // Log initial data received when component mounts
  useEffect(() => {
    console.log("GROUP CAPACITY: Initial data:", {
      tourId: tour.id,
      isHighSeason,
      groupsCount: tourGroups.length,
      providedTotalParticipants,
      tourNameForRef: tour.tourName
    });
    
    // Log raw group data for debugging
    console.log("GROUP CAPACITY: Raw tour groups:", 
      tourGroups.map(g => ({
        id: g.id,
        name: g.name || 'Unnamed',
        size: g.size,
        childCount: g.childCount,
        hasParticipantsArray: Array.isArray(g.participants),
        participantsLength: Array.isArray(g.participants) ? g.participants.length : 0
      }))
    );
  }, [tour.id, tour.tourName, isHighSeason, tourGroups, providedTotalParticipants]);
  
  // Calculate participant counts from groups using useMemo to avoid recalculation
  const participantCounts = useMemo(() => {
    let calculatedTotalParticipants = 0;
    let calculatedTotalChildCount = 0;
    
    console.log(`GROUP CAPACITY: Starting fresh calculations for ${tourGroups.length} groups`);
    
    // Count from participants arrays
    for (const group of tourGroups) {
      if (Array.isArray(group.participants) && group.participants.length > 0) {
        let groupTotal = 0;
        let groupChildCount = 0;
        
        // Count directly from participants array
        for (const participant of group.participants) {
          const count = typeof participant.count === 'number' ? participant.count : 
                        (participant.count ? parseInt(String(participant.count)) : 1);
          const childCount = typeof participant.childCount === 'number' ? participant.childCount :
                            (participant.childCount ? parseInt(String(participant.childCount)) : 0);
          
          groupTotal += count;
          groupChildCount += childCount;
        }
        
        calculatedTotalParticipants += groupTotal;
        calculatedTotalChildCount += groupChildCount;
        
        console.log(`GROUP CAPACITY: Group "${group.name || 'Unnamed'}" participant counts:`, {
          groupId: group.id,
          groupTotal,
          groupChildCount,
          runningTotal: calculatedTotalParticipants,
          runningChildCount: calculatedTotalChildCount
        });
      } else if (typeof group.size === 'number' && group.size > 0) {
        // Fallback to size properties if no participants array but size exists
        calculatedTotalParticipants += group.size;
        calculatedTotalChildCount += typeof group.childCount === 'number' ? group.childCount : 0;
        
        console.log(`GROUP CAPACITY: Using group.size fallback for "${group.name || 'Unnamed'}":`, {
          size: group.size,
          childCount: group.childCount || 0,
          runningTotal: calculatedTotalParticipants,
          runningChildCount: calculatedTotalChildCount
        });
      } else if (group.size) {
        // Last resort - try to parse size from string
        try {
          const parsedSize = parseInt(String(group.size));
          const parsedChildCount = group.childCount ? parseInt(String(group.childCount)) : 0;
          
          if (!isNaN(parsedSize)) {
            calculatedTotalParticipants += parsedSize;
            calculatedTotalChildCount += !isNaN(parsedChildCount) ? parsedChildCount : 0;
            
            console.log(`GROUP CAPACITY: Parsed group.size for "${group.name || 'Unnamed'}":`, {
              parsedSize,
              parsedChildCount,
              runningTotal: calculatedTotalParticipants,
              runningChildCount: calculatedTotalChildCount
            });
          }
        } catch (e) {
          console.error(`GROUP CAPACITY: Error parsing size for group "${group.name || 'Unnamed'}":`, e);
        }
      }
    }
    
    // Use calculated values, only fall back to provided values if calculation yields 0
    const displayedParticipants = calculatedTotalParticipants > 0 ? calculatedTotalParticipants : (providedTotalParticipants || 0);
    const childCount = calculatedTotalChildCount > 0 ? calculatedTotalChildCount : 0;
    const adultCount = displayedParticipants - childCount;
    
    console.log("GROUP CAPACITY: Final calculations:", {
      calculatedTotalParticipants,
      calculatedTotalChildCount,
      providedTotalParticipants,
      displayedParticipants,
      adultCount,
      childCount
    });
    
    return {
      totalParticipants: displayedParticipants,
      childCount,
      adultCount
    };
  }, [tourGroups, providedTotalParticipants]);
  
  // Format participant count to show adults + children
  const formattedParticipantCount = formatParticipantCount(
    participantCounts.totalParticipants, 
    participantCounts.childCount
  );
  
  const capacity = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeason 
    : DEFAULT_CAPACITY_SETTINGS.standard;
  
  const requiredGroups = isHighSeason 
    ? DEFAULT_CAPACITY_SETTINGS.highSeasonGroups 
    : DEFAULT_CAPACITY_SETTINGS.standardGroups;
  
  return (
    <>
      <CardTitle>Current Capacity</CardTitle>
      <CardDescription>
        <div className="flex justify-between mt-4">
          <div>
            <span className="font-medium">Participants</span>
            <div className="text-xl font-bold">
              {formattedParticipantCount} / {capacity}
            </div>
          </div>
          <div>
            <span className="font-medium">Groups</span>
            <div className="text-xl font-bold">
              {tourGroups.length} / {requiredGroups}
            </div>
          </div>
        </div>
      </CardDescription>
    </>
  );
};


import { useState, useEffect } from 'react';
import { VentrataTourGroup } from '@/types/ventrata';

export interface ParticipantCounts {
  totalParticipants: number;
  adultCount: number;
  childCount: number;
  totalGroups: number;
  groupsWithGuides: number;
  // Add missing properties used in other components
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  totalTicketsNeeded: number;
  totalChildCount: number;
}

export const useParticipantCounts = (tourGroups: VentrataTourGroup[]): ParticipantCounts => {
  const [counts, setCounts] = useState<ParticipantCounts>({
    totalParticipants: 0,
    adultCount: 0,
    childCount: 0,
    totalGroups: 0,
    groupsWithGuides: 0,
    // Initialize new properties
    adultTickets: 0,
    childTickets: 0,
    totalTickets: 0,
    totalTicketsNeeded: 0,
    totalChildCount: 0
  });

  useEffect(() => {
    console.log("DATABASE DEBUG: ParticipantsCard calculating counts with groups:", {
      tourGroupsLength: tourGroups.length,
      tourGroupsWithParticipants: tourGroups.filter(g => Array.isArray(g.participants) && g.participants.length > 0).length
    });

    // Default values
    let totalParticipants = 0;
    let childCount = 0;
    let groupsWithGuides = 0;

    // Process each group
    if (Array.isArray(tourGroups)) {
      tourGroups.forEach(group => {
        // Count guides
        if (group.guideId) {
          groupsWithGuides++;
        }

        // Calculate from size and childCount if available
        if (typeof group.size === 'number') {
          totalParticipants += group.size;
          
          // Add child count if available
          if (typeof group.childCount === 'number') {
            childCount += group.childCount;
          }
        } 
        // Fallback to calculating from participants array
        else if (Array.isArray(group.participants) && group.participants.length > 0) {
          // Count each participant
          group.participants.forEach(p => {
            const participantCount = p.count || 1;
            totalParticipants += participantCount;
            
            // Add child count if available
            if (typeof p.childCount === 'number') {
              childCount += p.childCount;
            }
          });
        }
      });
    }

    // Calculate adult count (total - children)
    const adultCount = Math.max(0, totalParticipants - childCount);

    // Set all counts including the new properties
    setCounts({
      totalParticipants,
      adultCount,
      childCount,
      totalGroups: Array.isArray(tourGroups) ? tourGroups.length : 0,
      groupsWithGuides,
      // Map the calculated values to the new properties
      adultTickets: adultCount,
      childTickets: childCount,
      totalTickets: totalParticipants,
      totalTicketsNeeded: totalParticipants,
      totalChildCount: childCount
    });
  }, [tourGroups]);

  return counts;
};

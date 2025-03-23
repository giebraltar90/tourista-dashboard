import { useState, useEffect } from "react";
import { VentrataTourGroup } from "@/types/ventrata";

export interface ParticipantCounts {
  totalParticipants: number;
  totalChildCount: number;
  adultParticipants: number;
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  totalTicketsNeeded: number;
}

/**
 * Hook to calculate various participant counts for a tour
 */
export const useParticipantCounts = (
  groups: VentrataTourGroup[],
  location: string,
): ParticipantCounts => {
  const [counts, setCounts] = useState<ParticipantCounts>({
    totalParticipants: 0,
    totalChildCount: 0,
    adultParticipants: 0,
    adultTickets: 0,
    childTickets: 0,
    totalTickets: 0,
    totalTicketsNeeded: 0
  });
  
  useEffect(() => {
    // Calculate totals from participant data
    const totalParticipants = calculateTotalParticipants(groups);
    const totalChildCount = calculateTotalChildCount(groups);
    const adultParticipants = totalParticipants - totalChildCount;
    
    console.log("🔍 [useParticipantCounts] Starting calculation with:", {
      tourGroups: groups.length,
      location,
      totalParticipants,
      totalChildCount,
      adultParticipants
    });
    
    setCounts({
      totalParticipants,
      totalChildCount,
      adultParticipants,
      adultTickets: adultParticipants,
      childTickets: totalChildCount,
      totalTickets: totalParticipants,
      totalTicketsNeeded: totalParticipants
    });
  }, [groups, location]);
  
  return counts;
};

// Helper function to calculate total participants across all groups
function calculateTotalParticipants(groups: VentrataTourGroup[]): number {
  return groups.reduce((total, group) => {
    // If group has size directly specified, use that
    if (typeof group.size === 'number') {
      return total + group.size;
    }
    
    // Otherwise count from participants array
    if (Array.isArray(group.participants)) {
      return total + group.participants.reduce((sum, participant) => {
        return sum + (participant.count || 1);
      }, 0);
    }
    
    return total;
  }, 0);
}

// Helper function to calculate total child count across all groups
function calculateTotalChildCount(groups: VentrataTourGroup[]): number {
  return groups.reduce((total, group) => {
    // If group has childCount directly specified, use that
    if (typeof group.childCount === 'number') {
      return total + group.childCount;
    }
    
    // Otherwise count from participants array
    if (Array.isArray(group.participants)) {
      return total + group.participants.reduce((sum, participant) => {
        return sum + (participant.childCount || 0);
      }, 0);
    }
    
    return total;
  }, 0);
}

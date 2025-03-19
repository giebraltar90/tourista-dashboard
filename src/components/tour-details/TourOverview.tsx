
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { 
  TourInformationCard,
  ParticipantsCard,
  TicketsCard
} from "./overview";
import { useState, useEffect } from "react";
import { calculateTotalParticipants } from "@/hooks/group-management/services/participantService";
import { GroupsManagement } from "./groups-management";
import { Separator } from "@/components/ui/separator";
import { GuidesAssignedSection } from "./overview/GuidesAssignedSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourOverview = ({ tour, guide1Info, guide2Info, guide3Info }: TourOverviewProps) => {
  // Ensure tourGroups exists to prevent errors
  const tourGroups = Array.isArray(tour.tourGroups) ? tour.tourGroups : [];
  
  // Calculate total participants directly from groups for accuracy
  const totalParticipants = calculateTotalParticipants(tourGroups);
  
  // Calculate total child count across all groups
  const totalChildCount = tourGroups.reduce((sum, group) => sum + (group.childCount || 0), 0);
  
  // CRITICAL FIX: Explicitly convert to boolean to ensure consistent behavior
  const isHighSeason = Boolean(tour.isHighSeason);
  console.log('TourOverview: isHighSeason =', isHighSeason, 'original value =', tour.isHighSeason);
  
  // Calculate tickets based on actual participant counts
  const adultTickets = tour.numTickets 
    ? Math.round(tour.numTickets * 0.7) 
    : Math.round((totalParticipants - totalChildCount) * 0.7);
    
  const childTickets = tour.numTickets 
    ? (tour.numTickets - adultTickets) 
    : totalChildCount;

  // Function to determine badge color based on guide type
  const getGuideTypeBadgeColor = (guideType?: string) => {
    if (!guideType) return "bg-gray-100 text-gray-800";
    
    switch (guideType) {
      case "GA Ticket":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "GA Free":
        return "bg-green-100 text-green-800 border-green-300";
      case "GC":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Log for debugging synchronization issues
  console.log("TourOverview rendering with counts:", {
    totalParticipants,
    totalChildCount,
    adultParticipants: totalParticipants - totalChildCount,
    adultTickets,
    childTickets,
    groupSizes: tourGroups.map(g => ({
      name: g.name, 
      size: g.size, 
      childCount: g.childCount
    }))
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TourInformationCard 
          referenceCode={tour.referenceCode} 
          tourType={tour.tourType} 
        />
        
        <ParticipantsCard 
          tourGroups={tourGroups}
          totalParticipants={totalParticipants}
          totalChildCount={totalChildCount}
          isHighSeason={isHighSeason}
        />
        
        <TicketsCard
          adultTickets={adultTickets}
          childTickets={childTickets}
          totalTickets={tour.numTickets || totalParticipants}
        />
      </div>
      
      <Separator className="my-6" />
      
      <Tabs defaultValue="guides" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="guides">Guide Assignments</TabsTrigger>
          <TabsTrigger value="participants">Participant Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="guides">
          <GuidesAssignedSection
            tour={{...tour, isHighSeason}}
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
            getGuideTypeBadgeColor={getGuideTypeBadgeColor}
          />
        </TabsContent>
        
        <TabsContent value="participants">
          <GroupsManagement 
            tour={{...tour, isHighSeason}} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

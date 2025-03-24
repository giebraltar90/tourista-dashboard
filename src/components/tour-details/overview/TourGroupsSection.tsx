
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuideInfo } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { Button } from "@/components/ui/button";
import { AssignGuideDialog } from "../groups-management/dialogs/AssignGuideDialog";
import { useGuideData } from "@/hooks/guides/useGuideData";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { logger } from "@/utils/logger";
import { GuideType } from "@/types/ventrata";

interface TourGroupsSectionProps {
  tour: TourCardProps;
  isHighSeason: boolean;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const TourGroupsSection = ({ 
  tour, 
  isHighSeason,
  guide1Info = null, 
  guide2Info = null, 
  guide3Info = null 
}: TourGroupsSectionProps) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const { guides = [] } = useGuideData();
  
  // State for guide assignment dialog
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);
  
  // Ensure we have tour groups
  const tourGroups = Array.isArray(tour.tourGroups) ? tour.tourGroups : [];
  
  // Log group data for debugging
  useEffect(() => {
    logger.debug("TourGroupsSection: Tour groups data", {
      tourId: tour.id,
      groupCount: tourGroups.length,
      groups: tourGroups.map((g, i) => ({
        index: i,
        id: g.id,
        name: g.name,
        guideId: g.guideId || 'none'
      }))
    });
  }, [tour.id, tourGroups]);
  
  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };
  
  // Open the guide assignment dialog
  const handleAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };
  
  // Get valid guide options - making sure each guide has all required properties
  // Updated to match the GuideOption interface with the info property
  const validGuides = guides.map(guide => {
    // Handle different types of birthday fields safely
    let birthdayStr = "";
    if (guide.birthday) {
      if (typeof guide.birthday === 'object' && guide.birthday !== null) {
        birthdayStr = guide.birthday.toString();
      } else if (typeof guide.birthday === 'string') {
        birthdayStr = guide.birthday;
      }
    }
    
    return {
      id: guide.id,
      name: guide.name,
      guide_type: guide.guide_type || "GA Ticket",
      birthday: birthdayStr,
      guideType: guide.guide_type || "GA Ticket",
      info: {
        name: guide.name,
        birthday: guide.birthday !== null && guide.birthday !== undefined 
          ? (typeof guide.birthday === 'object' 
            ? guide.birthday 
            : new Date(String(guide.birthday)))
          : new Date(),
        guideType: (guide.guide_type || "GA Ticket") as GuideType
      }
    };
  });
  
  // Add special guides if they exist in the tour
  if (tour.guide1 && !validGuides.some(g => g.id === tour.guide1)) {
    validGuides.push({
      id: "guide1",
      name: tour.guide1,
      guide_type: guide1Info?.guideType || "GA Ticket",
      birthday: guide1Info?.birthday ? guide1Info.birthday.toISOString() : "",
      guideType: guide1Info?.guideType || "GA Ticket",
      info: {
        name: tour.guide1,
        birthday: guide1Info?.birthday || new Date(),
        guideType: (guide1Info?.guideType || "GA Ticket") as GuideType
      }
    });
  }
  
  if (tour.guide2 && !validGuides.some(g => g.id === tour.guide2)) {
    validGuides.push({
      id: "guide2",
      name: tour.guide2,
      guide_type: guide2Info?.guideType || "GA Ticket",
      birthday: guide2Info?.birthday ? guide2Info.birthday.toISOString() : "",
      guideType: guide2Info?.guideType || "GA Ticket",
      info: {
        name: tour.guide2,
        birthday: guide2Info?.birthday || new Date(),
        guideType: (guide2Info?.guideType || "GA Ticket") as GuideType
      }
    });
  }
  
  if (tour.guide3 && !validGuides.some(g => g.id === tour.guide3)) {
    validGuides.push({
      id: "guide3",
      name: tour.guide3,
      guide_type: guide3Info?.guideType || "GA Ticket",
      birthday: guide3Info?.birthday ? guide3Info.birthday.toISOString() : "",
      guideType: guide3Info?.guideType || "GA Ticket",
      info: {
        name: tour.guide3,
        birthday: guide3Info?.birthday || new Date(),
        guideType: (guide3Info?.guideType || "GA Ticket") as GuideType
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Groups & Guides</CardTitle>
      </CardHeader>
      <CardContent>
        {tourGroups.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No tour groups available
          </div>
        ) : (
          <div className="space-y-4">
            {tourGroups.map((group, index) => {
              const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
              const isExpanded = expandedGroup === group.id;
              
              // Create group display name with guide in parentheses if assigned, including guide type
              const displayName = guideName && guideName !== "Unassigned" 
                ? `Group ${index + 1} (${guideName}${guideInfo?.guideType ? ` - ${guideInfo.guideType}` : ''})`
                : `Group ${index + 1}`;
                
              // Log each group's guide info for debugging
              logger.debug(`Group ${index + 1} guide info:`, {
                groupId: group.id,
                groupName: group.name,
                guideId: group.guideId,
                calculatedGuideName: guideName
              });
              
              return (
                <div 
                  key={group.id || index}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="bg-muted/30 p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{displayName}</h3>
                    </div>
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAssignGuide(index)}
                      >
                        {guideName && guideName !== "Unassigned" ? "Change Guide" : "Assign Guide"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Guide Assignment Dialog */}
        {isAssignGuideOpen && selectedGroupIndex >= 0 && tourGroups[selectedGroupIndex] && (
          <AssignGuideDialog
            isOpen={isAssignGuideOpen}
            onOpenChange={setIsAssignGuideOpen}
            tourId={tour.id}
            groupIndex={selectedGroupIndex}
            guides={validGuides}
            currentGuideId={tourGroups[selectedGroupIndex].guideId}
          />
        )}
      </CardContent>
    </Card>
  );
};

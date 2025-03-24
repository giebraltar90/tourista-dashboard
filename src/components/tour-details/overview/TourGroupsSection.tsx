
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuideInfo, VentrataTourGroup, GuideType } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { Button } from "@/components/ui/button";
import { AssignGuideDialog } from "../groups-management/dialogs/AssignGuideDialog";
import { useGuideData } from "@/hooks/guides/useGuideData";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { logger } from "@/utils/logger";

interface TourGroupsSectionProps {
  tourGroups: VentrataTourGroup[];
  tourId: string;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const TourGroupsSection = ({ 
  tourGroups, 
  tourId,
  guide1Info = null, 
  guide2Info = null, 
  guide3Info = null 
}: TourGroupsSectionProps) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  // Create a minimal but complete tour object with required properties
  const minimalTour: TourCardProps = { 
    id: tourId, 
    guide1: '', 
    guide2: '', 
    guide3: '',
    date: new Date(),
    location: '',
    tourName: '',
    tourType: 'default',
    startTime: '',
    referenceCode: '',
    tourGroups: [],
    numTickets: 0,
    isHighSeason: false
  };
  const { getGuideNameAndInfo } = useGuideNameInfo(minimalTour, guide1Info, guide2Info, guide3Info);
  const { guides = [] } = useGuideData();
  
  // State for guide assignment dialog
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);
  
  // Ensure we have tour groups
  const validTourGroups = Array.isArray(tourGroups) ? tourGroups : [];
  
  // Log group data for debugging
  useEffect(() => {
    logger.debug("TourGroupsSection: Tour groups data", {
      tourId: tourId,
      groupCount: validTourGroups.length,
      groups: validTourGroups.map((g, i) => ({
        index: i,
        id: g.id,
        name: g.name,
        guideId: g.guideId || 'none'
      }))
    });
  }, [tourId, validTourGroups]);
  
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Groups & Guides</CardTitle>
      </CardHeader>
      <CardContent>
        {validTourGroups.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No tour groups available
          </div>
        ) : (
          <div className="space-y-4">
            {validTourGroups.map((group, index) => {
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
        {isAssignGuideOpen && selectedGroupIndex >= 0 && validTourGroups[selectedGroupIndex] && (
          <AssignGuideDialog
            isOpen={isAssignGuideOpen}
            onOpenChange={setIsAssignGuideOpen}
            tourId={tourId}
            groupIndex={selectedGroupIndex}
            guides={validGuides}
            currentGuideId={validTourGroups[selectedGroupIndex].guideId}
          />
        )}
      </CardContent>
    </Card>
  );
};

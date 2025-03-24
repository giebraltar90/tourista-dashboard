
import { TourCardProps } from "@/components/tours/tour-card/types";
import { TourGroupsSection } from "./overview/TourGroupsSection";
import { InformationCardsSection } from "./overview/InformationCardsSection";
import { GroupsManagement } from "./groups-management";
import { GuideInfo } from "@/types/ventrata";
import { useParticipantCountsSync } from "@/hooks/tour-details/useParticipantCountsSync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const TourOverview = ({ 
  tour,
  guide1Info,
  guide2Info,
  guide3Info
}: TourOverviewProps) => {
  // Check if this is high season (example logic)
  const isHighSeason = tour?.isHighSeason || false;
  
  // Safely access tourGroups with a fallback
  const tourGroups = tour?.tourGroups || [];

  // Use synced participant counts for consistent display
  const participantCounts = useParticipantCountsSync(tourGroups);

  // Guard against undefined tour
  if (!tour) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <p className="text-muted-foreground">Cannot display tour overview. Tour data is missing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tour Details Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tour Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Reference Code</h3>
              <p className="font-medium">{tour.referenceCode || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Tour Type</h3>
              <p className="font-medium capitalize">{tour.tourType || 'Standard'}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Location</h3>
              <p className="font-medium">{tour.location || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Start Time</h3>
              <p className="font-medium">{tour.startTime || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Season Status</h3>
              <p className="font-medium">{isHighSeason ? 'High Season' : 'Standard Season'}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Total Participants</h3>
              <p className="font-medium">{participantCounts.totalParticipants || 0} 
                ({participantCounts.totalChildCount || 0} children)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <InformationCardsSection 
        tour={tour} 
        tourGroups={tourGroups}
        participantCounts={participantCounts}
        isHighSeason={isHighSeason}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
      />
      
      <TourGroupsSection 
        tour={tour}
        isHighSeason={isHighSeason}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
      />
      
      {/* Add GroupsManagement directly in the overview */}
      <GroupsManagement 
        tour={tour}
        tourId={tour.id}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
      />
    </div>
  );
};

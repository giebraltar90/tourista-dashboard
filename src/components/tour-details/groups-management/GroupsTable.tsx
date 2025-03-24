
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VentrataTourGroup, GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideNameInfo } from "@/hooks/group-management";
import { useGuideData } from "@/hooks/guides";
import { findGuideNameByTour } from "@/hooks/group-management/utils";

interface GroupsTableProps {
  tourGroups: VentrataTourGroup[];
  tour: TourCardProps;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const GroupsTable = ({ 
  tourGroups, 
  tour, 
  guide1Info, 
  guide2Info, 
  guide3Info
}: GroupsTableProps) => {
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info || null, guide2Info || null, guide3Info || null);
  const { guides = [] } = useGuideData() || { guides: [] };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Group Name</TableHead>
          <TableHead>Participants</TableHead>
          <TableHead>Entry Time</TableHead>
          <TableHead>Guide</TableHead>
          <TableHead>Children</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tourGroups.map((group, index) => {
          const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
          
          const totalParticipants = group.participants?.reduce((sum, p) => sum + (p.count || 1), 0) || group.size || 0;
          
          const childCount = group.childCount || 0;
          const adultCount = totalParticipants - childCount;
          const formattedParticipantCount = `${adultCount} + ${childCount}`;
          
          const isGuideAssigned = !!group.guideId && guideName !== "Unassigned";
          
          let groupNumber = index + 1;
          if (group.name) {
            const match = group.name.match(/Group (\d+)/);
            if (match && match[1]) {
              groupNumber = parseInt(match[1], 10);
            }
          }
          
          const groupDisplayName = `Group ${groupNumber}`;
          
          return (
            <TableRow key={group.id || index}>
              <TableCell className="font-medium">
                {groupDisplayName}
              </TableCell>
              <TableCell>{formattedParticipantCount} participants</TableCell>
              <TableCell>{group.entryTime}</TableCell>
              <TableCell>
                {isGuideAssigned ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {guideName}
                    {guideInfo?.guideType && <span className="ml-1">({guideInfo.guideType})</span>}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Unassigned
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {group.childCount ? (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {group.childCount} {group.childCount === 1 ? 'child' : 'children'}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Confirmed
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

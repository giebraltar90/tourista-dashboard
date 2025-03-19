
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideInfo } from "@/hooks/useGuideData";

interface GroupsTableProps {
  tourGroups: VentrataTourGroup[];
  tour: TourCardProps;
}

export const GroupsTable = ({ tourGroups, tour }: GroupsTableProps) => {
  // Get guide infos
  const guide1Info = useGuideInfo(tour.guide1);
  const guide2Info = tour.guide2 ? useGuideInfo(tour.guide2) : null;
  const guide3Info = tour.guide3 ? useGuideInfo(tour.guide3) : null;
  
  // Helper to get guide name based on guideId
  const getGuideName = (guideId?: string) => {
    if (!guideId) return "Unassigned";
    
    if ((guideId === "guide1" || guideId === guide1Info?.id) && guide1Info) {
      return tour.guide1;
    } else if ((guideId === "guide2" || guideId === guide2Info?.id) && guide2Info) {
      return tour.guide2 || "";
    } else if ((guideId === "guide3" || guideId === guide3Info?.id) && guide3Info) {
      return tour.guide3 || "";
    }
    
    return "Unassigned";
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Group Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Entry Time</TableHead>
          <TableHead>Guide</TableHead>
          <TableHead>Children</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tourGroups.map((group, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{group.name}</TableCell>
            <TableCell>{group.size || 0}</TableCell>
            <TableCell>{group.entryTime}</TableCell>
            <TableCell>{getGuideName(group.guideId)}</TableCell>
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
            <TableCell className="text-right">
              <Button 
                variant="outline" 
                size="sm"
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

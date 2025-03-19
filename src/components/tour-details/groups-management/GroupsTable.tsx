
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VentrataTourGroup, GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideNameInfo } from "@/hooks/group-management";

interface GroupsTableProps {
  tourGroups: VentrataTourGroup[];
  tour: TourCardProps;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const GroupsTable = ({ tourGroups, tour, guide1Info, guide2Info, guide3Info }: GroupsTableProps) => {
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info || null, guide2Info || null, guide3Info || null);
  
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
        {tourGroups.map((group, index) => {
          const { name: guideName } = getGuideNameAndInfo(group.guideId);
          
          // Count participants based on the array length
          const bookingCount = group.participants?.length || 0;
          
          // Count total people (accounting for families/groups)
          const totalPeople = group.participants?.reduce((sum, p) => sum + (p.count || 1), 0) || 0;
          
          return (
            <TableRow key={index}>
              <TableCell className="font-medium">{group.name}</TableCell>
              <TableCell>{totalPeople} people ({bookingCount} bookings)</TableCell>
              <TableCell>{group.entryTime}</TableCell>
              <TableCell>
                {guideName !== "Unassigned" ? guideName : (
                  <span className="text-muted-foreground">Unassigned</span>
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
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

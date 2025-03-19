
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VentrataTourGroup, GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useGuideNameInfo } from "@/hooks/group-management";
import { UserPlus, Edit } from "lucide-react";

interface GroupsTableProps {
  tourGroups: VentrataTourGroup[];
  tour: TourCardProps;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
  onAssignGuide: (groupIndex: number) => void;
  onEditGroup: (groupIndex: number) => void;
}

export const GroupsTable = ({ 
  tourGroups, 
  tour, 
  guide1Info, 
  guide2Info, 
  guide3Info,
  onAssignGuide,
  onEditGroup
}: GroupsTableProps) => {
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info || null, guide2Info || null, guide3Info || null);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Group Name</TableHead>
          <TableHead>People</TableHead>
          <TableHead>Entry Time</TableHead>
          <TableHead>Guide</TableHead>
          <TableHead>Children</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tourGroups.map((group, index) => {
          // Get guide info using the guideId from the group
          const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
          
          // Count total people (accounting for families/groups)
          const totalPeople = group.participants?.reduce((sum, p) => sum + (p.count || 1), 0) || group.size || 0;
          
          // Check if guide is assigned
          const isGuideAssigned = !!group.guideId && guideName !== "Unassigned";
          
          return (
            <TableRow key={index}>
              <TableCell className="font-medium">{group.name || `Group ${index + 1}`}</TableCell>
              <TableCell>{totalPeople} people</TableCell>
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
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onAssignGuide(index)}
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    {isGuideAssigned ? "Change Guide" : "Assign Guide"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEditGroup(index)}
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

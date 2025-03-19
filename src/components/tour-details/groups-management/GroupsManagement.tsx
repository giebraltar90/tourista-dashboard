
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/TourCard";
import { useUpdateTourGroups } from "@/hooks/useTourData";
import { GroupCard } from "./GroupCard";
import { toast } from "sonner";

interface GroupsManagementProps {
  tour: TourCardProps;
}

export const GroupsManagement = ({ tour }: GroupsManagementProps) => {
  const [selectedParticipant, setSelectedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  
  const [draggedParticipant, setDraggedParticipant] = useState<{
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null>(null);
  
  const updateTourGroupsMutation = useUpdateTourGroups(tour.id);
  
  const handleMoveParticipant = (toGroupIndex: number) => {
    if (!selectedParticipant) return;
    
    const { participant, fromGroupIndex } = selectedParticipant;
    
    if (fromGroupIndex === toGroupIndex) {
      toast.error("Participant is already in this group");
      return;
    }
    
    const updatedTourGroups = JSON.parse(JSON.stringify(tour.tourGroups));
    
    const sourceGroup = updatedTourGroups[fromGroupIndex];
    if (sourceGroup.participants) {
      sourceGroup.participants = sourceGroup.participants.filter(
        (p: VentrataParticipant) => p.id !== participant.id
      );
      sourceGroup.size -= participant.count;
    }
    
    const destGroup = updatedTourGroups[toGroupIndex];
    if (!destGroup.participants) {
      destGroup.participants = [];
    }
    destGroup.participants.push(participant);
    destGroup.size += participant.count;
    
    updateTourGroupsMutation.mutate(updatedTourGroups);
    
    setSelectedParticipant(null);
  };

  // Drag and drop handlers
  const handleDragStart = (
    e: React.DragEvent, 
    participant: VentrataParticipant, 
    fromGroupIndex: number
  ) => {
    setDraggedParticipant({ participant, fromGroupIndex });
    e.dataTransfer.setData('application/json', JSON.stringify({ 
      participant, 
      fromGroupIndex 
    }));
    
    // Set a ghost image effect for better UX
    const ghostElement = document.createElement('div');
    ghostElement.classList.add('bg-background', 'p-2', 'rounded', 'border', 'shadow-md');
    ghostElement.textContent = participant.name;
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    
    // Remove the ghost element after a short delay
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toGroupIndex: number) => {
    e.preventDefault();
    
    if (!draggedParticipant) return;
    
    const { participant, fromGroupIndex } = draggedParticipant;
    
    if (fromGroupIndex === toGroupIndex) {
      toast.info("Participant is already in this group");
      return;
    }
    
    const updatedTourGroups = JSON.parse(JSON.stringify(tour.tourGroups));
    
    const sourceGroup = updatedTourGroups[fromGroupIndex];
    if (sourceGroup.participants) {
      sourceGroup.participants = sourceGroup.participants.filter(
        (p: VentrataParticipant) => p.id !== participant.id
      );
      sourceGroup.size -= participant.count;
    }
    
    const destGroup = updatedTourGroups[toGroupIndex];
    if (!destGroup.participants) {
      destGroup.participants = [];
    }
    destGroup.participants.push(participant);
    destGroup.size += participant.count;
    
    updateTourGroupsMutation.mutate(updatedTourGroups);
    
    setDraggedParticipant(null);
    toast.success(`Moved ${participant.name} to ${destGroup.name}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Management</CardTitle>
        <CardDescription>Details of participant groups and their assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
              {tour.tourGroups.map((group, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.size}</TableCell>
                  <TableCell>{group.entryTime}</TableCell>
                  <TableCell>{index === 0 ? tour.guide1 : tour.guide2 || tour.guide1}</TableCell>
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
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tour.tourGroups.map((group, groupIndex) => (
              <GroupCard
                key={groupIndex}
                group={group}
                groupIndex={groupIndex}
                tour={tour}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragStart={handleDragStart}
                onMoveClick={setSelectedParticipant}
                selectedParticipant={selectedParticipant}
                handleMoveParticipant={handleMoveParticipant}
                isMovePending={updateTourGroupsMutation.isPending}
              />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-muted-foreground">
          Group division is based on families or couples + singles and further divided into adults + children.
        </div>
        <Button 
          variant="outline" 
          size="sm"
        >
          <PenSquare className="mr-2 h-4 w-4" />
          Edit Groups
        </Button>
      </CardFooter>
    </Card>
  );
};

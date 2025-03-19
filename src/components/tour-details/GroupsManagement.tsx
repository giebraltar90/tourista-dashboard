
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenSquare, MoveHorizontal, UserCheck, ArrowLeftRight, Users, GripVertical } from "lucide-react";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/TourCard";
import { useUpdateTourGroups } from "@/hooks/useTourData";
import { DraggableParticipantProps, ParticipantDropZoneProps } from "@/components/tours/tour-card/types";

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

  // New drag and drop handlers
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
              <ParticipantDropZone 
                key={groupIndex} 
                groupIndex={groupIndex}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Card className="border-2 border-muted">
                  <CardHeader className="pb-2 bg-muted/30">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium">
                        {group.name}
                        {group.childCount ? (
                          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                            {group.childCount} {group.childCount === 1 ? 'child' : 'children'}
                          </Badge>
                        ) : null}
                      </CardTitle>
                      <Badge variant="outline">
                        {group.size} {group.size === 1 ? 'person' : 'people'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Guide: {groupIndex === 0 ? tour.guide1 : tour.guide2 || tour.guide1}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      {group.participants && group.participants.length > 0 ? (
                        group.participants.map((participant) => (
                          <DraggableParticipant
                            key={participant.id}
                            participant={participant}
                            groupIndex={groupIndex}
                            onDragStart={handleDragStart}
                          >
                            <ParticipantItem
                              participant={participant}
                              group={group}
                              groupIndex={groupIndex}
                              tour={tour}
                              onMoveClick={() => setSelectedParticipant({
                                participant,
                                fromGroupIndex: groupIndex
                              })}
                              selectedParticipant={selectedParticipant}
                              handleMoveParticipant={handleMoveParticipant}
                              isPending={updateTourGroupsMutation.isPending}
                            />
                          </DraggableParticipant>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No participants in this group
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </ParticipantDropZone>
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

// DraggableParticipant component
const DraggableParticipant = ({ 
  participant,
  groupIndex,
  onDragStart,
  children 
}: DraggableParticipantProps & { children: React.ReactNode }) => {
  return (
    <div 
      draggable={true}
      onDragStart={(e) => onDragStart(e, participant, groupIndex)}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
};

// ParticipantDropZone component
const ParticipantDropZone = ({ 
  groupIndex,
  onDrop,
  onDragOver, 
  children 
}: ParticipantDropZoneProps) => {
  return (
    <div 
      onDrop={(e) => onDrop(e, groupIndex)} 
      onDragOver={onDragOver}
      className="h-full"
    >
      {children}
    </div>
  );
};

interface ParticipantItemProps {
  participant: VentrataParticipant;
  group: VentrataTourGroup;
  groupIndex: number;
  tour: TourCardProps;
  onMoveClick: () => void;
  selectedParticipant: {
    participant: VentrataParticipant;
    fromGroupIndex: number;
  } | null;
  handleMoveParticipant: (toGroupIndex: number) => void;
  isPending: boolean;
}

const ParticipantItem = ({ 
  participant, 
  group, 
  groupIndex, 
  tour, 
  onMoveClick,
  selectedParticipant,
  handleMoveParticipant,
  isPending
}: ParticipantItemProps) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-muted transition-colors">
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 text-muted-foreground mr-2" />
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="font-medium flex items-center">
            {participant.name}
            {participant.childCount ? (
              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700">
                {participant.childCount} {participant.childCount === 1 ? 'child' : 'children'}
              </Badge>
            ) : null}
          </div>
          <div className="text-sm text-muted-foreground">
            {participant.count} {participant.count === 1 ? 'person' : 'people'} • Booking #{participant.bookingRef}
          </div>
        </div>
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onMoveClick}
          >
            <MoveHorizontal className="h-4 w-4 mr-2" />
            Move
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Move Participant</SheetTitle>
            <SheetDescription>
              Move {participant.name} ({participant.count} {participant.count === 1 ? 'person' : 'people'}) to another group
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md">
                <div className="font-medium">{participant.name}</div>
                <div className="text-sm text-muted-foreground">
                  Currently in: {group.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  Booking Reference: {participant.bookingRef}
                </div>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{participant.count} {participant.count === 1 ? 'person' : 'people'}</span>
                  {participant.childCount ? (
                    <span className="ml-2 text-blue-600 text-sm">
                      (incl. {participant.childCount} {participant.childCount === 1 ? 'child' : 'children'})
                    </span>
                  ) : null}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Select Destination Group
                </label>
                <Select 
                  onValueChange={(value) => handleMoveParticipant(parseInt(value))}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {tour.tourGroups.map((g, i) => (
                      i !== groupIndex && (
                        <SelectItem key={i} value={i.toString()}>
                          {g.name} ({g.size} {g.size === 1 ? 'person' : 'people'})
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button 
              type="submit" 
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></div>
                  Moving...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Move Participant
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

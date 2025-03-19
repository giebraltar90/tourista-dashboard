
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PenSquare, CheckCircle2, Clock } from "lucide-react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { useModifications } from "@/hooks/useModifications";
import { AddModificationDialog } from "./modifications/AddModificationDialog";
import { useState } from "react";

interface ModificationsTabProps {
  tour: TourCardProps;
}

export const ModificationsTab = ({ tour }: ModificationsTabProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { modifications } = useModifications(tour.id);
  
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  const adultTickets = Math.round(tour.numTickets * 0.7) || Math.round(totalParticipants * 0.7);
  const childTickets = (tour.numTickets || totalParticipants) - adultTickets;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Modifications</CardTitle>
        <CardDescription>View and manage all changes made to this tour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-sm font-medium">Special Instructions</h3>
            <p className="mt-2 text-muted-foreground">
              Group division: Split into families or couples + singles. Further divided into adults + children.
            </p>
            <p className="mt-2 text-muted-foreground">
              Adults: {adultTickets}, Children: {childTickets}
            </p>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Modification</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modifications && modifications.length > 0 ? (
                modifications.map((mod) => (
                  <TableRow key={mod.id}>
                    <TableCell>{format(new Date(mod.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{mod.user}</TableCell>
                    <TableCell>{mod.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {mod.status === "complete" ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                            <span>Complete</span>
                          </>
                        ) : (
                          <>
                            <Clock className="mr-2 h-4 w-4 text-amber-500" />
                            <span>Pending</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No modifications recorded yet
                  </TableCell>
                </TableRow>
              )}
              
              <TableRow>
                <TableCell>{format(new Date(), 'MMM d, yyyy')}</TableCell>
                <TableCell>System</TableCell>
                <TableCell>Tour created</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    <span>Complete</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button 
          variant="outline" 
          className="ml-auto"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <PenSquare className="mr-2 h-4 w-4" />
          Add Modification
        </Button>
      </CardFooter>
      
      <AddModificationDialog
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
        tourId={tour.id}
      />
    </Card>
  );
};

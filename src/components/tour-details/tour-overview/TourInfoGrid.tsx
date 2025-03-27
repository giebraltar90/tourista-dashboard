
import { TourCardProps } from "@/components/tours/tour-card/types";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface TourInfoGridProps {
  tour: TourCardProps;
}

export const TourInfoGrid = ({ tour }: TourInfoGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Tour Name</h3>
          <p className="font-semibold">{tour.tourName}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Date</h3>
          <p className="font-semibold">{format(new Date(tour.date), 'MMMM d, yyyy')}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Location</h3>
          <p className="font-semibold">{tour.location}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Start Time</h3>
          <p className="font-semibold">{tour.startTime}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Reference Code</h3>
          <p className="font-semibold">{tour.referenceCode}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Tour Type</h3>
          <p className="font-semibold capitalize">{tour.tourType}</p>
        </CardContent>
      </Card>
    </div>
  );
};

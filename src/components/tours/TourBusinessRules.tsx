
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export function TourBusinessRules() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Business Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Guides</h3>
            <p className="text-sm text-muted-foreground">
              Up to two guides per tour (high season sometimes 3 guides)
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Booking Capacity</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Standard: 24 bookings per tour time (split into two even groups)</li>
              <li>• Exceptions: Max. would be 29 (split into two even groups)</li>
              <li>• High Season: Adjust to 36 bookings (split into three groups)</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Group Division</h3>
            <p className="text-sm text-muted-foreground">
              Split into families or couples + singles. Further divided into adults + children.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Tickets (Versailles Tours)</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Adult tickets: Required for guests aged 18 and above</li>
              <li>• Children tickets: For guests below 18 years</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Minimum Participants</h3>
            <p className="text-sm text-muted-foreground">
              4 people minimum. 3 or less will be moved to another tour or starting time.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

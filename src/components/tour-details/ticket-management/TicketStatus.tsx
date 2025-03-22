
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, ShoppingCart, Users } from "lucide-react";

export interface TicketStatusProps {
  purchasedCount: number;
  pendingCount: number;
  distributedCount: number;
}

export const TicketStatus = ({ purchasedCount, pendingCount, distributedCount }: TicketStatusProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Ticket Status</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <ShoppingCart className="h-5 w-5 mb-2 text-blue-500" />
            <div className="text-center">
              <div className="text-2xl font-bold">{purchasedCount}</div>
              <div className="text-sm text-muted-foreground">Purchased</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Ticket className="h-5 w-5 mb-2 text-yellow-500" />
            <div className="text-center">
              <div className="text-2xl font-bold">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Users className="h-5 w-5 mb-2 text-green-500" />
            <div className="text-center">
              <div className="text-2xl font-bold">{distributedCount}</div>
              <div className="text-sm text-muted-foreground">Required</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

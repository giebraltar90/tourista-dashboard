
import { Badge } from "@/components/ui/badge";
import { TicketStatusProps } from "./types";

export const TicketStatus = ({ 
  purchasedCount, 
  pendingCount, 
  distributedCount 
}: TicketStatusProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Ticket Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center justify-between bg-green-100 p-4 rounded-md">
          <span className="text-green-800">Purchased</span>
          <Badge variant="outline" className="bg-green-200 text-green-800 border-green-300">
            {purchasedCount}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between bg-yellow-100 p-4 rounded-md">
          <span className="text-yellow-800">Pending</span>
          <Badge variant="outline" className="bg-yellow-200 text-yellow-800 border-yellow-300">
            {pendingCount}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between bg-blue-100 p-4 rounded-md">
          <span className="text-blue-800">Distributed</span>
          <Badge variant="outline" className="bg-blue-200 text-blue-800 border-blue-300">
            {distributedCount}
          </Badge>
        </div>
      </div>
    </div>
  );
};

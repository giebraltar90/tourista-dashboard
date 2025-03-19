import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Tag,
  AlertTriangle
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { VentrataTourGroup } from "@/types/ventrata";

export interface TourCardProps {
  id: string;
  date: Date;
  location: string;
  tourName: string;
  tourType: 'food' | 'private' | 'default';
  startTime: string;
  referenceCode: string;
  guide1: string;
  guide2?: string;
  tourGroups: VentrataTourGroup[];
  numTickets?: number;
}

export function TourCard({
  id,
  date,
  location,
  tourName,
  tourType,
  startTime,
  referenceCode,
  guide1,
  guide2,
  tourGroups,
  numTickets
}: TourCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate total participants
  const totalParticipants = tourGroups.reduce((sum, group) => sum + group.size, 0);
  
  // Format date to display day and month
  const formattedDate = format(date, 'dd MMM yyyy');
  const dayOfWeek = format(date, 'EEEE');
  
  // Determine color based on tour type
  const tourColor = 
    tourType === 'food' ? 'tour-food' : 
    tourType === 'private' ? 'tour-private' : 
    'tour-default';
    
  // Format location for display
  const locationFormatted = location.split(' ')[0].toUpperCase();
  
  // Determine if the tour has below minimum participants (4)
  const isBelowMinimum = totalParticipants < 4;
  
  // Determine if high season (3 groups)
  const isHighSeason = tourGroups.length > 2;
  
  // Determine capacity utilization
  const capacity = isHighSeason ? 36 : 24;
  const capacityPercentage = Math.round((totalParticipants / capacity) * 100);
  
  return (
    <Card 
      className={cn(
        "tour-item overflow-hidden transition-all duration-300 border border-border/60",
        "hover:shadow-md hover:border-primary/20",
        isHovered && "shadow-md border-primary/20",
        isBelowMinimum && "border-yellow-300"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex">
        {/* Left side - Date display */}
        <div className={cn(
          "w-20 flex flex-col items-center justify-center p-4 text-white font-medium",
          `bg-${tourColor}`,
          "transition-all duration-300",
          isHovered && "w-24"
        )}>
          <span className="text-xs font-light opacity-80">{dayOfWeek}</span>
          <span className="text-xl mt-1">{format(date, 'd')}</span>
          <span className="text-sm">{format(date, 'MMM')}</span>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
            <div>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2 bg-secondary/50">
                  {locationFormatted}
                </Badge>
                <h3 className="font-medium text-base">{tourName}</h3>
              </div>
              <div className="flex items-center mt-1.5 text-xs text-muted-foreground">
                <Tag className="h-3 w-3 mr-1" />
                <span>#{referenceCode}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center text-sm font-medium">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                {startTime}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 pt-2 pb-3">
            <div className="flex flex-wrap gap-y-2">
              <div className="w-1/2 flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{guide1}{guide2 ? `, ${guide2}` : ''}</span>
              </div>
              
              <div className="w-1/2 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{location}</span>
              </div>
              
              <div className="w-full mt-1">
                <div className="flex items-center gap-1.5">
                  {tourGroups.map((group, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="flex items-center">
                            <span className="mr-1">{group.name}</span>
                            <span className="bg-background/80 px-1.5 rounded-sm text-xs">
                              {group.size}
                            </span>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Entry: {group.entryTime}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Capacity meter */}
            <div className="mt-3 w-full">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Capacity</span>
                <span className={cn(
                  capacityPercentage > 90 ? "text-red-500" : 
                  capacityPercentage > 75 ? "text-amber-500" : 
                  "text-green-500"
                )}>
                  {totalParticipants}/{capacity}
                </span>
              </div>
              <div className="w-full bg-secondary/30 rounded-full h-1.5">
                <div 
                  className={cn(
                    "h-1.5 rounded-full",
                    capacityPercentage > 90 ? "bg-red-500" : 
                    capacityPercentage > 75 ? "bg-amber-500" : 
                    "bg-green-500"
                  )} 
                  style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="px-4 py-3 border-t border-border/60 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 text-primary hover:bg-primary/10">
                {totalParticipants} Participants
              </Badge>
              
              {numTickets && (
                <Badge variant="outline" className="bg-secondary/50">
                  {numTickets} Tickets
                </Badge>
              )}
              
              {isBelowMinimum && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Below Minimum
                </Badge>
              )}
              
              {isHighSeason && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  High Season
                </Badge>
              )}
            </div>
            
            <Link to={`/tours/${id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "transition-all duration-300",
                  isHovered ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                )}
              >
                Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}

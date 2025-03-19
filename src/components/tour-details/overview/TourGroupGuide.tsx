
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, UserPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { useAssignGuide } from "@/hooks/group-management/useAssignGuide";
import { toast } from "sonner";

interface TourGroupGuideProps {
  tour: TourCardProps;
  group: VentrataTourGroup;
  groupIndex: number;
  guideName: string;
  guideInfo: GuideInfo | null;
  guideOptions: Array<{
    id: string;
    name: string;
    info: GuideInfo | null;
  }>;
}

export const TourGroupGuide = ({ 
  tour, 
  group, 
  groupIndex, 
  guideName, 
  guideInfo, 
  guideOptions 
}: TourGroupGuideProps) => {
  const { assignGuide } = useAssignGuide(tour.id);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(group.guideId || "_none");
  
  // Update selected guide when group.guideId changes
  useEffect(() => {
    setSelectedGuide(group.guideId || "_none");
  }, [group.guideId]);
  
  const getGuideTypeBadgeColor = (guideType?: string) => {
    if (!guideType) return "bg-gray-100 text-gray-800";
    
    switch (guideType) {
      case "GA Ticket":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "GA Free":
        return "bg-green-100 text-green-800 border-green-300";
      case "GC":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAssignGuide = async (guideId: string) => {
    setIsAssigning(true);
    try {
      await assignGuide(groupIndex, guideId);
      setSelectedGuide(guideId);
      toast.success(`Guide assigned to Group ${groupIndex + 1}`);
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide");
    } finally {
      setIsAssigning(false);
    }
  };

  // Check if actually assigned and not just "Unassigned" text
  const isGuideAssigned = !!group.guideId && guideName !== "Unassigned";

  return (
    <div className={`p-4 rounded-lg border ${isGuideAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-base">Group {groupIndex + 1}: {group.name}</h3>
        <Badge variant="outline" className="bg-blue-50">
          {group.size} participants
        </Badge>
      </div>
      
      <div className="flex items-center space-x-3 mt-2">
        <div className={`p-2 rounded-full ${isGuideAssigned ? 'bg-green-100' : 'bg-gray-100'}`}>
          {isGuideAssigned ? <User className="h-5 w-5 text-green-600" /> : <UserPlus className="h-5 w-5 text-gray-400" />}
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium">
            Guide: {isGuideAssigned ? guideName : "Not assigned"}
          </p>
          {guideInfo && (
            <Badge variant="outline" className={`mt-1 text-xs ${getGuideTypeBadgeColor(guideInfo.guideType)}`}>
              {guideInfo.guideType}
            </Badge>
          )}
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              {isGuideAssigned ? "Change Guide" : "Assign Guide"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Assign Guide to Group {groupIndex + 1}</h4>
              <Select 
                onValueChange={(value) => handleAssignGuide(value)}
                value={selectedGuide}
                disabled={isAssigning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select guide" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">None (Unassigned)</SelectItem>
                  {guideOptions.map((guide) => (
                    guide.name ? (
                      <SelectItem key={guide.id} value={guide.id}>
                        {guide.name}
                      </SelectItem>
                    ) : null
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};


import { Badge } from "@/components/ui/badge";
import { GuideInfo } from "@/types/ventrata";

interface GuideBadgeProps {
  guideName: string;
  guideInfo: GuideInfo | null;
  isAssigned: boolean;
}

export const GuideBadge = ({ guideName, guideInfo, isAssigned }: GuideBadgeProps) => {
  if (!isAssigned) return <span>Not assigned</span>;
  
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

  return (
    <>
      <span className="text-sm font-medium">
        {guideName}
      </span>
      {isAssigned && guideInfo && (
        <Badge variant="outline" className={`ml-2 text-xs ${getGuideTypeBadgeColor(guideInfo.guideType)}`}>
          {guideInfo.guideType}
        </Badge>
      )}
    </>
  );
};

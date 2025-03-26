
import React from "react";
import { Guide, GuideInfo } from "@/types/ventrata";
import { Badge } from "@/components/ui/badge";

export const getGuideTypeBadge = (guideType: string | undefined): JSX.Element => {
  if (!guideType) return <Badge variant="outline">Unknown</Badge>;
  
  switch (guideType) {
    case 'GA Ticket':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">GA Ticket</Badge>;
    case 'GA Free':
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">GA Free</Badge>;
    case 'GC':
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">GC</Badge>;
    default:
      return <Badge variant="outline">{guideType}</Badge>;
  }
};

export const getGuideTypeDescription = (guideType: string | undefined): string => {
  if (!guideType) return "Unknown guide type";
  
  switch (guideType) {
    case 'GA Ticket':
      return "Guide needs an adult ticket for entry";
    case 'GA Free':
      return "Guide needs a child ticket for entry";
    case 'GC':
      return "Guide can enter without a ticket";
    default:
      return `Guide type: ${guideType}`;
  }
};

export const formatGuideDetails = (guide: Guide | GuideInfo | null): string => {
  if (!guide) return "Unknown guide";
  
  const guideName = guide.name || "Unnamed";
  const guideType = guide.guideType || guide.guide_type || "Unknown type";
  
  return `${guideName} (${guideType})`;
};

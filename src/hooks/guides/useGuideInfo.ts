
import { useMemo } from "react";
import { GuideInfo, GuideType } from "@/types/ventrata";
import { useGuideData } from "./useGuideData";

export function useGuideInfo(guideName: string): GuideInfo | null {
  const { guides = [] } = useGuideData() || { guides: [] };
  
  return useMemo(() => {
    if (!guideName) return null;
    
    const guide = guides.find(g => g.name === guideName);
    if (guide) return guide;
    
    // If not found by name, create a basic guide info object
    return {
      name: guideName,
      birthday: new Date(),
      guideType: "GA Free" as GuideType
    };
  }, [guides, guideName]);
}

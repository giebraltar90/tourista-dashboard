
import { useState, useEffect } from "react";
import { GuideInfo } from "@/types/ventrata";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { logger } from "@/utils/logger";

/**
 * Hook for processing guide data from multiple sources and preparing it for selection
 */
export const useProcessGuides = (
  tour: any,
  allGuides: any[] = [],
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
) => {
  const [validGuides, setValidGuides] = useState<any[]>([]);
  
  // Prepare guide data when component mounts or dependencies change
  useEffect(() => {
    // Create an array of valid guides with properly formatted IDs
    const guides = [];
    
    logger.debug("GUIDE SELECT DEBUG: Preparing guides for selection dialog", {
      dbGuidesCount: allGuides.length,
      primaryGuides: {
        guide1: tour.guide1 ? { name: tour.guide1, guideType: guide1Info?.guideType } : null,
        guide2: tour.guide2 ? { name: tour.guide2, guideType: guide2Info?.guideType } : null,
        guide3: tour.guide3 ? { name: tour.guide3, guideType: guide3Info?.guideType } : null,
      }
    });
    
    // Add all guides from the database first
    if (Array.isArray(allGuides)) {
      allGuides.forEach(dbGuide => {
        if (dbGuide.name && dbGuide.id) {
          // Avoid duplicating any guides already in the list
          if (!guides.some(g => g.id === dbGuide.id)) {
            guides.push({ 
              id: dbGuide.id, 
              name: dbGuide.name, 
              info: dbGuide 
            });
            logger.debug(`GUIDE SELECT DEBUG: Added DB guide: ${dbGuide.name}, guideType: ${dbGuide.guideType}`);
          }
        }
      });
    }
    
    // Process primary guides (guide1, guide2, guide3)
    processGuide(tour.guide1, guide1Info, allGuides, guides, "guide1");
    processGuide(tour.guide2, guide2Info, allGuides, guides, "guide2");
    processGuide(tour.guide3, guide3Info, allGuides, guides, "guide3");
    
    // Filter out any guides with empty names or IDs
    const filtered = guides.filter(guide => guide.name && guide.id);
    
    // Sort guides alphabetically by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    logger.debug("GUIDE SELECT DEBUG: Prepared valid guides:", 
      filtered.map(g => ({ id: g.id, name: g.name, guideType: g.info?.guideType }))
    );
    
    setValidGuides(filtered);
  }, [tour, guide1Info, guide2Info, guide3Info, allGuides]);
  
  /**
   * Helper function to process a single guide and add it to the guides array
   */
  const processGuide = (
    guideId: string | undefined,
    guideInfo: GuideInfo | null,
    allGuides: any[],
    guidesArray: any[],
    guideName: string
  ) => {
    if (!guideId) return;
    
    // Try to find a database guide with this name or ID
    const dbGuide = allGuides.find(g => 
      g.name === guideId || 
      (isValidUuid(guideId) && g.id === guideId)
    );
    
    if (dbGuide && isValidUuid(dbGuide.id)) {
      if (!guidesArray.some(g => g.id === dbGuide.id)) {
        guidesArray.push({
          id: dbGuide.id,
          name: dbGuide.name,
          info: guideInfo || dbGuide
        });
        logger.debug(`GUIDE SELECT DEBUG: Added ${guideName} from DB match: ${dbGuide.name}, guideType: ${dbGuide.guideType}`);
      }
    } else {
      // If the guide ID is already a UUID, use it directly
      if (isValidUuid(guideId)) {
        guidesArray.push({ 
          id: guideId, 
          name: guideInfo?.name || `Guide ${guideId.substring(0, 6)}...`, 
          info: guideInfo 
        });
        logger.debug(`GUIDE SELECT DEBUG: Added ${guideName} as UUID: ${guideId}, name: ${guideInfo?.name || 'Unknown'}`);
      } else {
        // Fall back to guide ID
        guidesArray.push({ 
          id: guideName, 
          name: guideId, 
          info: guideInfo 
        });
        logger.debug(`GUIDE SELECT DEBUG: Added ${guideName} as named guide: ${guideId}, guideType: ${guideInfo?.guideType}`);
      }
    }
  };
  
  return { validGuides };
};


import { GuideInfo, GuideType } from "@/types/ventrata";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { logger } from "@/utils/logger";

export const processGuideInfo = (guide: any) => {
  // Handle different types of birthday fields safely
  let birthdayStr = "";
  if (guide.birthday) {
    if (typeof guide.birthday === 'object' && guide.birthday !== null) {
      birthdayStr = guide.birthday.toString();
    } else if (typeof guide.birthday === 'string') {
      birthdayStr = guide.birthday;
    }
  }
  
  return {
    id: guide.id,
    name: guide.name,
    guide_type: guide.guide_type || "GA Ticket",
    birthday: birthdayStr,
    guideType: guide.guide_type || "GA Ticket",
    info: {
      name: guide.name,
      birthday: guide.birthday !== null && guide.birthday !== undefined 
        ? (typeof guide.birthday === 'object' 
          ? guide.birthday 
          : new Date(String(guide.birthday)))
        : new Date(),
      guideType: (guide.guide_type || "GA Ticket") as GuideType
    }
  };
};

export const addSpecialGuides = (validGuides: any[], tour: any, guide1Info: GuideInfo | null, guide2Info: GuideInfo | null, guide3Info: GuideInfo | null) => {
  const updatedGuides = [...validGuides];
  
  // Add special guides if they exist in the tour
  if (tour.guide1 && !updatedGuides.some(g => g.id === tour.guide1)) {
    updatedGuides.push({
      id: "guide1",
      name: tour.guide1,
      guide_type: guide1Info?.guideType || "GA Ticket",
      birthday: guide1Info?.birthday ? guide1Info.birthday.toISOString() : "",
      guideType: guide1Info?.guideType || "GA Ticket",
      info: {
        name: tour.guide1,
        birthday: guide1Info?.birthday || new Date(),
        guideType: (guide1Info?.guideType || "GA Ticket") as GuideType
      }
    });
  }
  
  if (tour.guide2 && !updatedGuides.some(g => g.id === tour.guide2)) {
    updatedGuides.push({
      id: "guide2",
      name: tour.guide2,
      guide_type: guide2Info?.guideType || "GA Ticket",
      birthday: guide2Info?.birthday ? guide2Info.birthday.toISOString() : "",
      guideType: guide2Info?.guideType || "GA Ticket",
      info: {
        name: tour.guide2,
        birthday: guide2Info?.birthday || new Date(),
        guideType: (guide2Info?.guideType || "GA Ticket") as GuideType
      }
    });
  }
  
  if (tour.guide3 && !updatedGuides.some(g => g.id === tour.guide3)) {
    updatedGuides.push({
      id: "guide3",
      name: tour.guide3,
      guide_type: guide3Info?.guideType || "GA Ticket",
      birthday: guide3Info?.birthday ? guide3Info.birthday.toISOString() : "",
      guideType: guide3Info?.guideType || "GA Ticket",
      info: {
        name: tour.guide3,
        birthday: guide3Info?.birthday || new Date(),
        guideType: (guide3Info?.guideType || "GA Ticket") as GuideType
      }
    });
  }
  
  return updatedGuides;
};

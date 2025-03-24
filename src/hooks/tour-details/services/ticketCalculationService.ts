
// This file is now a re-export file that uses our modular ticket calculation system
import { 
  doesLocationRequireGuideTickets,
  doesGuideNeedTicket,
  calculateCompleteTicketRequirements
} from './ticket-calculation';

// Re-export all functions from modular system
export {
  doesLocationRequireGuideTickets,
  doesGuideNeedTicket,
  calculateCompleteTicketRequirements
};

// Additional exports for backwards compatibility
export const locationRequiresGuideTickets = doesLocationRequireGuideTickets;
export const guideTypeNeedsTicket = (guideType: string) => {
  return doesGuideNeedTicket(guideType, '').needsTicket;
};
export const determineTicketTypeForGuide = (guideType: string) => {
  return doesGuideNeedTicket(guideType, '').ticketType;
};
export const getGuideTicketRequirement = (guideInfo: any, location: string) => {
  if (!guideInfo) return { needsTicket: false, ticketType: null };
  const result = doesGuideNeedTicket(guideInfo.guideType, location);
  return result;
};
export const findAssignedGuides = (tourGroups: any[] = [], guide1Info: any, guide2Info: any, guide3Info: any) => {
  const assignedGuideIds = new Set<string>();
  if (guide1Info) assignedGuideIds.add("guide1");
  if (guide2Info) assignedGuideIds.add("guide2");
  if (guide3Info) assignedGuideIds.add("guide3");
  return assignedGuideIds;
};
export const processGuideTicketRequirement = (guideInfo: any, location: string) => {
  if (!guideInfo) return { needsTicket: false, ticketType: null };
  const result = doesGuideNeedTicket(guideInfo.guideType, location);
  return {
    guideInfo,
    guideName: guideInfo.name || "Unknown guide",
    guideType: guideInfo.guideType || "unknown",
    needsTicket: result.needsTicket,
    ticketType: result.ticketType
  };
};
export const calculateGuideTicketsNeeded = (guide1Info: any, guide2Info: any, guide3Info: any, location: string, tourGroups: any[] = []) => {
  const result = calculateCompleteTicketRequirements(guide1Info, guide2Info, guide3Info, location, tourGroups);
  return result.guideTickets;
};
export const calculateCompleteGuideTicketRequirements = calculateCompleteTicketRequirements;


import { doesGuideNeedTicket, getGuideTicketType } from "@/hooks/useGuideData";
import { GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/TourCard";

export const useTicketCountLogic = (
  tour: TourCardProps, 
  guide1Info: GuideInfo | null, 
  guide2Info: GuideInfo | null, 
  guide3Info: GuideInfo | null
) => {
  // Calculate total participants
  const totalParticipants = tour.tourGroups.reduce((sum, group) => {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return sum + group.participants.reduce((groupSum, p) => groupSum + (p.count || 1), 0);
    }
    return sum + group.size;
  }, 0);
  
  // Calculate child count
  const totalChildCount = tour.tourGroups.reduce((sum, group) => {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return sum + group.participants.reduce((groupSum, p) => groupSum + (p.childCount || 0), 0);
    }
    return sum + (group.childCount || 0);
  }, 0);
  
  const adultTickets = totalParticipants - totalChildCount;
  const childTickets = totalChildCount;
  
  const isVersaillesTour = tour.location.toLowerCase().includes('versailles');
  
  // Calculate guide ticket needs
  const guide1NeedsTicket = guide1Info ? doesGuideNeedTicket(guide1Info, tour.location) : false;
  const guide2NeedsTicket = guide2Info ? doesGuideNeedTicket(guide2Info, tour.location) : false;
  const guide3NeedsTicket = guide3Info ? doesGuideNeedTicket(guide3Info, tour.location) : false;
  
  const guide1TicketType = guide1Info ? getGuideTicketType(guide1Info) : null;
  const guide2TicketType = guide2Info ? getGuideTicketType(guide2Info) : null;
  const guide3TicketType = guide3Info ? getGuideTicketType(guide3Info) : null;
  
  // Calculate required tickets
  const requiredAdultTickets = adultTickets + 
    (guide1TicketType === 'adult' ? 1 : 0) + 
    (guide2TicketType === 'adult' ? 1 : 0) +
    (guide3TicketType === 'adult' ? 1 : 0);
    
  const requiredChildTickets = childTickets + 
    (guide1TicketType === 'child' ? 1 : 0) + 
    (guide2TicketType === 'child' ? 1 : 0) +
    (guide3TicketType === 'child' ? 1 : 0);
  
  const availableTickets = tour.numTickets || totalParticipants;
  const requiredTickets = requiredAdultTickets + requiredChildTickets;
  const hasEnoughTickets = availableTickets >= requiredTickets;

  // Prepare guide ticket information for display
  const adultGuideTickets = [];
  if (guide1Info && guide1TicketType === 'adult') {
    adultGuideTickets.push({
      guideName: guide1Info.name,
      guideType: 'GA Ticket',
      birthday: undefined
    });
  }
  if (guide2Info && guide2TicketType === 'adult') {
    adultGuideTickets.push({
      guideName: guide2Info.name,
      guideType: 'GA Ticket',
      birthday: undefined
    });
  }
  if (guide3Info && guide3TicketType === 'adult') {
    adultGuideTickets.push({
      guideName: guide3Info.name,
      guideType: 'GA Ticket',
      birthday: undefined
    });
  }

  const childGuideTickets = [];
  if (guide1Info && guide1TicketType === 'child') {
    childGuideTickets.push({
      guideName: guide1Info.name,
      guideType: 'GA Free',
      birthday: guide1Info.birthday
    });
  }
  if (guide2Info && guide2TicketType === 'child') {
    childGuideTickets.push({
      guideName: guide2Info.name,
      guideType: 'GA Free',
      birthday: guide2Info.birthday
    });
  }
  if (guide3Info && guide3TicketType === 'child') {
    childGuideTickets.push({
      guideName: guide3Info.name,
      guideType: 'GA Free',
      birthday: guide3Info.birthday
    });
  }

  return {
    adultTickets,
    childTickets,
    isVersaillesTour,
    guide1NeedsTicket,
    guide2NeedsTicket,
    guide3NeedsTicket,
    guide1TicketType,
    guide2TicketType,
    guide3TicketType,
    requiredAdultTickets,
    requiredChildTickets,
    availableTickets,
    requiredTickets,
    hasEnoughTickets,
    adultGuideTickets,
    childGuideTickets,
    totalParticipants
  };
};

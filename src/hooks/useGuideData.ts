
import { useQuery } from '@tanstack/react-query';
import { fetchAllGuides } from "@/services/api/guideApi";
import { GuideInfo } from "@/types/ventrata";

export function useGuideData() {
  const {
    data: guides,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["guides"],
    queryFn: fetchAllGuides,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return { guides, isLoading, error, refetch };
}

// Re-export guide tickets functions for backward compatibility
export { doesGuideNeedTicket, getGuideTicketType } from "./guides/useGuideTickets";

// Re-export other guide hooks
export { useGuideTours } from "./guides/useGuideTours";
export { useGuideInfo } from "./guides/useGuideInfo";

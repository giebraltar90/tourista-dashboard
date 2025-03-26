
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { GuideInfo, Guide as GuideType } from "@/types/ventrata";

export interface Guide {
  id: string;
  name: string;
  guide_type: string;
  birthday?: string;
}

/**
 * Fetch all guides from the database
 */
const fetchAllGuides = async (): Promise<Guide[]> => {
  const { data, error } = await supabase
    .from("guides")
    .select("id, name, guide_type, birthday")
    .order("name");
    
  if (error) {
    console.error("Error fetching guides:", error);
    throw error;
  }
  
  return data || [];
};

export function useGuideData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["guides"],
    queryFn: fetchAllGuides,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Convert the guides to ensure consistent property names
  const guides = data?.map(guide => ({
    id: guide.id,
    name: guide.name,
    guide_type: guide.guide_type,
    guideType: guide.guide_type, // Add consistent naming
    birthday: guide.birthday
  })) || [];
  
  return {
    guides,
    isLoading,
    error
  };
}

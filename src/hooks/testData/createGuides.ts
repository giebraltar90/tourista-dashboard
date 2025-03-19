
import { supabase } from "@/integrations/supabase/client";
import { GuideType } from "./helpers";

/**
 * Creates test guide data in the database
 */
export const createTestGuides = async () => {
  console.log("Creating test guides...");
  
  // Create test guides
  const guides = [
    { name: "Noéma Weber", guide_type: "GA Free" as GuideType, birthday: "1998-12-03" },
    { name: "Jean Dupont", guide_type: "GA Ticket" as GuideType, birthday: "1985-03-22" },
    { name: "Sophie Miller", guide_type: "GC" as GuideType, birthday: "1990-10-05" },
    { name: "Carlos Martinez", guide_type: "GA Ticket" as GuideType, birthday: "1988-05-18" },
    { name: "Maria Garcia", guide_type: "GA Free" as GuideType, birthday: "1995-07-15" },
    { name: "Tobias Schmidt", guide_type: "GC" as GuideType, birthday: "1982-08-27" }
  ];
  
  const { data: guideData, error: guideError } = await supabase
    .from('guides')
    .insert(guides)
    .select();
    
  if (guideError) {
    console.error("Error creating guides:", guideError);
    throw guideError;
  }
  
  console.log("Created test guides:", guideData);
  return guideData || [];
};

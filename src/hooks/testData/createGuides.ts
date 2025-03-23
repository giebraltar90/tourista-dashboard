
import { supabase } from "@/integrations/supabase/client";
import { GuideType } from "./helpers";

/**
 * Creates test guide data in the database
 */
export const createTestGuides = async () => {
  console.log("Creating test guides...");
  
  // Create test guides with all different guide types
  const guides = [
    { name: "Noéma Weber", guide_type: "GA Free" as GuideType, birthday: "1998-12-03" },
    { name: "Jean Dupont", guide_type: "GA Ticket" as GuideType, birthday: "1985-03-22" },
    { name: "Sophie Miller", guide_type: "GC" as GuideType, birthday: "1990-10-05" },
    { name: "Carlos Martinez", guide_type: "GA Ticket" as GuideType, birthday: "1988-05-18" },
    { name: "Maria Garcia", guide_type: "GA Free" as GuideType, birthday: "1995-07-15" },
    { name: "Tobias Schmidt", guide_type: "GC" as GuideType, birthday: "1982-08-27" },
    { name: "Emma Johnson", guide_type: "GI" as GuideType, birthday: "1991-04-12" },
    { name: "Lucas Müller", guide_type: "GT" as GuideType, birthday: "1987-09-30" }
  ];
  
  // First check if guides already exist
  const { data: existingGuides } = await supabase
    .from('guides')
    .select('name');
  
  // Filter out any guides that already exist
  const uniqueGuides = guides.filter(guide => 
    !existingGuides?.some(existing => existing.name === guide.name)
  );
  
  if (uniqueGuides.length === 0) {
    console.log("All guides already exist, skipping creation");
    // Return existing guides
    const { data } = await supabase.from('guides').select('*');
    return data || [];
  }
  
  const { data: guideData, error: guideError } = await supabase
    .from('guides')
    .insert(uniqueGuides)
    .select();
    
  if (guideError) {
    console.error("Error creating guides:", guideError);
    throw guideError;
  }
  
  // Get all guides including ones that already existed
  const { data: allGuides } = await supabase.from('guides').select('*');
  
  console.log("Created test guides:", guideData);
  return allGuides || [];
};

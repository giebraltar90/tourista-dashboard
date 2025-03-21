
import { supabase } from "@/integrations/supabase/client";

// Default logo path that's used as a fallback
export const DEFAULT_LOGO = "/lovable-uploads/8b1b9ca2-3a0a-4744-9b6a-a65bc97e8958.png";
export const DEFAULT_OG_IMAGE = "/og-image.png";
export const DEFAULT_FAVICON = "/favicon.ico";

/**
 * Get a setting from the database
 */
export const getSetting = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }

    return data?.setting_value || null;
  } catch (error) {
    console.error(`Error in getSetting for ${key}:`, error);
    return null;
  }
};

/**
 * Get the app logo from settings
 */
export const getAppLogo = async (): Promise<string> => {
  const logo = await getSetting('appLogo');
  return logo || DEFAULT_LOGO;
};

/**
 * Get the OG image from settings
 */
export const getOgImage = async (): Promise<string> => {
  const ogImage = await getSetting('ogImage');
  return ogImage || DEFAULT_OG_IMAGE;
};

/**
 * Get the favicon from settings
 */
export const getFavicon = async (): Promise<string> => {
  const favicon = await getSetting('favicon');
  return favicon || DEFAULT_FAVICON;
};

/**
 * Update a setting in the database
 */
export const updateSetting = async (key: string, value: string): Promise<boolean> => {
  try {
    console.log(`Updating setting ${key} with value ${value.substring(0, 50)}...`);
    
    // First check if the setting already exists
    const { data: existingSetting } = await supabase
      .from('app_settings')
      .select('id')
      .eq('setting_key', key)
      .maybeSingle();
    
    let result;
    
    if (existingSetting) {
      // Update existing setting
      result = await supabase
        .from('app_settings')
        .update({ 
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);
    } else {
      // Insert new setting
      result = await supabase
        .from('app_settings')
        .insert({ 
          setting_key: key, 
          setting_value: value,
          updated_at: new Date().toISOString()
        });
    }

    if (result.error) {
      console.error(`Error updating setting ${key}:`, result.error);
      return false;
    }

    console.log(`Successfully updated setting ${key}`);
    return true;
  } catch (error) {
    console.error(`Error in updateSetting for ${key}:`, error);
    return false;
  }
};

/**
 * Update the app logo in settings
 */
export const updateAppLogo = async (logoUrl: string): Promise<boolean> => {
  return await updateSetting('appLogo', logoUrl);
};

/**
 * Update the OG image in settings
 */
export const updateOgImage = async (imageUrl: string): Promise<boolean> => {
  return await updateSetting('ogImage', imageUrl);
};

/**
 * Update the favicon in settings
 */
export const updateFavicon = async (faviconUrl: string): Promise<boolean> => {
  return await updateSetting('favicon', faviconUrl);
};

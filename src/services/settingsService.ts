
import { supabase } from "@/integrations/supabase/client";

// Default logo path that's used as a fallback
export const DEFAULT_LOGO = "/lovable-uploads/8b1b9ca2-3a0a-4744-9b6a-a65bc97e8958.png";

/**
 * Get a setting from the database
 */
export const getSetting = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();

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
 * Update a setting in the database
 */
export const updateSetting = async (key: string, value: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ 
        setting_key: key, 
        setting_value: value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      });

    if (error) {
      console.error(`Error updating setting ${key}:`, error);
      return false;
    }

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

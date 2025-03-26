
-- Will be used for manual SQL migration process

-- Create a function that updates a tour group without triggering materialized view refreshes
CREATE OR REPLACE FUNCTION public.update_group_guide_no_triggers(
  p_group_id UUID, 
  p_guide_id UUID, 
  p_name TEXT
) RETURNS VOID AS $$
BEGIN
  -- Update the tour_group directly, bypassing triggers that might refresh materialized views
  UPDATE tour_groups
  SET 
    guide_id = p_guide_id,
    name = p_name,
    updated_at = NOW()
  WHERE id = p_group_id;
END;
$$ LANGUAGE plpgsql;

-- Add a function for updating tour group without refreshing materialized view
CREATE OR REPLACE FUNCTION public.update_tour_group_without_refresh(
  p_group_id UUID,
  p_guide_id UUID,
  p_name TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE tour_groups
  SET 
    guide_id = p_guide_id,
    name = p_name,
    updated_at = NOW()
  WHERE id = p_group_id;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in update_tour_group_without_refresh: %', SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

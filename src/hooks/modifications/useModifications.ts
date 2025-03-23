
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useModifications = (tourId: string) => {
  const queryClient = useQueryClient();

  const { data: modifications, isLoading, error, refetch } = useQuery({
    queryKey: ['modifications', tourId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('modifications')
          .select('*')
          .eq('tour_id', tourId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching modifications:", error);
          throw new Error(`Failed to fetch modifications: ${error.message}`);
        }
        
        return data || [];
      } catch (error) {
        console.error("Error in modifications query:", error);
        toast.error(`Failed to fetch modifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
      }
    },
    enabled: !!tourId
  });

  const modificationMutation = useMutation({
    mutationFn: async ({ description, details }: { description: string, details?: any }) => {
      try {
        const newModification = {
          tour_id: tourId,
          description,
          details,
          status: 'complete' as const, // TypeScript needs this explicit type
          created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('modifications')
          .insert([newModification])
          .select()
          .single();
          
        if (error) {
          throw new Error(`Failed to add modification: ${error.message}`);
        }
        
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to add modification: ${errorMessage}`);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Modification added successfully');
      queryClient.invalidateQueries({ queryKey: ['modifications', tourId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add modification: ${error.message}`);
    }
  });

  return {
    modifications: modifications || [],
    isLoading,
    error,
    refetch,
    addModification: modificationMutation.mutate,
    isAddingModification: modificationMutation.isPending
  };
};

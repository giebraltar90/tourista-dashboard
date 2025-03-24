
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

/**
 * Hook for authentication and user profile management
 */
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (data) {
        return {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          role: data.role,
        };
      }

      return null;
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Get current user session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        const session = data.session;

        if (session) {
          setUser(session.user);
          
          // Fetch user profile if logged in
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError(error instanceof Error ? error : new Error('Unknown auth error'));
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  return {
    user,
    profile,
    isLoading,
    error
  };
};

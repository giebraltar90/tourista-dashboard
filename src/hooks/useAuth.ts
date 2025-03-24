
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useRole } from '@/contexts/RoleContext';

type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
};

// Interface for auth user with role
interface UserWithRole extends UserProfile {
  role?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setRole } = useRole();

  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
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

        return data as UserWithRole;
      } catch (error) {
        console.error('Unexpected error fetching user profile:', error);
        return null;
      }
    };

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
            // Add role to profile data if needed
            profile.role = profile.role || 'user';
            setUser(profile);
            setRole('operator'); // Default role
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        
        if (profile) {
          // Add role to profile data if needed
          profile.role = profile.role || 'user';
          setUser(profile);
          setRole('operator'); // Default role
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, setRole]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return { user, loading, signOut };
};

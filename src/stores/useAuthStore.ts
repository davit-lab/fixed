import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';

interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: AuthUser | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
}));

const mapSupabaseUser = (supabaseUser: User): AuthUser => ({
  id: supabaseUser.id,
  email: supabaseUser.email || null,
  displayName: supabaseUser.user_metadata?.full_name || supabaseUser.email || null,
  photoURL: supabaseUser.user_metadata?.avatar_url || null,
});

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data as Profile;
};

// Initialize auth listener
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    useAuthStore.getState().setUser(mapSupabaseUser(session.user));
    fetchProfile(session.user.id).then((profileData) => {
      useAuthStore.getState().setProfile(profileData);
      useAuthStore.getState().setLoading(false);
      useAuthStore.getState().setInitialized(true);
    });
  } else {
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setProfile(null);
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setInitialized(true);
  }
});

// Listen for auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    useAuthStore.getState().setUser(mapSupabaseUser(session.user));
    const profileData = await fetchProfile(session.user.id);
    useAuthStore.getState().setProfile(profileData);
  } else {
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setProfile(null);
  }
  useAuthStore.getState().setLoading(false);
  useAuthStore.getState().setInitialized(true);
});

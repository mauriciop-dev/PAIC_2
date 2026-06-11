import { supabaseAdmin } from '../supabaseAdmin';

export interface UserSession {
  userId: string;
  conjuntoId: string;
  role: string;
  fullName: string;
  email: string;
}

export async function validateUserSession(authHeader: string | undefined): Promise<UserSession | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Missing or invalid Authorization header');
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    // 1. Verify user token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth verification failed:', authError?.message || authError);
      return null;
    }

    // 2. Fetch profile using admin client to get conjunto_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('conjunto_id, role, full_name, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Failed to fetch user profile:', profileError?.message || profileError);
      return null;
    }

    if (!profile.conjunto_id) {
      console.error('User profile does not have a conjunto_id');
      return null;
    }

    return {
      userId: user.id,
      conjuntoId: profile.conjunto_id,
      role: profile.role,
      fullName: profile.full_name,
      email: profile.email || user.email || ''
    };
  } catch (err) {
    console.error('Unexpected error validating session:', err);
    return null;
  }
}

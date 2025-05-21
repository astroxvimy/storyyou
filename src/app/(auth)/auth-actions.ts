'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { ActionResponse } from '@/types/action-response';
import { getURL } from '@/utils/get-url';

export async function signInWithOAuth(provider: 'github' | 'google'): Promise<ActionResponse> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getURL('/auth/callback'),
    },
  });

  if (error) {
    console.error(error);
    return { data: null, error: error };
  }

  return redirect(data.url);
}

export async function signInWithEmail(email: string, password: string): Promise<ActionResponse> {
  const supabase = await createSupabaseServerClient();

  // const { error } = await supabase.auth.signInWithOtp({
  //   email,
  //   options: {
  //     emailRedirectTo: getURL('/auth/callback'),
  //   },
  // });

  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
  
  if (error) {
    return { data: null, error: error };
  }

  if (!data?.user) return { data: null, error: "Login failed - no user returned" };
  if (!data?.session) return { data: null, error: "Login failed - no session returned" };

  return { data: data, error: null };
}

export const signUpWithEmail = async (email: string, password: string): Promise<ActionResponse> => {

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: getURL('/auth/callback'),
    }
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      // Handle user exists gracefully
      return { data: null, error: 'Email is already registered.' };
    } else {
      // Other signup error
      return { data: null, error: error.message };
    }
  }

  if (!data?.user) return { data: null, error: "User was not created" };

  // Check if email confirmation is required
  if (data.session === null) {
    // Email confirmation is required
    return { data: null, error: null };
  }

  return {data: null, error: null};
};

export async function signOut(): Promise<ActionResponse> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(error);
    return { data: null, error: error };
  }

  return { data: null, error: null };
}

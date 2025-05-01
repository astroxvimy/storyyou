import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { Database } from '@/libs/supabase/types';

type Story = Database['public']['Tables']['stories']['Insert'];

export async function createStory(story: Omit<Story, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('stories')
    .insert([story])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create story: ${error.message}`);
  }

  return data;
}

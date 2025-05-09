import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { Database } from '@/libs/supabase/types';

type Story = Database['public']['Tables']['stories']['Insert'];

export async function getStoryStatus(storyId: string): Promise<Story['story_status']> {
  const supabase = await createSupabaseServerClient();
  console.log('🚗🚗, /api/story/get-story-status');
  const { data, error } = await supabase.from('stories').select('story_status').eq('id', storyId).single();

  if (error) {
    throw new Error(`Failed to fetch story status: ${error.message}`);
  }

  return data.story_status;
}

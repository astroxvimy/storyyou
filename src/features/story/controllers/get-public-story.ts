import { getUser } from '@/features/account/controllers/get-user';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { Database } from '@/libs/supabase/types';

// type Story = Database['public']['Tables']['stories']['Row'];
export type StoryWithPages = Database['public']['Tables']['stories']['Row'] & {
  story_pages: Database['public']['Tables']['story_pages']['Row'][];
};

export async function getPublicStory(storyId: string): Promise<StoryWithPages | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('stories')
    .select('*, story_pages(*)')
    .eq('id', storyId)
    .order('page_number', { ascending: true, foreignTable: 'story_pages' })
    .maybeSingle(); // Returns a single object instead of an array

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch story: ${error.message}`);
    }

  return data as StoryWithPages;
}

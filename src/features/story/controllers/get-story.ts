import { getUser } from '@/features/account/controllers/get-user';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { Database } from '@/libs/supabase/types';

// type Story = Database['public']['Tables']['stories']['Row'];
type StoryWithPages = Database['public']['Tables']['stories']['Row'] & {
  story_pages: Database['public']['Tables']['story_pages']['Row'][];
};

export async function getStory(storyId: string): Promise<StoryWithPages | null> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not found');
  }

  const { data, error } = await supabase
    .from('stories')
    .select('*, story_pages(*)')
    .eq('id', storyId)
    .eq('user_id', user.id)
    .order('page_number', { ascending: true, foreignTable: 'story_pages' })
    .single(); // Returns a single object instead of an array

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch story: ${error.message}`);
  }

  return data as StoryWithPages;
}

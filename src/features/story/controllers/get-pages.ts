import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { Database } from '@/libs/supabase/types';

type StoryPage = Database['public']['Tables']['story_pages']['Row'];

export async function getPages(storyId: string): Promise<StoryPage[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('story_pages')
    .select('*')
    .eq('story_id', storyId)
    .order('page_number', { ascending: true }); // Ensure pages are in order

  if (error) {
    throw new Error(`Failed to fetch story pages: ${error.message}`);
  }

  return data;
}

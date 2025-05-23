import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { Database } from '@/libs/supabase/types';

type Story = Database['public']['Tables']['stories']['Row'];

export async function setVisible({ storyId, visible }: { storyId: string; visible: boolean }): Promise<Story> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('stories')
    .update({ is_public: visible })
    .eq('id', storyId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update visibility: ${error.message}`);
  }

  return data;
}

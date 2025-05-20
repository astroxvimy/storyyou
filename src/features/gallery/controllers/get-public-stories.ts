import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { Database } from '@/libs/supabase/types';

type Story = Database['public']['Tables']['stories']['Row'];

export async function getPublicStories({
  startFrom = 1,
  range = 10,
}: {
    startFrom?: number;
    range?: number;
}): Promise<Story[]> {
  const supabase = await createSupabaseServerClient();

  const from = (startFrom - 1) * range;
  const to = from + range - 1;

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch public stories: ${error.message}`);
  }

  return data;
}

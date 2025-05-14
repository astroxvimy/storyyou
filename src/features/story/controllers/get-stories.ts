import { getUser } from '@/features/account/controllers/get-user';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { Database } from '@/libs/supabase/types';

type Story = Database['public']['Tables']['stories']['Insert'];

export async function getStories(): Promise<Story[]> {
  const supabase = await createSupabaseServerClient();
  const user = await getUser();
  
  if (!user) {
    throw new Error('User not found');
  }

  const { data, error } = await supabase
    .from('stories')
    .select('*')  // Retrieve all columns, or specify if you need specific fields like .select('id, title')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });  // Ordering stories by creation date (latest first)

  if (error) {
    throw new Error(`Failed to fetch stories: ${error.message}`);
  }

  return data;
}

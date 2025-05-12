import { getEnvVar } from '@/utils/get-env-var';

const supabaseUrl = getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

/**
 * Calls the Supabase Edge Function to generate an image for a story page.
 */
export async function generateStoryPageImage({ pageId, image_prompt }: { pageId: string; image_prompt: string }) {
  const res = await fetch(`${supabaseUrl}/functions/v1/generate_story_page_image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ pageId, image_prompt }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate story page image');
  }

  return data;
}

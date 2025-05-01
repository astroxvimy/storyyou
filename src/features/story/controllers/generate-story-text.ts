import { getEnvVar } from '@/utils/get-env-var';

const supabaseUrl = getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

export async function generateStoryText({
  storyId,
  storyName,
  hobbies,
}: {
  storyId: string;
  storyName: string;
  hobbies: string[];
}) {
  const res = await fetch(`${supabaseUrl}/functions/v1/generate_story_text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ storyId, storyName, hobbies }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate story text');
  }

  return data;
}

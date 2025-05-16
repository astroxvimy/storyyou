// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SUPABASE_URL = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // or set your domain here
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: corsHeaders });
  }

  const supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { storyId } = await req.json();

  try {
    const imagesResults = await generateStoryPageImages(storyId, supabaseAdminClient);
    return new Response(JSON.stringify({ imagesResults }), { headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});

/**
 * Retrieves pages from the "story_pages" table for the given story ID
 * and calls the Supabase Edge Function "generate_story_page_image" for each page.
 */
async function generateStoryPageImages(storyId: string, supabaseAdminClient: ReturnType<typeof createClient>) {
  // Query the "story_pages" table to get page ids and image prompts
  const { data: pages, error } = await supabaseAdminClient
    .from('story_pages')
    .select('id, image_prompt')
    .eq('storyId', storyId);

  const pagesWithoutImages = pages.filter((page) => !page.page_image);

  if (error) {
    throw new Error(`Error fetching pages: ${error.message}`);
  }

  if (!pages || pages.length === 0) {
    throw new Error('No pages found for the given story id');
  }

  // Results will contain errors, if any, during the fetch call
  const results: { pageId: string; error?: string }[] = [];
  for (const page of pagesWithoutImages) {
    // Build payload for the edge function call
    const payload = {
      pageId: page.id,
      image_prompt: page.image_prompt,
    };

    // Delay for 2 seconds before making the request
    await new Promise((resolve) => setTimeout(resolve, 2000));

    fetch(`${SUPABASE_URL}/functions/v1/generate_story_page_image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    }).catch((err: any) => {
      results.push({ pageId: page.id, error: err.message });
    });
  }

  return results;
}

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate_story_page_image' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type': 'application/json' \
    --data '{"name":"Functions"}'

*/

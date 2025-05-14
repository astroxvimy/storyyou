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

  const { pageId, image_prompt } = await req.json();

  const { data: pageData, error: pageError } = await supabaseAdminClient
    .from('story_pages')
    .select('story_id')
    .eq('id', pageId)
    .single();
  try {
    if (pageError) throw pageError;

    const { error: updateStoryError } = await supabaseAdminClient
      .from('stories')
      .update({ story_status: 'image_processing' })
      .eq('id', pageData.story_id);
    if (updateStoryError) throw updateStoryError;
    console.log('😀😀😀', image_prompt);
    // Call DALL·E API (or OpenAI image generation endpoint)
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: image_prompt,
        size: '1024x1024',
        n: 1,
      }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('OpenAI error:', errorText);
      const { error: updateStoryError } = await supabaseAdminClient
        .from('stories')
        .update({ story_status: 'image_incomplete' })
        .eq('id', pageData.story_id);
      throw new Error('OpenAI API error: ' + errorText);
    }
    const resJson = await res.json();
    const b64 = resJson.data?.[0]?.b64_json;
    console.log('🚗Image URL:', b64);
    if (!b64) throw new Error('Image generation failed.');
    // Decode base64 to Uint8Array
    function base64ToUint8Array(base64: string): Uint8Array {
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
    const imageBuffer = base64ToUint8Array(b64);

    const fileName = `${crypto.randomUUID()}.png`;
    const filePath = `story-images/${fileName}`;

    // Upload to supabase storage
    const { data: storageData, error: uploadError } = await supabaseAdminClient.storage
      .from('images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Generate a public URL
    const { data: publicUrlData } = supabaseAdminClient.storage.from('images').getPublicUrl(filePath);

    // Update story_page with the image URL
    const { data: updatedPage, error: updatePageError } = await supabaseAdminClient
      .from('story_pages')
      .update({ page_image: publicUrlData.publicUrl })
      .eq('id', pageId)
      .select('story_id')
      .single();

    if (updatePageError) throw updatePageError;
    const storyId = updatedPage.story_id;

    // Check if all pages of the story have images
    const { data: pages, error: fetchPagesError } = await supabaseAdminClient
      .from('story_pages')
      .select('page_image')
      .eq('story_id', storyId);

    if (fetchPagesError) throw fetchPagesError;

    const allPagesHaveImages = pages.every((p) => p.page_image);
    if (allPagesHaveImages) {
      const { error: updateStoryError } = await supabaseAdminClient
        .from('stories')
        .update({ story_status: 'image_complete' })
        .eq('id', storyId);
      if (updateStoryError) throw updateStoryError;
    } else {
      const { error: updateStoryError } = await supabaseAdminClient
        .from('stories')
        .update({ story_status: 'image_incomplete' })
        .eq('id', storyId);
      if (updateStoryError) throw updateStoryError;
    }

    return new Response(JSON.stringify({ message: 'Image generated and saved' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    await supabaseAdminClient.from('stories').update({ story_status: 'image_incomplete' }).eq('id', pageData?.story_id);
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate_story_page_image' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

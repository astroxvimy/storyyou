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
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method Not Allowed',
        code: 405,
        message: 'Only POST requests are allowed.',
      }),
      { status: 405, headers: corsHeaders }
    );
  }

  const supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  async function updateStoryStatus(storyId: string, status: string) {
    const { error } = await supabaseAdminClient.from('stories').update({ story_status: status }).eq('id', storyId);

    if (error) {
      console.error(`🚗 Failed to update story status to "${status}":`, error.message);
    } else {
      console.log(`🚗 Story status updated to "${status}".`);
    }
  }

  try {
    const { storyId } = await req.json();

    if (!storyId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid Input', code: 400, message: 'storyId is required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('🚗 Received storyId:', storyId);

    const { data: pages, error } = await supabaseAdminClient
      .from('story_pages')
      .select('id, image_prompt, page_image')
      .eq('story_id', storyId);

    if (error) {
      throw new Error(`Error fetching pages: ${error.message}`);
    }

    if (!pages || pages.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No Pages Found',
          code: 404,
          message: 'No pages found for the given story ID.',
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    const pagesWithoutImages = pages.filter((page) => !page.page_image);
    console.log('🚗 Pages without images:', pagesWithoutImages);

    if (pagesWithoutImages.length === 0) {
      await updateStoryStatus(storyId, 'image_complete');
      return new Response(JSON.stringify({ success: true, message: 'All pages already have images.' }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    await updateStoryStatus(storyId, 'image_processing');

    const firstPage = pagesWithoutImages[0];
    const { id: pageId, image_prompt: imagePrompt } = firstPage;

    if (!imagePrompt) {
      console.warn(`🚗 Skipping page ${pageId} due to missing image prompt.`);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Page ${pageId} has no image prompt.`,
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🚗 Generating image for the first page without an image: ${pageId}`);

    const openAiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: imagePrompt,
        size: '1024x1024',
        n: 1,
      }),
    });

    if (!openAiResponse.ok) {
      throw new Error(`OpenAI API error: ${await openAiResponse.text()}`);
    }

    const openAiData = await openAiResponse.json();
    const imageUrl = openAiData.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('Image generation failed: No URL returned.');
    }

    console.log('🚗 Image URL:', imageUrl);

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download the generated image.');
    }
    const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());

    const fileName = `${crypto.randomUUID()}.png`;
    const filePath = `story-images/${fileName}`;

    const { error: uploadError } = await supabaseAdminClient.storage.from('images').upload(filePath, imageBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

    if (uploadError) {
      throw new Error(`Failed to upload image to storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdminClient.storage.from('images').getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
      throw new Error('Failed to generate public URL for the uploaded image.');
    }

    console.log('🚗 Public URL:', publicUrlData.publicUrl);

    const { error: updatePageError } = await supabaseAdminClient
      .from('story_pages')
      .update({ page_image: publicUrlData.publicUrl })
      .eq('id', pageId);

    if (updatePageError) {
      throw new Error(`Failed to update story page with image URL: ${updatePageError.message}`);
    }

    console.log(`🚗 Successfully updated page ${pageId} with image URL.`);

    const newStoryStatus = pagesWithoutImages.length === 1 ? 'image_complete' : 'image_incomplete';
    await updateStoryStatus(storyId, newStoryStatus);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Image generated successfully.',
        pageId,
        storyStatus: newStoryStatus,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('🚗 Error:', err);
    const { storyId } = await req.json();
    await updateStoryStatus(storyId, 'image_incomplete');
    return new Response(
      JSON.stringify({ success: false, error: 'Internal Server Error', code: 500, message: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

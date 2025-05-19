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

  try {
    const { pageId, image_prompt } = await req.json();

    if (!pageId || !image_prompt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid Input',
          code: 400,
          message: 'Both pageId and image_prompt are required.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('🚗 Received pageId:', pageId);

    const { data: pageData, error: pageError } = await supabaseAdminClient
      .from('story_pages')
      .select('story_id')
      .eq('id', pageId)
      .single();

    if (pageError) {
      throw new Error(`Failed to fetch page data: ${pageError.message}`);
    }

    const { error: updateStoryError } = await supabaseAdminClient
      .from('stories')
      .update({ story_status: 'image_processing' })
      .eq('id', pageData.story_id);

    if (updateStoryError) {
      throw new Error(`Failed to update story status: ${updateStoryError.message}`);
    }

    const prompt = image_prompt.trim();
    console.log('🚗 Image prompt:', prompt);

    if (!prompt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid Prompt',
          code: 400,
          message: 'The image prompt is empty or invalid.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Call DALL·E 3 API
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: image_prompt,
        size: '1024x1024',
        n: 1,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const resJson = await res.json();
    const imageUrl = resJson.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('Image generation failed: No URL returned.');
    }

    console.log('🚗 Image URL:', imageUrl);

    // Download the image as a binary file
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download the generated image.');
    }
    const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());

    // Generate a unique file name
    const fileName = `${crypto.randomUUID()}.png`;
    const filePath = `story-images/${fileName}`;

    // Upload the image to Supabase storage
    const { error: uploadError } = await supabaseAdminClient.storage.from('images').upload(filePath, imageBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

    if (uploadError) {
      throw new Error(`Failed to upload image to storage: ${uploadError.message}`);
    }

    // Generate a public URL for the uploaded image
    const { data: publicUrlData } = supabaseAdminClient.storage.from('images').getPublicUrl(filePath);

    if (!publicUrlData.publicUrl) {
      throw new Error('Failed to generate public URL for the uploaded image.');
    }

    console.log('🚗 Public URL:', publicUrlData.publicUrl);

    // Update story_page with the public URL of the image
    const { error: updatePageError } = await supabaseAdminClient
      .from('story_pages')
      .update({ page_image: publicUrlData.publicUrl })
      .eq('id', pageId);

    if (updatePageError) {
      throw new Error(`Failed to update story page: ${updatePageError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Image generated and saved successfully.',
        imageUrl: publicUrlData.publicUrl,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err) {
    console.error('🚗 Error:', err);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        code: 500,
        message: err.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

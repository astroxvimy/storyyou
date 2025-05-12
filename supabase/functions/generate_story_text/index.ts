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

  // const supabaseUserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { storyId, storyName, hobbies } = await req.json();

    const { error: initialUpdateError } = await supabaseAdminClient
      .from('stories')
      .update({ story_status: 'text_processing' })
      .eq('id', storyId);

    if (initialUpdateError) throw initialUpdateError;
    console.log('🚗🚗🚗🚗🚗open ai key:', `Bearer ${Deno.env.get('OPENAI_API_KEY')}`);
    // Call OpenAI API using fetch
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              "You are a creative children's story writer. Your goal is to write engaging and imaginative stories suitable for illustrated storybooks with 5 to 10 pages. The tone should be adventurous, fun, and age-appropriate.",
          },
          {
            role: 'user',
            content: `Create a detailed children's story titled "${storyName}". 
                The main character(s) should be inspired by the following hobbies or interests: ${hobbies.join(', ')}. 
                The story should be between 500 to 800 words and should include a clear beginning, middle, and end, featuring a fun and exciting adventure. 
                Each part of the story should include vivid descriptions suitable for illustrations. Make it creative, imaginative, and appropriate for young children.`,
          },
        ],
        max_tokens: 1500,
      }),
    });

    const openaiJson = await openaiRes.json();
    const text = openaiJson.choices?.[0]?.message?.content ?? '';

    const chunks = splitTextIntoChunks(text);

    console.log('🚗🚗🚗🚗🚗OpenAI response:', chunks);

    // Insert pages into story_pages table
    for (let i = 0; i < chunks.length; i++) {
      const pageText = chunks[i];

      const promptGenRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Create a concise, vivid visual description (max 100 words) suitable for DALL·E image generation of this children's story page: "${pageText}"`,
            },
            {
              role: 'user',
              content: `Create a visual description prompt suitable for a DALL·E image generation of this children's story page: "${pageText}"`,
            },
          ],
        }),
      });

      const promptJson = await promptGenRes.json();
      const imagePrompt = promptJson.choices?.[0]?.message?.content?.trim() ?? '';

      const { error } = await supabaseAdminClient.from('story_pages').insert([
        {
          story_id: storyId,
          page_number: i + 1,
          page_text: chunks[i],
          image_prompt: imagePrompt,
        },
      ]);
      if (error) {
        console.log('🛵🛵Error inserting page:', error);
        throw error;
      }
    }

    // Update story status
    const { error: updateError } = await supabaseAdminClient
      .from('stories')
      .update({ story_status: 'text_complete' })
      .eq('id', storyId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ message: 'Text generated and stored' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

function splitTextIntoChunks(text: string, targetWordsPerChunk = 250): string[] {
  const sentences =
    text
      .match(/[^.!?]+[.!?]+[\])'"`’”]*|\s*$/g)
      ?.map((s) => s.trim())
      .filter(Boolean) || [];
  const chunks: string[] = [];

  let currentChunk = '';
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const sentenceWordCount = sentence.split(/\s+/).length;

    if (currentWordCount + sentenceWordCount > targetWordsPerChunk && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + ' ';
      currentWordCount = sentenceWordCount;
    } else {
      currentChunk += sentence + ' ';
      currentWordCount += sentenceWordCount;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

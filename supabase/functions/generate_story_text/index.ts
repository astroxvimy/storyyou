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

type Input = {
  title: string;
  hobbies: string[];
  detail: string;
};

type CharacterDescription = {
  name: string;
  age: string;
  gender: string;
  description: string; // vivid, visual, emotionally expressive
};

type StoryPage = {
  text: string;
  image_prompt: string;
};

type FullStory = {
  pageTexts;
  imagePrompts;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // const supabaseUserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { storyId, storyName, storyDetail, hobbies } = await req.json();

    const { error: initialUpdateError } = await supabaseAdminClient
      .from('stories')
      .update({ story_status: 'text_processing' })
      .eq('id', storyId);

    if (initialUpdateError) throw initialUpdateError;
    const result = await generateFullStory({
      title: storyName,
      hobbies: hobbies,
      detail: storyDetail,
    });
    // Insert pages into story_pages table
    const { error } = await supabaseAdminClient.from('story_pages').insert([
      {
        story_id: storyId,
        page_number: 0,
        image_prompt: result.imagePrompts[0],
      },
    ]);
    if (error) {
      console.log('🛵🛵Error inserting page:', error);
      throw error;
    }
    for (let i = 0; i < result.pageTexts.length; i++) {
      const { error } = await supabaseAdminClient.from('story_pages').insert([
        {
          story_id: storyId,
          page_number: i + 1,
          page_text: result.pageTexts[i],
          image_prompt: result.imagePrompts[i],
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

export async function generateFullStory(input: Input): Promise<FullStory> {
  const plot = await generatePlot(input);
  const pagePlots = await generatePagePlots(plot);
  const bookCoverPrompt = await generateBookCoverPrompt(input.title, plot);
  const characters = await generateCharacterDescriptions(plot);
  const pageTexts = await generatePageTexts(plot, pagePlots);
  const imagePrompts = await generatePageImagePrompts(plot, pagePlots, characters);

  // Modify image prompts to include character descriptions in a richer format
  const updatedImagePrompts = imagePrompts.map((imagePrompt, index) => {
    // Combine the image prompt with detailed character descriptions for each page
    const characterDescriptions = characters
      .map((character) => {
        return `
Character Name: ${character.name}
- Age: ${character.age}
- Gender: ${character.gender}
- Description: ${character.description}`;
      })
      .join('\n');

    return `${imagePrompt}\n\nHere is the character description for this scene, which includes key details about each character involved:\n${characterDescriptions}`;
  });

  const reducedPrompts: string[] = [bookCoverPrompt];
  for (const prompt of updatedImagePrompts) {
    const reduced = await callGPT(
      `Please rewrite the following illustration prompt to be under 600 characters. It must be less than 600 characters. One important thing is not to include the content that is not allowed by OpenAI system. Just give me only illustration prompt. :\n\n${prompt}`
    );
    reducedPrompts.push('Generate Ghibli style image. ' + reduced);
  }

  return {
    pageTexts,
    imagePrompts: reducedPrompts,
  };
}

async function generatePlot(input: Input): Promise<string> {
  const prompt = `
Create a creative and magical children's story plot based on the following:

- Title: ${input.title}
- Hobbies: ${input.hobbies.join(', ')}
- Detail: ${input.detail}

The plot should be imaginative, emotionally warm, and structured as a complete narrative with a beginning, middle, and end. Keep it suitable for children ages 5–8. Use 1–2 paragraphs.
`.trim();
  const res = await callGPT(prompt);
  console.log('🚗Generated plot:', res);
  return res.trim();
}

async function generatePagePlots(plot: string): Promise<string[]> {
  const prompt = `
From the following children's story plot, extract 7 vivid and sequential story moments (scenes), each corresponding to one illustrated page.

Format:
1. ...
2. ...
...
7. ...

Make each scene visually rich and distinct, reflecting character emotions, actions, and setting.

Plot:
${plot}
`.trim();

  const response = await callGPT(prompt);
  console.log('🚗Generated page plots:', response);
  return response
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^\d+\.\s/.test(l))
    .map((l) => l.replace(/^\d+\.\s*/, ''));
}

async function generateCharacterDescriptions(plot: string): Promise<CharacterDescription[]> {
  const prompt = `
Based on the story plot below, identify all key characters and describe them vividly for illustration purposes.

For each character, include:
- Name (invent if needed)
- Age group (child, teen, adult, elder)
- Gender
- Visual description: detailed clothing, facial features, hairstyle, accessories, posture, and expressive personality cues. Use color-rich and emotionally expressive language.

Return JSON array:
[
  {
    "name": "Lina",
    "age": "child",
    "gender": "female",
    "description": "A cheerful young girl with long wavy auburn hair tied with a sunflower clip, wearing a sky-blue tunic with white embroidered stars, yellow boots, and a red satchel. Her eyes are wide with curiosity and her cheeks always slightly flushed."
  },
  ...
]

Story Plot:
${plot}
`.trim();

  const response = await callGPT(prompt);
  console.log('🚗Generated character descriptions:', response);
  try {
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) return parsed;
    throw new Error('Invalid format');
  } catch (err) {
    console.error('Failed to parse characters:', err);
    console.error('Raw response:', response);
    return [];
  }
}

async function generatePageTexts(plot: string, pagePlots: string[]): Promise<string[]> {
  const prompt = `
Using the full story plot and these 7 scenes, write one short paragraph per scene (5–6 sentences) for a children's storybook without leading number.

Each paragraph should:
- Match the scene
- Reflect the characters and tone
- Use simple, vivid, and emotionally warm storytelling

Plot:
${plot}

Scenes:
${pagePlots.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`.trim();

  const response = await callGPT(prompt);
  return response
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);
}

async function generatePageImagePrompts(
  plot: string,
  pagePlots: string[],
  characters: CharacterDescription[]
): Promise<string[]> {
  const characterList = characters.map((c) => `${c.name}: ${c.description}`).join('\n');

  return pagePlots.map((scene, index) =>
    `
Highly detailed children's book illustration for page ${index + 1}.

Scene: ${scene}

Story Summary:
${plot}

Main Characters:
${characterList}

Illustration Style:
- Soft hand-painted textures, gentle pastels
- Consistent character designs across pages
- Whimsical, imaginative landscapes and magical realism
- Emotionally expressive faces and storytelling poses
- Balanced foreground and background composition

Do not include text or narration — just the visual description for generating a cohesive illustration.
`.trim()
  );
}

async function generateBookCoverPrompt(title: string, plot: string): Promise<string> {
  const prompt = `
Given the following children's story title and plot, write a single, vivid, and concise illustration prompt for a book cover.

Requirements:
- Focus on the main theme, mood, and magical atmosphere of the story.
- Mention the main character(s) and any iconic visual elements.
- Use color-rich, emotionally expressive, and imaginative language.
- Do NOT include any text or narration in the prompt.
- Limit to 2–4 sentences, under 550 characters.

Title: ${title}

Plot:
${plot}
`.trim();

  const response = await callGPT(prompt);
  // Optionally trim or post-process the response if needed
  return response.trim();
}

// ------------------------ GPT Helper ------------------------

async function callGPT(prompt: string): Promise<string> {
  const maxRetries = 5; // Maximum number of retries
  let retryCount = 0;
  let delay = 1000; // Initial delay in milliseconds (1 second)

  while (retryCount < maxRetries) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful and safe AI assistant. Do not produce any harmful, unsafe, or policy-violating content. Follow OpenAI content guidelines strictly.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2500,
          temperature: 0.9,
        }),
      });

      console.log('🚗GPT response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? '';
      } else if (res.status === 429) {
        // Too Many Requests - Retry after a delay
        console.warn(`🚗 Rate limit hit. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        retryCount++;
        delay *= 2; // Exponential backoff
      } else {
        // Other errors
        const errorData = await res.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || res.statusText}`);
      }
    } catch (err) {
      if (retryCount >= maxRetries - 1) {
        console.error('🚗 Failed after maximum retries:', err);
        throw err; // Rethrow the error after max retries
      }
      console.warn(`🚗 Error occurred. Retrying in ${delay}ms...`, err);
      await new Promise((resolve) => setTimeout(resolve, delay));
      retryCount++;
      delay *= 2; // Exponential backoff
    }
  }

  throw new Error('Failed to get a response from OpenAI API after maximum retries.');
}

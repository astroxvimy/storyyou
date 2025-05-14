// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { readableStreamFromReader } from 'https://deno.land/std@0.203.0/streams/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import PDFDocument from 'https://esm.sh/pdfkit';
import { Buffer } from 'node:buffer';

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SUPABASE_URL = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!;
const BUCKET_NAME = 'books';

const fontUrl = `${SUPABASE_URL}/storage/v1/object/public/assets/fonts/Typori-Regular.ttf`;
const fontRes = await fetch(fontUrl);
if (!fontRes.ok) throw new Error('Failed to fetch Typori font');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { storyId } = await req.json();
    console.log('🛺🛺Received request to generate book:', storyId);
    if (!storyId) throw new Error('Missing storyId');

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: story, error } = await supabase
      .from('stories')
      .select('story_name, story_pages(page_text, page_image)')
      .eq('id', storyId)
      .order('page_number', { foreignTable: 'story_pages', ascending: true })
      .single();

    if (error) throw error;
    if (!story) throw new Error('Story not found');

    const doc = new PDFDocument();
    const fontBuffer = await fontRes.arrayBuffer();
    doc.registerFont('Typori', Buffer.from(fontBuffer));
    const chunks: Uint8Array[] = [];
    const stream = doc.on('data', (chunk) => chunks.push(chunk));

    doc.font('Typori').fontSize(20).text(story.story_name, { align: 'center' }).moveDown();

    for (const page of story.story_pages) {
      doc.addPage();
      doc
        .font('Typori')
        .fontSize(14)
        .text(page.page_text || '', {
          align: 'left',
          paragraphGap: 10,
        });

      if (page.page_image) {
        try {
          const imageRes = await fetch(page.page_image);
          if (imageRes.ok) {
            const buffer = await imageRes.arrayBuffer();
            doc.image(Buffer.from(buffer), {
              fit: [500, 400],
              align: 'center',
              valign: 'center',
            });
          }
        } catch (e) {
          doc.text('(Failed to load image)', { italic: true });
        }
      }
      console.log('🛺🛺Page text:', page.page_text);
    }

    doc.end();
    // Wait until PDF is fully generated
    await new Promise((resolve) => doc.on('end', resolve));
    const pdfBuffer = Buffer.concat(chunks);

    const fileName = `${storyId}-${Date.now()}.pdf`;
    const filePath = `books/${fileName}`;
    console.log('🛺🛺File path:', filePath);
    const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });
    console.log('🛺🛺Upload error:', uploadError);
    if (uploadError) throw uploadError;

    // ✅ Update story status
    const { error: updateError } = await supabase.from('stories').update({ status: 'book_complete' }).eq('id', storyId);

    if (updateError) throw updateError;

    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    console.log('🛺🛺Public URL:', publicUrlData.publicUrl);
    return new Response(JSON.stringify({ url: publicUrlData.publicUrl }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error('❌ Error generating PDF:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate_book' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

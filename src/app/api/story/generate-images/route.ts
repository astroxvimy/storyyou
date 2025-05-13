import { NextRequest, NextResponse } from 'next/server';

import { generateStoryPageImage } from '@/features/story/controllers/generate-story-page-image';
import { getPages } from '@/features/story/controllers/get-pages';
import { delay } from '@/utils/delay';

export async function POST(req: NextRequest) {
  console.log('🚗Received request to generate images');
  const { storyId } = await req.json();
  console.log('🚗Received storyId:', storyId);
  try {
    // Get all pages
    const storyPages = await getPages(storyId);
    console.log('🚗Fetched story pages:', storyPages);

    const pagesWithoutImages = storyPages.filter(page => !page.page_image);
    console.log('🥰 Page without images', pagesWithoutImages);

    // Call the supabase edge function for image generation
    for (const storyPage of pagesWithoutImages) {
      await delay(150);
      console.log('🚗Generating image for page:', storyPage.id);
      console.log('🚓Page text:', storyPage.page_text);
      console.log('🚕Page image:', storyPage.page_image);
      generateStoryPageImage({
        pageId: storyPage.id,
        image_prompt: storyPage.image_prompt ?? '',
      });
    }

    return NextResponse.json({ message: 'Image generation started.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

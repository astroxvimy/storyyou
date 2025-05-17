import { NextRequest, NextResponse } from 'next/server';

import { generateStoryImages } from '@/features/story/controllers/generate-story-images';
import { delay } from '@/utils/delay';

export async function POST(req: NextRequest) {
  console.log('🚗Received request to generate images');
  const { storyId } = await req.json();
  console.log('🚗Received storyId:', storyId);
  try {
    const results = await generateStoryImages({ storyId });

    console.log('ImageGeneration Start:', results);

    // this is original code, should be implemented on supabase because of response time limit
    // // Get all pages
    // const storyPages = await getPages(storyId);
    // console.log('🚗Fetched story pages:', storyPages);

    // const pagesWithoutImages = storyPages.filter((page) => !page.page_image);
    // console.log('🥰 Page without images', pagesWithoutImages);

    // // Call the supabase edge function for image generation
    // for (const storyPage of pagesWithoutImages) {
    //   await delay(2000);
    //   console.log('🚗Generating image for page:', storyPage.id);
    //   console.log('🚓Page text:', storyPage.page_text);
    //   generateStoryPageImage({
    //     pageId: storyPage.id,
    //     image_prompt: storyPage.image_prompt ?? '',
    //   });
    // }

    return NextResponse.json({ message: 'Story images generation started.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

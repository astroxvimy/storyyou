import { generateStoryPageImage } from '@/features/story/controllers/generate-story-page-image';
import { getPages } from '@/features/story/controllers/get-pages';
import { delay } from '@/utils/delay';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { storyId } = await req.json();

  try {
    // Get all pages
    const storyPages = await getPages(storyId);

    // Call the supabase edge function for image generation
    for (const storyPage of storyPages) {
      await delay(150);
      generateStoryPageImage({
        pageId: storyPage.id,
        text: storyPage.page_text ?? '',
      });
    }

    return NextResponse.json({ message: 'Image generation started.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

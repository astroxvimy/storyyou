import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/features/account/controllers/get-session';
import { createStory } from '@/features/story/controllers/create-story';
import { generateStoryText } from '@/features/story/controllers/generate-story-text';

export async function POST(req: NextRequest) {
  const { storyName, hobbies, userPicture, storyDetail } = await req.json();
  const session = await getSession();

  let data;

  try {
    data = await createStory({
      user_id: session?.user.id,
      story_name: storyName,
      hobbies: hobbies,
      user_picture: userPicture,
      story_detail: storyDetail,
      story_status: 'pending',
    });

    // do the background job

    // Call the supabase edge function
    generateStoryText({
      storyId: data.id,
      storyName: data.story_name ?? '',
      storyDetail: data.story_detail ?? '',
      hobbies: data.hobbies ?? [],
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  } finally {
    return NextResponse.json({ data });
  }
}

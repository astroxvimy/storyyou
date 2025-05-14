import { NextRequest, NextResponse } from 'next/server';

import { getStory } from '@/features/story/controllers/get-story';

export async function POST(req: NextRequest) {
  const { storyId } = await req.json();
  try {
    const story = await getStory(storyId);
    return NextResponse.json({ story });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

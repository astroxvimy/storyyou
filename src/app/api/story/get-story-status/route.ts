import { NextRequest, NextResponse } from 'next/server';

import { getStoryStatus } from '@/features/story/controllers/get-story-status';

export async function POST(req: NextRequest) {
  const { storyId } = await req.json();
  try {
    const status = await getStoryStatus(storyId);
    return NextResponse.json({ status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

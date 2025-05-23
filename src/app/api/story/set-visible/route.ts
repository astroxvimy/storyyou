import { NextRequest, NextResponse } from 'next/server';

import { setVisible } from '@/features/story/controllers/set-visible';

export async function POST(req: NextRequest) {
  const { storyId, visible } = await req.json();
  try {
    const story = await setVisible({storyId, visible});
    return NextResponse.json({ story });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

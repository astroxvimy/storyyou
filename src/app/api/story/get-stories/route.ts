import { NextRequest, NextResponse } from 'next/server';

import { getStories } from '@/features/story/controllers/get-stories';

export async function POST(req: NextRequest) {
  try {
    const stories = await getStories();
    return NextResponse.json({ stories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

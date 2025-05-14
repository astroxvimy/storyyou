import { NextRequest, NextResponse } from 'next/server';

import { generateBook } from '@/features/story/controllers/generate-book';

export async function POST(req: NextRequest) {
  const { storyId } = await req.json();
  console.log('🚗Received storyId:', storyId);
  try {
    const res = await generateBook(storyId);

    return NextResponse.json({ message: 'Image generation started.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

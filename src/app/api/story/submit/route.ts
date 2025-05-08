import { NextRequest, NextResponse } from "next/server";

import { createStory } from "@/features/story/controllers/create-story";
import { generateStoryText } from "@/features/story/controllers/generate-story-text";

export async function POST(req: NextRequest) {
  const { userId, storyName, hobbies, userPicture } = await req.json();

  let data;

  try {
    data = await createStory({
      user_id: userId,
      story_name: storyName,
      hobbies: hobbies,
      user_picture: userPicture,
      story_status: "pending",
    })

    // do the background job
    
    // Call the supabase edge function
    generateStoryText({storyId: data.id, storyName: data.story_name ?? '', hobbies: data.hobbies ?? []});

  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  } finally {
    return NextResponse.json({ data });
  }
}

import { Database } from "@/libs/supabase/types";
import { StorySlider } from "./story-slider";
import { getPublicStory } from "@/features/story/controllers/get-public-story";

type Story = Database ['public']['Tables']['stories']['Row'];

export function SliderSection({ stories }:{ stories: Story[] }) {
    return (
        <>
            {stories.map(story => <SliderMiddleware key={story.id} storyId={story.id} />)}
        </>
    )
}

async function SliderMiddleware({storyId}: {storyId: string}) {
    const storyWithPage = await getPublicStory(storyId);
    return (
        <StorySlider storyWithPage={storyWithPage} />
    )
}
 
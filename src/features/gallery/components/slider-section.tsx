import { getPublicStory } from "@/features/story/controllers/get-public-story";
import { Database } from "@/libs/supabase/types";

import { StoryBookCase } from "./story-book-case";
import { StorySlider } from "./story-slider";

type Story = Database ['public']['Tables']['stories']['Row'];

export function SliderSection({ stories }: { stories: Story[] }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story) => (
          <SliderMiddleware key={story.id} storyId={story.id} />
        ))}
      </div>
    );
  }

async function SliderMiddleware({storyId}: {storyId: string}) {
    const storyWithPage = await getPublicStory(storyId);
    return (
        <div className="p-4">
            <StorySlider storyWithPage={storyWithPage} />
        </div>
    )
}
 
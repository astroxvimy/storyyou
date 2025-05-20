import { FlipBookView } from "@/features/gallery/components/gallery-view";
import { getPublicStory } from "@/features/story/controllers/get-public-story";

export default async function GalleryView({ params }: { params: { id: string } }) {
    const routeId = params?.id;

    if (!routeId) {
        return <div>Can't find the story</div>;
    }

    const storyWithPage = await getPublicStory(routeId);

    return <FlipBookView storyWithPage={storyWithPage} />;
}
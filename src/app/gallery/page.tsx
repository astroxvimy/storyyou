import { SliderSection } from "@/features/gallery/components/slider-section";
import { getPublicStories } from "@/features/gallery/controllers/get-public-stories"

export default async function GalleryPage() {
    const stories = await getPublicStories({startFrom: 1, range: 10});
    return (
        <div>
            <h1 className="my-8 ml-4 text-3xl text-neutral-300">Gallery of the books by Storyou</h1>
            <SliderSection stories={stories} />
        </div>
    )
}
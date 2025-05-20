import { SliderSection } from "@/features/gallery/components/slider-section";
import { getPublicStories } from "@/features/gallery/controllers/get-public-stories"

export default async function GalleryPage() {
    const stories = await getPublicStories({startFrom: 1, range: 10});
    return (
        <>
            <div>Gallery of the books by Storyou</div>
            <SliderSection stories={stories} />
        </>
    )
}
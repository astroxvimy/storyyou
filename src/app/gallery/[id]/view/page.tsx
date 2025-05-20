import { FlipBookView } from '@/features/gallery/components/gallery-view';
import { getPublicStory } from '@/features/story/controllers/get-public-story';

//@ts-ignore
export default async function GalleryView({params}: {params: Promise<{ id: string }>}) {
    const { id } = await params;

  if (!id) {
    return <div>Can&lsquo;t find the story</div>;
  }

  const storyWithPage = await getPublicStory(id);

  return <FlipBookView storyWithPage={storyWithPage} />;
}

import { FlipBookView } from '@/features/gallery/components/gallery-view';
import { getPublicStory } from '@/features/story/controllers/get-public-story';

type PageProps = {
  params: {
    id: string;
  };
};

export default async function GalleryView({ params }: PageProps) {
  const routeId = params?.id;

  if (!routeId) {
    return <div>Can&lsquo;t find the story</div>;
  }

  const storyWithPage = await getPublicStory(routeId);

  return <FlipBookView storyWithPage={storyWithPage} />;
}

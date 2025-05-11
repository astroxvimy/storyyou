'use client';

import { useEffect, useRef, useState } from 'react';

import { storyService } from '@/libs/api_service';
import type { Database } from '@/libs/supabase/types';
import { Document, Image, Page, PDFDownloadLink, PDFViewer, StyleSheet, Text } from '@react-pdf/renderer';

// interface Story {
//   id: string;
//   title: string;
//   status: 'pending' | 'text_processing' | 'text_complete' | 'image_processing' | 'image_complete' | 'complete';
// }

type Story = Database['public']['Tables']['stories']['Insert'];

interface StoryPage {
  id: string;
  page_number: number;
  page_text: string;
  page_image?: string;
}

interface StoryWithPages extends Story {
  story_pages: StoryPage[];
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 16,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  text: {
    marginBottom: 10,
  },
  image: {
    width: 400,
    height: 300,
    marginTop: 10,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});

const StoryPDF = ({ story }: { story: StoryWithPages }) => (
  <Document>
    {story.story_pages.map((page, index) => (
      <Page key={index} style={styles.page}>
        <Text style={styles.text}>Page {page.page_number}</Text>
        <Text style={styles.text}>{page.page_text}</Text>
        {page.page_image && <Image src={page.page_image} style={styles.image} />}
      </Page>
    ))}
  </Document>
);

export default function StoryViewPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [currentStory, setCurrentStory] = useState<StoryWithPages | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isImagePolling, setIsImagePolling] = useState(false);

  // Load stories on mount
  useEffect(() => {
    const fetchStories = async () => {
      const storiesData = await storyService.getStories();
      console.log('🚗Fetched stories:', storiesData.data);
      setStories(storiesData.data.stories);
    };
    fetchStories();
  }, []);

  // Load and poll current story
  useEffect(() => {
    if (!currentStoryId) return;

    const fetchStory = async () => {
      // const res = await fetch(`/api/story/${currentStoryId}`);
      const res = await storyService.getStoryStatus(currentStoryId);
      const data = res.data;
      // setCurrentStory(data);
      console.log('🚗Fetched story:', data);
      if (data.status !== 'text_complete' && data.status !== 'image_complete' && data.status !== 'book_complete') {
        console.log('🚗Story is not ready yet:', data.status);
        setIsPolling(true);
      } else {
        setIsPolling(false);
        console.log('🚗Generating images for story:', currentStoryId);
        storyService.generateImages(currentStoryId);
        console.log('🚗Image generation started');
        setIsImagePolling(true);
        console.log('🚗Image generation polling started');
      }
    };

    fetchStory();

    let interval: NodeJS.Timeout | null = null;
    if (isPolling) {
      interval = setInterval(fetchStory, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStoryId, isPolling]);

  // Poll for image status
  useEffect(() => {
    if (!currentStoryId || !isImagePolling) return;

    const fetchStoryWithImages = async () => {
      const res = await storyService.getStoryStatus(currentStoryId);
      const story = res.data;
      // setCurrentStory(story);

      if (story.status === 'image_complete') {
        setIsImagePolling(false);
        console.log('🚗Image generation complete');
        const res = await storyService.getStory(currentStoryId);
        setCurrentStory(res.data.story);
        console.log('🚗generating book for: ', currentStoryId);

        // storyService.generateBook(currentStoryId);
        return;
      }
    };

    const interval = setInterval(fetchStoryWithImages, 3000);

    return () => clearInterval(interval);
  }, [currentStoryId, isImagePolling]);

  // Handle selecting the current story (top button)
  const handleSelectCurrent = async () => {
    const res = await fetch('/api/story/current');
    const { id } = await res.json();
    setCurrentStoryId(id);
  };

  return (
    <div className='mx-auto max-w-4xl p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Your Stories</h1>

      <button onClick={handleSelectCurrent} className='mb-4 rounded bg-blue-500 px-4 py-2 text-white'>
        View Current Story
      </button>

      <div className='mb-6 flex gap-4'>
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setCurrentStoryId(story?.id || null)}
            className={`rounded border px-3 py-1 ${story.id === currentStoryId ? 'bg-blue-100' : ''}`}
          >
            {story?.story_name || 'Untitled Story'}
          </button>
        ))}
      </div>

      {currentStory && (
        <div>
          <h2 className='mb-2 text-xl font-semibold'>{currentStory.story_name}</h2>
          <p className='mb-4 text-sm italic text-gray-600'>Status: {currentStory.story_status}</p>
          {/* PDF Preview */}
          <div className='mb-6'>
            <PDFViewer width='100%' height='1200'>
              <StoryPDF story={currentStory} />
            </PDFViewer>
          </div>
          {/* {currentStory.story_pages.map((page) => (
            <div key={page.id} className='mb-6'>
              <h3 className='font-semibold'>Page {page.page_number}</h3>
              <p>{page.page_text}</p>
              {page.page_image && (
                <img src={page.page_image} alt={`Page ${page.page_number}`} className='mt-2 w-full max-w-md' />
              )}
            </div>
          ))} */}
        </div>
      )}
    </div>
  );
}

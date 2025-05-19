'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { storyService } from '@/libs/api_service';
import type { Database } from '@/libs/supabase/types';
import { Document, Image, Page, PDFDownloadLink, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

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

const BACKGROUND_IMAGE_URL = '/background.jpeg'; // Update this path as needed
const BAND_IMAGE_URL = '/band.png'; // Update this path as needed

Font.register({
  family: 'OrangeJuice',
  src: '/Orange_Juice_Regular.otf', // Place your font in the public/fonts directory
});

Font.register({
  family: 'HappyCartoonDemoRegular',
  src: '/HappyCartoonDemoRegular.ttf', // Place your font in the public/fonts directory
});

const styles = StyleSheet.create({
  pageBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  },
  imageBackground: {
    height: '100%',
    width: '100%',
  },
  page: {
    position: 'relative', // Ensure children can be absolutely positioned

    fontSize: 14,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    fontFamily: 'OrangeJuice',
  },
  header: {
    position: 'absolute',
    marginBottom: 10,
    top: 60,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 20,
    color: '#888',
    zIndex: 0,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
  },
  coverFooter: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#222',
  },
  text: {
    marginTop: 20,
    width: '70%',
    marginLeft: 'auto',
    marginRight: 'auto',
    letterSpacing: 1.2,
    lineHeight: 1.4,
    zIndex: 0,
  },
  bookTitle: {
    marginTop: 300,
    width: '70%',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: 40,
    textAlign: 'center',
    fontFamily: 'HappyCartoonDemoRegular',
    color: '#8E30B5',
  },
  image: {
    width: '65%',
    height: 'auto',
    marginTop: 90,
    marginLeft: 'auto',
    marginRight: 'auto',
    objectFit: 'contain',
    marginBottom: 10,
    borderRadius: 10,
    zIndex: 0,
  },
  band: {
    width: '100%',
    height: 'auto',
    marginTop: 170,
    objectFit: 'contain',
    zIndex: -1,
  },
});

const StoryPDF = ({ story }: { story: StoryWithPages }) => (
  <Document>
    {story.story_pages.map((page, index) =>
      index === 0 ? (
        <Page key={index} style={styles.page}>
          <View style={styles.pageBackgroundContainer}>
            <Image src={page.page_image} style={styles.imageBackground} />
          </View>
          <View style={styles.pageBackgroundContainer}>
            <Image src={BAND_IMAGE_URL} style={styles.band} />
          </View>
          <Text style={styles.bookTitle}>{story.story_name}</Text>
          <Text style={styles.coverFooter}> published by storyou.com </Text>
        </Page>
      ) : (
        <Page key={index} style={styles.page}>
          <View style={styles.pageBackgroundContainer}>
            <Image src={BACKGROUND_IMAGE_URL} style={styles.imageBackground} />
          </View>
          <Text style={styles.header}> - {story.story_name} - </Text>
          {page.page_image && <Image src={page.page_image} style={styles.image} />}
          <Text style={styles.text}>{page.page_text}</Text>
          <Text style={styles.footer}> -- Page {page.page_number} -- </Text>
        </Page>
      )
    )}
  </Document>
);

export default function StoryViewPage() {
  const params = useParams();
  const routeId = typeof params?.id === 'string' ? params.id : null;
  // const [stories, setStories] = useState<Story[]>([]);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(routeId);
  console.log('🚗😀😀😀Current story ID:', currentStoryId);
  const [currentStory, setCurrentStory] = useState<StoryWithPages | null>(null);
  const [status, setStatus] = useState<'idle' | 'text_polling' | 'image_polling' | 'image_failed'>('idle');
  const [statusText, setStatusText] = useState('');

  // Load stories on mount
  useEffect(() => {
    // const fetchStories = async () => {
    //   const storiesData = await storyService.getStories();
    //   console.log('🚗Fetched stories:', storiesData.data);
    //   setStories(storiesData.data.stories);
    // };
    // fetchStories();
  }, []);

  // poll for text status
  useEffect(() => {
    if (!currentStoryId) return;

    let interval: NodeJS.Timeout | null = null;

    const pollStoryStatus = async () => {
      try {
        const res = await storyService.getStoryStatus(currentStoryId);
        const data = res.data;
        console.log('🚗Fetched story:', data);

        if (status === 'text_polling' && data.status === 'text_complete') {
          console.log('🚗 Text complete, starting image generation...');
          await storyService.generateImages(currentStoryId);

          setStatusText('Your story model generating your story images ...');
          setStatus('image_polling');
        } else if (
          (status === 'text_polling' && data.status === 'image_complete') ||
          (status === 'text_polling' && data.status === 'image_incomplete')
        ) {
          setStatusText('Your story model generating your story images ...');
          setStatus('image_polling');
        }

        if (status === 'image_polling') {
          if (data.status === 'image_complete') {
            clearInterval(interval!);
            const res = await storyService.getStory(currentStoryId);
            setStatusText('Congratulations, your story is ready!');
            setCurrentStory(res.data.story);
            console.log('🚗 Image generation complete. Generating book...');
            // storyService.generateBook(currentStoryId);
            setStatus('idle');
          } else if (data.status === 'image_incomplete') {
            console.log('🚗 Image generation failed. Retrying...');
            await storyService.generateImages(currentStoryId); // Retry image generation
          }
        }
      } catch (error) {
        console.error('🚗 Error in polling:', error);
        setStatus('idle');
        if (interval) clearInterval(interval);
      }
    };

    // Start polling based on status
    if (status === 'text_polling' || status === 'image_polling') {
      interval = setInterval(pollStoryStatus, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStoryId, status]);

  useEffect(() => {
    if (currentStoryId) {
      setStatus('text_polling');
      setStatusText('Your story model generating your story ...');
    }
  }, [currentStoryId]);

  // Handle selecting the current story (top button)
  // const handleSelectCurrent = async () => {
  //   const res = await fetch('/api/story/current');
  //   const { id } = await res.json();
  //   setCurrentStoryId(id);
  // };

  return (
    <div className='mx-auto max-w-4xl p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Your Current Story</h1>

      {status !== 'idle' && <div>Your story is on generation, please wait for a while</div>}
      <div>{statusText}</div>

      {/* <button onClick={handleSelectCurrent} className='mb-4 rounded bg-blue-500 px-4 py-2 text-white'>
        View Current Story
      </button> */}

      {/* <div className='mb-6 flex gap-4'>
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setCurrentStoryId(story?.id || null)}
            className={`rounded border px-3 py-1 ${story.id === currentStoryId ? 'bg-blue-100' : ''}`}
          >
            {story?.story_name || 'Untitled Story'}
          </button>
        ))}
      </div> */}

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

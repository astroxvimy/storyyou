'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { FlipBookView } from '@/features/gallery/components/gallery-view';
import CopyLinkButton from '@/features/story/components/copy-link-buttion';
import { StoryWithPages } from '@/features/story/controllers/get-story';
import { storyService } from '@/libs/api_service';
import type { Database } from '@/libs/supabase/types';
import { Document, Image, Page, PDFDownloadLink, PDFViewer, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

export interface StoryPage {
  id: string;
  page_number: number;
  page_text: string;
  page_image?: string;
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
            <Image src={page.page_image ?? ''} style={styles.imageBackground} />
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
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(routeId);
  console.log('🚗😀😀😀Current story ID:', currentStoryId);
  const [currentStory, setCurrentStory] = useState<StoryWithPages | null>(null);
  const [status, setStatus] = useState<'idle' | 'text_polling' | 'image_polling' | 'image_failed'>('idle');
  const [statusText, setStatusText] = useState('');

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'generation' | 'view'>('view');

  // Load stories on mount
  useEffect(() => {
    if (!currentStoryId) return;
    setLoading(true);
    const getStoryStatus = async () => {
      const res = await storyService.getStoryStatus(currentStoryId);
      setLoading(false);
      if (res.data.status !== 'image_complete') setMode('generation');
      const storyData = await storyService.getStory(currentStoryId);
      console.log('❤️❤️❤️', storyData.data.story);
      setCurrentStory(storyData.data.story);
    };
    getStoryStatus();
  }, [currentStoryId]);

  // poll for text status
  useEffect(() => {
    if (!currentStoryId) return;
    if (mode === 'view') return;

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
            setMode('view');
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
  }, [currentStoryId, status, mode]);

  const setVisible = async () => {
    setLoading(true);
    if (currentStory) {
      const newStoryResult = await storyService.setVisible({
        storyId: currentStory.id,
        visible: currentStory.is_public ? false : true,
      });
      const newStoryWithPageResult = await storyService.getStory(newStoryResult.data.story.id);
      setCurrentStory(newStoryWithPageResult.data.story);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentStoryId) {
      setStatus('text_polling');
      setStatusText('Your story model generating your story ...');
    }
  }, [currentStoryId]);

  if (loading) return <div>Loading your story...</div>;
  else if (mode === 'generation')
    return (
      <div className='mx-auto max-w-4xl p-4'>
        {status !== 'idle' && <div>Your story is on generation, please wait for a while</div>}
        <div>{statusText}</div>

        {currentStory && (
          <div>
            <h2 className='mb-2 text-xl font-semibold'>{currentStory.story_name}</h2>
            <p className='mb-4 text-sm italic text-gray-600'>Status: {currentStory.story_status}</p>
          </div>
        )}
      </div>
    );
  else if (currentStory)
    return (
      <div>
        <div className='flex justify-end'>
          <Button
            disabled={loading}
            onClick={setVisible}
            className='mr-4 rounded-lg bg-blue-400 px-4 py-2 text-white hover:bg-blue-600'
          >
            {currentStory.is_public ? 'Set Private' : 'Set Public'}
          </Button>
          {currentStory.is_public && <CopyLinkButton id={currentStory.id} />}
          <PDFDownloadLink
            document={<StoryPDF story={currentStory} />}
            fileName={`${currentStory.story_name || 'story'}.pdf`}
            className='rounded-lg bg-blue-400 px-4 py-2 text-white hover:bg-blue-600'
          >
            Print
            {/* <img src='/download.png' alt='download' className='ml-2 inline-block h-6 w-6' /> */}
          </PDFDownloadLink>
        </div>
        <FlipBookView storyWithPage={currentStory} />
      </div>
    );
  else return <div>Can not find the story</div>;

  // return (
  //   <div className='mx-auto max-w-4xl p-4'>
  //     {status !== 'idle' && <div>Your story is on generation, please wait for a while</div>}
  //     <div>{statusText}</div>

  //     {currentStory && (
  //       <div>
  //         <h2 className='mb-2 text-xl font-semibold'>{currentStory.story_name}</h2>
  //         <p className='mb-4 text-sm italic text-gray-600'>Status: {currentStory.story_status}</p>

  //         {/* PDF Preview */}
  //         {/* <div className='mb-6'>
  //           <PDFViewer width='100%' height='1200'>
  //             <StoryPDF story={currentStory} />
  //           </PDFViewer>
  //         </div> */}

  //         <PDFDownloadLink
  //           document={<StoryPDF story={currentStory} />}
  //           fileName={`${currentStory.story_name || 'story'}.pdf`}
  //           className='rounded rounded-full bg-purple-500 px-4 py-2 text-white hover:bg-purple-600'
  //         >
  //           Donwload PDF
  //           <img src='/download.png' alt='download' className='ml-2 inline-block h-6 w-6' />
  //         </PDFDownloadLink>

  //       </div>
  //     )}
  //   </div>
  // );
}

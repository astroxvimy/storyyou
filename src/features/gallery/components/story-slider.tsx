'use client';

import { useEffect, useState } from 'react';

import { StoryWithPages } from '@/features/story/controllers/get-story';
import { Database } from '@/libs/supabase/types';
import { StoryBookCase } from './story-book-case';
import Link from 'next/link';

const GALEERY_SLIDER_LENGTH = 10;

type StoryPage = Database['public']['Tables']['story_pages']['Row'];

export function StorySlider({ storyWithPage }: { storyWithPage: StoryWithPages | null }) {
  const [pages, setPages] = useState<StoryPage[]>();

  useEffect(() => {
    setPages(storyWithPage?.story_pages);
  }, [pages]);
  // const pages = storyWithPage?.story_pages;
  let displayedPages: typeof pages;

  if (pages && pages.length >= GALEERY_SLIDER_LENGTH) {
    displayedPages = pages.slice(0, GALEERY_SLIDER_LENGTH);
  } else {
    const times = pages && Math.ceil(GALEERY_SLIDER_LENGTH / pages.length);
    displayedPages = Array(times).fill(pages).flat().slice(0, GALEERY_SLIDER_LENGTH);
  }
  return (
    <Link href={`/gallery/${storyWithPage?.id}/view`}>
        <div className='relative hover:scale-[1.02] hover:rotate-y-6 transform-gpu cursor-pointer transition-all duration-300'>
        <div className='absolute -left-4 top-0 h-full w-4 rounded-l-[8px] bg-black/30' />
        <StoryBookCase
            className='rounded-r-[4px]'
            title={storyWithPage?.story_name ?? ''}
            coverImageUrl={(pages && pages[0].page_image) ?? ''}
        />
        <div className='gallery-wrapper absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform'>
            <div className='gallery'>
            {storyWithPage?.story_name && storyWithPage?.story_name !== '' && (
                <h2 className='absolute w-fit left-1/2 top-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 transform rounded-[24px] text-center bg-black/30 px-4 py-2 text-2xl font-bold capitalize text-white shadow-lg'>
                {storyWithPage?.story_name}
                </h2>
            )}
            {displayedPages?.map(
                (page, index) =>
                page &&
                page.page_image && (
                    <img key={storyWithPage?.id + page.id + index} src={page.page_image ?? ''} alt={page.id} />
                )
            )}
            </div>
        </div>
        </div>
    </Link>
  );
}

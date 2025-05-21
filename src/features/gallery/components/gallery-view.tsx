'use client';

import React, { useEffect } from 'react';

import { StoryWithPages } from '@/features/story/controllers/get-story';

export const FlipBookView = ({ storyWithPage }: { storyWithPage: StoryWithPages | null }) => {
  useEffect(() => {
    const pages = Array.from(document.getElementsByClassName('page')) as HTMLElement[];

    pages.forEach((page, index) => {
      if (index % 2 === 0) {
        page.style.zIndex = String(pages.length - index);
      }

      page.setAttribute('data-page-num', String(index + 1));

      page.onclick = () => {
        const pageNum = index + 1;

        if (pageNum % 2 === 0) {
          page.classList.remove('flipped');
          const prev = page.previousElementSibling as HTMLElement | null;
          if (prev) prev.classList.remove('flipped');
        } else {
          page.classList.add('flipped');
          const next = page.nextElementSibling as HTMLElement | null;
          if (next) next.classList.add('flipped');
        }
      };
    });
  }, []);

  return (
    <div>
      <div className='my-6 mb-8'>
        <h1 className='text-center capitalize'>{(storyWithPage?.story_name || storyWithPage?.story_name ==='') ? storyWithPage?.story_name : 'A book powered by Storyou'}</h1>
      </div>
      <div className='flex justify-center'>
        <div className='book'>
          <div id='pages' className='pages'>
            {storyWithPage?.story_pages.map((page, index) => {
              if (index === 0)
                return (
                  <div key={page.id + storyWithPage.id + index} className='page overflow-hidden text-black'>
                    <img
                      src={page.page_image ?? ''}
                      alt={`${storyWithPage.story_name}-image-${index}`}
                      className='h-full w-full object-cover'
                    />
                  </div>
                );
              else
                return (
                  <React.Fragment key={page.id + storyWithPage.id + index}>
                    <div className='page overflow-hidden text-black'>
                      <img
                        src={page.page_image ?? ''}
                        alt={`${storyWithPage.story_name}-image-${index}`}
                        className='h-full w-full object-cover'
                      />
                    </div>
                    <div className='page overflow-hidden text-black flex justify-center items-center'>
                      <p className='text-[6px] sm:text-sm md:text-md lg:text-lg px-8'>{page.page_text}</p>
                    </div>
                  </React.Fragment>
                );
            })}
          </div>
        </div>
      </div>
      <div className='mt-4'>
        <h1 className='text-center text-neutral-700 text-lg capitalize'>{'Powered by Storyou'}</h1>
      </div>
    </div>
  );
};

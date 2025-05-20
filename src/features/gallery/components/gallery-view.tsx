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

  //   const renderPages = () => {
  //     const texts: Record<number, string> = {
  //       0: 'Open Me, <br>please!',
  //       2: 'Hello there!',
  //     };

  //     return Array.from({ length: 34 }, (_, i) => (
  //       <div
  //         key={i}
  //         className="page"
  //         dangerouslySetInnerHTML={{ __html: texts[i] || '' }}
  //       />
  //     ));
  //   };

  return (
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
              <>
                <div key={page.id + storyWithPage.id + index + 'image'} className='page overflow-hidden text-black'>
                  <img
                    src={page.page_image ?? ''}
                    alt={`${storyWithPage.story_name}-image-${index}`}
                    className='h-full w-full object-cover'
                  />
                </div>
                <div key={page.id + storyWithPage.id + index + 'text'} className='page overflow-hidden text-black'>
                  <p className='text-md'>{page.page_text}</p>
                </div>
              </>
            );
        })}
      </div>
    </div>
  );
};

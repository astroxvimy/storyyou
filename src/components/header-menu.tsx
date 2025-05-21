'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MdOutlineCreateNewFolder } from 'react-icons/md';
import { RiGalleryView, RiPriceTagLine } from 'react-icons/ri';

export const HeaderMenu = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className='flex gap-8'>
      {/* Create Link */}
      <div
        className='flex items-center rounded-full px-2 py-2 transition-all duration-300 hover:bg-purple-800 hover:px-6'
        onMouseEnter={() => setHoveredItem('create')}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <Link href='/create' className='flex items-center'>
          <MdOutlineCreateNewFolder className='h-8 w-8 text-gray-300 transition-colors duration-300' />
          {hoveredItem === 'create' && (
            <span className='ml-2 text-sm font-bold text-gray-300 transition-opacity duration-300'>Create</span>
          )}
        </Link>
      </div>

      {/* Gallery Link */}
      <div
        className='flex items-center rounded-full px-2 py-2 transition-all duration-300 hover:bg-purple-800 hover:px-6'
        onMouseEnter={() => setHoveredItem('gallery')}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <Link href='/gallery' className='flex items-center'>
          <RiGalleryView className='h-8 w-8 text-gray-300 transition-colors duration-300' />
          {hoveredItem === 'gallery' && (
            <span className='ml-2 text-sm font-bold text-gray-300 transition-opacity duration-300'>Gallery</span>
          )}
        </Link>
      </div>

      {/* Pricing Link */}
      <div
        className='flex items-center rounded-full px-2 py-2 transition-all duration-300 hover:bg-purple-800 hover:px-6'
        onMouseEnter={() => setHoveredItem('pricing')}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <Link href='/pricing' className='flex items-center'>
          <RiPriceTagLine className='h-8 w-8 text-gray-300 transition-colors duration-300' />
          {hoveredItem === 'pricing' && (
            <span className='ml-2 text-sm font-bold text-gray-300 transition-opacity duration-300'>Pricing</span>
          )}
        </Link>
      </div>
    </div>
  );
};

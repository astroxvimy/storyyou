import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href='/' className='flex w-fit items-center gap-2'>
      <Image
        src='/favicon/android-chrome-512x512.png'
        width={40}
        height={40}
        priority
        quality={100}
        alt='Storyou logo mark'
      />
      <span className='font-alt text-xl font-bold text-[#27B7D4]'>Storyou</span>
    </Link>
  );
}

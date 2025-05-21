import Image from 'next/image';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import {
  getCustomerBasicBalance,
  getCustomerHobbyBalance,
  getCustomerProBalance,
} from '@/features/account/controllers/get-balance';
import { getSessionUser } from '@/features/account/controllers/get-session';
import { cn } from '@/utils/cn';

export default async function AccountPage() {
  const user = await getSessionUser();

  let [basic, hobby, pro]: [number, number, number] = [0, 0, 0];

  const userId = user?.id;

  if (userId && userId.trim() !== '') {
    [basic, hobby, pro] = await Promise.all([
      getCustomerBasicBalance({ userId }),
      getCustomerHobbyBalance({ userId }),
      getCustomerProBalance({ userId }),
    ]);
  } else {
    throw new Error('Invalid or missing userId in session');
  }

  return (
    <section className='relative rounded-lg bg-black px-4 py-16'>
      <div className='relative z-10'>
        <h1 className='text-center text-white'>Account</h1>
        <div className='flex flex-col items-center gap-4'>
          <section className='flex w-full flex-col items-center gap-8 rounded-lg p-10 px-4 text-center'>
            <p className='text-medium items center flex gap-3 font-bold text-neutral-300'>
              <FaUser className='text-xl' />
              Email: {user?.email}
            </p>
          </section>
          <section className='flex w-[50%] flex-col items-center gap-2 rounded-lg bg-zinc-900 p-6'>
            <h3 className='mb-2 text-xl font-semibold'>Balance</h3>
            {[
              { label: 'Total credits', value: basic + hobby + pro },
              { label: 'Basic credits', value: basic },
              { label: 'Hobby credits', value: hobby },
              { label: 'Pro credits', value: pro },
            ].map((b, index) => (
              <p
                key={index}
                className={cn(
                  'flex w-full items-center justify-between text-2xl font-bold',
                  b.value > 0 ? 'text-green-400' : 'text-red-400'
                )}
              >
                <span className='text-xl font-normal capitalize text-neutral-500'>{`${b.label} credits`}</span>
                {b.value}
              </p>
            ))}
            <h3 className='mb-2 text-center text-xl font-semibold'>Need more credits?</h3>
            <Button asChild variant='sexy'>
              <Link href='/pricing'>Buy new credits</Link>
            </Button>
          </section>
        </div>
      </div>

      <Image
        src='/section-bg.png'
        width={1440}
        height={462}
        alt=''
        className='absolute left-0 top-0 rounded-t-lg'
        quality={100}
      />
    </section>
  );
}

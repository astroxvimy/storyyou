import Image from 'next/image';
import Link from 'next/link';
import { FaUser } from "react-icons/fa";

import { Button } from '@/components/ui/button';
import { getCustomerBalance, getCustomerBasicBalance, getCustomerHobbyBalance, getCustomerProBalance } from '@/features/account/controllers/get-balance';
import { getSession } from '@/features/account/controllers/get-session';
import { cn } from '@/utils/cn';

export default async function AccountPage() {
  const session = await getSession();
  const [total, basic, hobby, pro] = await Promise.all([getCustomerBalance({userId: session?.user.id ?? ''}), getCustomerBasicBalance({userId: session?.user.id ?? ''}), getCustomerHobbyBalance({userId: session?.user.id ?? ''}), getCustomerProBalance({userId: session?.user.id ?? ''})]);


  return (
    <section className='relative rounded-lg bg-black px-4 py-16'>
      <div className='relative z-10'>
        <h1 className='text-center text-white'>Account</h1>
        <div className='flex flex-col gap-4 items-center'>
          <section className='flex w-full flex-col items-center gap-8 rounded-lg p-10 px-4 text-center'>
            <p className='text-neutral-300 font-bold text-medium flex gap-3 items center'><FaUser className='text-xl'/>Email: {session?.user?.email}</p>
          </section>
          <section className='rounded-lg bg-zinc-900 p-6 w-[50%] flex flex-col gap-2 items-center'>
            <h3 className='text-xl font-semibold mb-2'>Balance</h3>
            {[total, basic, hobby, pro].map((b, index) => <p key={index} className={cn('w-full flex justify-between items-center text-2xl font-bold', b > 0 ? 'text-green-400' : 'text-red-400')}><span className='text-neutral-500 text-xl font-normal'>Total credits</span>{b}</p> )}
            <h3 className='text-xl font-semibold mb-2 text-center'>Need more credits?</h3>
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

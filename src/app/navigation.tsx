import Link from 'next/link';
import { FaBookOpen } from "react-icons/fa6";
import { GrLogout } from "react-icons/gr";
import { HiUserGroup } from 'react-icons/hi2';

// import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { getCustomerBasicBalance, getCustomerHobbyBalance, getCustomerProBalance } from '@/features/account/controllers/get-balance';
// import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { getSession } from '@/features/account/controllers/get-session';

import { signOut } from './(auth)/auth-actions';

export async function Navigation() {
  const session = await getSession();
  const basic = await getCustomerBasicBalance({userId: session?.user.id ?? ''});
  const pro = await getCustomerProBalance({userId: session?.user.id ?? ''});
  const hobby = await getCustomerHobbyBalance({userId: session?.user.id ?? ''});

  return (
    <div className='relative flex items-center gap-6'>
      {session ? (
        <>
          <Button className='text-xl hover:scale-[1.05]'>
            <Link href='/account'>
              <HiUserGroup />
            </Link>
          </Button>
          <BookWithBadge balance={(basic + pro + hobby) ?? 0}></BookWithBadge>
          <Button className='text-xl hover:scale-[1.05]' onClick={signOut}><GrLogout /></Button>
        </>
      ) : (
        <>

          <Button variant='sexy' className='hidden flex-shrink-0 lg:flex' asChild>
            <Link href='/login'>login</Link>
          </Button>
          {/* <Sheet>
            <SheetTrigger className='block lg:hidden'>
              <IoMenu size={28} />
            </SheetTrigger>
            <SheetContent className='w-full bg-black'>
              <SheetHeader>
                <Logo />
                <SheetDescription className='py-8'>
                  <Button variant='sexy' className='flex-shrink-0' asChild>
                    <Link href='/signup'>Get started for free</Link>
                  </Button>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet> */}
        </>
      )}
    </div>
  );
}

function BookWithBadge({balance, onBalanceClick}: {balance: number, onBalanceClick?: () => {}}) {
  return (
    <div className="relative inline-block">
      <Button className='text-xl hover:scale-[1.05]' onClick={onBalanceClick}><FaBookOpen /></Button>
      <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
        {balance}
      </span>
    </div>
  )
}

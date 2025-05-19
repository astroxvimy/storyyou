import { PropsWithChildren } from 'react';
import { redirect } from 'next/navigation';

import { getSession } from '@/features/account/controllers/get-session';

export default async function AccountLayout({ children }: PropsWithChildren) {
  const session = await getSession();
  // if (!session) {
  //     redirect('/login');
  // }
  return children;
}

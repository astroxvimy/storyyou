import { PropsWithChildren } from 'react';
import { redirect } from 'next/navigation';

import { getSessionUser } from '@/features/account/controllers/get-session';

export default async function AccountLayout({ children }: PropsWithChildren) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }
  return children;
}

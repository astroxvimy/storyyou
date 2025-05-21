import { redirect } from 'next/navigation';

import { getSession } from '@/features/account/controllers/get-session';

import { signInWithOAuth,signUpWithEmail } from '../auth-actions';
import { AuthUI } from '../auth-ui';

export default async function SignUp() {
  const session = await getSession();

  if (session) {
    redirect('/');
  }

  return (
    <section className='py-xl m-auto flex h-full max-w-lg items-center'>
      <AuthUI mode='signup' signInWithOAuth={signInWithOAuth} signInWithEmail={signUpWithEmail} />
    </section>
  );
}

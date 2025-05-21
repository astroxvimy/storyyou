import { redirect } from 'next/navigation';

import { getSessionUser } from '@/features/account/controllers/get-session';
import { getSubscription } from '@/features/account/controllers/get-subscription';

import { signInWithOAuth,signUpWithEmail } from '../auth-actions';
import { AuthUI } from '../auth-ui';

export default async function SignUp() {
  const user = await getSessionUser();

  if (user) {
    redirect('/');
  }

  return (
    <section className='py-xl m-auto flex h-full max-w-lg items-center'>
      <AuthUI mode='signup' signInWithOAuth={signInWithOAuth} signInWithEmail={signUpWithEmail} />
    </section>
  );
}

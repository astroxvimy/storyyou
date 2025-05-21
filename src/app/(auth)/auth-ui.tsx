'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoLogoGithub, IoLogoGoogle } from 'react-icons/io5';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ActionResponse } from '@/types/action-response';

const titleMap = {
  login: 'Login',
  signup: 'Signup',
} as const;

export function AuthUI({
  mode,
  signInWithOAuth,
  signInWithEmail,
}: {
  mode: 'login' | 'signup';
  signInWithOAuth: (provider: 'github' | 'google') => Promise<ActionResponse>;
  signInWithEmail: (email: string, password: string) => Promise<ActionResponse>;
}) {
  const [pending, setPending] = useState(false);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = event.target as HTMLFormElement;
    const email = form['email'].value;
    const password = form['password'].value;
    const passwordConfirm = mode === 'signup' ? form['passwordConfirm'].value : '';

    if(mode === 'signup' && password !== passwordConfirm) {
      toast({
        variant: 'destructive',
        description: 'Passwords do not match. Please try again.',
      });
      setPending(false);
      return;
    }

    const response = await signInWithEmail(email, password);

    if (response?.error) {
      toast({
        variant: 'destructive',
        description: 'An error occurred while authenticating. Please try again.',
      });
    } else if (response?.data) {
      toast({
        variant: 'default',
        description: 'Successfully logined!'
      })
    } else {
      toast({
        description: `To continue, click the link in the email sent to: ${email}`,
      });
    }

    form.reset();
    setPending(false);
  }

  async function handleOAuthClick(provider: 'google' | 'github') {
    setPending(true);
    const response = await signInWithOAuth(provider);

    if (response?.error) {
      toast({
        variant: 'destructive',
        description: 'An error occurred while authenticating. Please try again.',
      });
      setPending(false);
    }
  }

  return (
    <section className='mt-16 flex w-full flex-col gap-4 rounded-lg bg-black p-10 px-4 text-center'>
      <div className='flex flex-col'>
        <h1 className='text-2xl'>{titleMap[mode]}</h1>
      </div>
      <div className='flex flex-col gap-4 px-8'>
        <div className='w-full'>
          <form onSubmit={handleEmailSubmit}>
            <Input
              type='email'
              name='email'
              placeholder='Enter your email'
              aria-label='Enter your email'
              autoFocus
              className='bg-zinc-900'
            />
            <Input
              type='password'
              name='password'
              placeholder='Enter your password'
              aria-label='Enter your password'
              autoFocus
              className='mt-2 bg-zinc-900'
            />
            {
              mode === 'signup' &&
              (<Input
                type='password'
                name='passwordConfirm'
                placeholder='Confirm your password'
                aria-label='Confirm your password'
                className='mt-2 bg-zinc-900'
                autoFocus
              />)
            }
            <div className='mt-4 flex justify-end gap-2'>
              <Button variant='secondary' type='submit'>
                {mode === 'signup' ? `Submit` : `login`}
              </Button>
            </div>
          </form>
        </div>
        <Button
          variant="sexy"
          className='w-full flex items-center gap-4 text-bg-neutral-500 justify-center rounded-mdfont-medium'
          onClick={() => handleOAuthClick('google')}
          disabled={true}
        >
          <IoLogoGoogle size={20} />
          Continue with Google
        </Button>       
      </div>
      {mode === 'signup' && (
        <span>Already have an account? <Link href='/login' className="underline">Login</Link></span>
      )}
      {mode === 'login' && (
        <span>New to Storyou? <Link href='/signup' className='underline'>Register</Link></span>
      )}
      {mode === 'signup' && (
        <span className='text-neutral5 m-auto max-w-sm text-sm'>
          By clicking continue, you agree to our{' '}
          <Link href='/terms-and-policy' className='underline inline-block'>
            Terms and Policy
          </Link>.
        </span>
      )}
    </section>
  );
}

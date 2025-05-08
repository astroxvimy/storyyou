import { getSession } from '@/features/account/controllers/get-session';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<string> {
  try {
    // 1. Get the user session
    const session = await getSession();

    // 2. Validate the session and user ID
    if (!session || !session.user?.id) {
      throw new Error('User session is invalid or user ID is missing.');
    }

    // 3. Return the user ID
    return session.user.id;
  } catch (error) {
    // Log the error for debugging purposes (optional)
    console.error('Error fetching user ID:', error);

    // Throw a more descriptive error
    throw new Error('Failed to retrieve user ID. Please ensure you are logged in.');
  }
}

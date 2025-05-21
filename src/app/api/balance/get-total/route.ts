import { NextRequest, NextResponse } from 'next/server';

import { getCustomerBalance } from '@/features/account/controllers/get-balance';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  try {
    const balance = await getCustomerBalance({userId});
    return NextResponse.json({ balance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

import { getCustomerProBalance } from '@/features/account/controllers/get-balance';



export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  try {
    const balance = await getCustomerProBalance({userId});
    return NextResponse.json({ balance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

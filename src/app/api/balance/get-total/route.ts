import { NextRequest, NextResponse } from 'next/server';

import { getCustomerBasicBalance, getCustomerProBalance, getCustomerHobbyBalance } from '@/features/account/controllers/get-balance';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  try {
    const basic = await getCustomerBasicBalance({userId});
    const pro = await getCustomerProBalance({userId});
    const hobby = await getCustomerHobbyBalance({userId});

    const total = basic + pro + hobby;
    return NextResponse.json({ balance: total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}

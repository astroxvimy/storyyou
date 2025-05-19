import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';

export async function getCustomerBalance({ userId }: { userId: string }) {
  try {
    const basicBalance = getCustomerBasicBalance({userId});
    const proBalance = getCustomerProBalance({userId});
    const hobbyBalance = getCustomerHobbyBalance({userId});
    const balances = await  Promise.all([basicBalance, proBalance, hobbyBalance]);

    const totalBalnce = balances.filter(b => b != null).reduce((s, v) => (s ?? 0) + (v ?? 0), 0);
    return totalBalnce;

  } catch (error) {
    throw new Error('Error fetching customer balance');
  }
}

export async function getCustomerBasicBalance({ userId }: { userId: string }) {
  const { data, error } = await supabaseAdminClient
    .from('customers')
    .select('basic_balance')
    .eq('id', userId)
    .single();

    console.log('Basic🦋\n', userId, '\n', data?.basic_balance);

    if (error) {
      throw new Error('Error fetching customer basic balance');
    }

  return data.basic_balance;
}

export async function getCustomerProBalance({ userId }: { userId: string }) {
  const { data, error } = await supabaseAdminClient
    .from('customers')
    .select('pro_balance')
    .eq('id', userId)
    .single();
    console.log('Pro🦋\n', userId, '\n', data?.pro_balance);

  if (error) {
    throw new Error('Error fetching customer pro balance');
  }

  return data.pro_balance;
}


export async function getCustomerHobbyBalance({ userId }: { userId: string }) {
  const { data, error } = await supabaseAdminClient
    .from('customers')
    .select('hobby_balance')
    .eq('id', userId)
    .single();

    console.log('Hobby🦋\n', userId, '\n', data?.hobby_balance);

  if (error) {
    throw new Error('Error fetching customer hobby balance');
  }

  return data.hobby_balance;
}

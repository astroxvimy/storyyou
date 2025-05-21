import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';
import { getEnvVar } from '@/utils/get-env-var';

export async function getCustomerBalance({ userId }: { userId: string }) {
  try {
    const basicBalance = getCustomerBasicBalance({userId});
    const proBalance = getCustomerProBalance({userId});
    const hobbyBalance = getCustomerHobbyBalance({userId});
    const balances = await  Promise.all([basicBalance, proBalance, hobbyBalance]);

    const totalBalnce = balances.filter(b => b != null).reduce((s, v) => (s ?? 0) + (v ?? 0), 0);
    return totalBalnce  ?? 0;

  } catch (error) {
    throw new Error('Error getting total balance');
  }
}

export async function getCustomerBasicBalance({ userId }: { userId: string }) {
  const { data, error } = await supabaseAdminClient
    .from('customers')
    .select('basic_balance')
    .eq('id', userId)
    .single();

    if (error) {
      throw new Error(error.message);
    }

  return data.basic_balance ?? 0;
}

export async function getCustomerProBalance({ userId }: { userId: string }) {
  const { data, error } = await supabaseAdminClient
    .from('customers')
    .select('pro_balance')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.pro_balance ?? 0;
}

export async function getCustomerHobbyBalance({ userId }: { userId: string }) {
  const { data, error } = await supabaseAdminClient
    .from('customers')
    .select('hobby_balance')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.hobby_balance ?? 0;
}

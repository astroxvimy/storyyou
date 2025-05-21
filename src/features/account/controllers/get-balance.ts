import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';
import { getEnvVar } from '@/utils/get-env-var';

export async function getCustomerBalance({ userId }: { userId: string }) {
  try {
    const basicBalance = await getCustomerBasicBalance({userId});
    const proBalance = await getCustomerProBalance({userId});
    const hobbyBalance = await getCustomerHobbyBalance({userId});

    const total = basicBalance + proBalance + hobbyBalance;
    return total;

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

  return data?.basic_balance ?? 0;
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

  return data?.pro_balance ?? 0;
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

  return data?.hobby_balance ?? 0;
}

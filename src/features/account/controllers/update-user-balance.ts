import { productMetadataSchema } from "@/features/pricing/models/product-metadata";
import { supabaseAdminClient } from "@/libs/supabase/supabase-admin";

export async function upsertUserBalance({
    productId,
    userId
}: {productId: string, userId: string}) {
    const {data, error: productFetchError} = await supabaseAdminClient
    .from('products')
    .select('metadata')
    .eq('id', productId)
    .single();

    const productMetadata = productMetadataSchema.parse(data?.metadata);

    let updateColumn = '';
    let incrementValue = 0;

    switch (productMetadata.priceCardVariant) {
        case 'basic':
            updateColumn = 'basic_balance';
            incrementValue = 1;
            break;
        case 'pro':
            updateColumn = 'pro_balance';
            incrementValue = 8;
            break;
        case 'hobby':
            updateColumn = 'hobby_balance';
            incrementValue = 3;
            break;
        default:
            throw new Error('Unknown priceCardVariant');
    }

    const { error } = await supabaseAdminClient
        .rpc('increment_customer_balance', {
        column_name: updateColumn,
        increment_by: incrementValue,
        user_id: userId
        });

    if (error) {
    console.error('Failed to update balance:', error.message);
    }
}
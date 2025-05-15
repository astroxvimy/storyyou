import z from 'zod';

export const priceCardVariantSchema = z.enum(['basic', 'pro', 'hobby']);

export const productMetadataSchema = z
  .object({
    price_card_variant: priceCardVariantSchema,
    credit_count: z.string().optional(),
    story_length: z.enum(['basic', 'pro']),
    multi_language: z.enum(['on', 'off']),
  })
  .transform((data) => ({
    priceCardVariant: data.price_card_variant,
    credit_count: data.credit_count ? parseInt(data.credit_count.toString()) : 0,
    story_length: data.story_length,
    multi_language: data.multi_language,
  }));

export type ProductMetadata = z.infer<typeof productMetadataSchema>;
export type PriceCardVariant = z.infer<typeof priceCardVariantSchema>;

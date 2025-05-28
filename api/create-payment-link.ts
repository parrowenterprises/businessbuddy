import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil'
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { invoice_id, amount, customer_email, description } = req.body;

    // First create a product
    const product = await stripe.products.create({
      name: description,
    });

    // Then create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
    });

    // Create a payment link using the price
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: { 
        type: 'redirect',
        redirect: { 
          url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice_id}?status=paid` 
        } 
      },
    });

    // Save the payment link to the database
    const { error: dbError } = await supabase
      .from('payment_links')
      .insert([{
        invoice_id,
        url: paymentLink.url,
      }]);

    if (dbError) {
      throw dbError;
    }

    return res.status(200).json({ url: paymentLink.url });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return res.status(500).json({ error: 'Error creating payment link' });
  }
} 
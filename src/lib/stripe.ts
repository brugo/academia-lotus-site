import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-04-22.dahlia' as any,
  appInfo: {
    name: 'Academia Lótus',
    version: '1.0.0',
  },
});

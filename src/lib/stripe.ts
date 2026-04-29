import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10', // Updated to match CLI
  appInfo: {
    name: 'Academia Lótus',
    version: '1.0.0',
  },
});

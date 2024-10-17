import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { sessionId } = await req.json();

    // Retrieve the session to ensure it exists before deleting
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'unpaid') {
      return NextResponse.json({ error: 'Invalid or already processed session' }, { status: 400 });
    }

    // Check if the customer exists before deleting
    try {
      const customer = await stripe.customers.retrieve(session.customer);
      if (customer) {
        // Optionally, delete the customer if you want to clean up
        await stripe.customers.del(session.customer);
      }
    } catch (error) {
      if (error.code === 'resource_missing') {
        console.warn('Customer does not exist or was already deleted');
      } else {
        throw error;
      }
    }

    return NextResponse.json({ success: true, message: 'Payment session cleared' });
  } catch (error) {
    console.error('Error clearing payment session:', error);
    return NextResponse.json({ error: 'Failed to clear payment session' }, { status: 500 });
  }
}

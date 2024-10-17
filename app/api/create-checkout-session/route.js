import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { fname, lname, email, username, password, phone, paymentMethod, total } = await req.json();

    // Create a Stripe customer to store the user's details
    const customer = await stripe.customers.create({
      email,
      name: `${fname} ${lname}`,
      phone,
      metadata: {
        username,
        password,
      },
    });

    // Create the Checkout Session (initialize session here)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [paymentMethod], // Dynamic payment method
      customer: customer.id, // Associate the customer with this session
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: 'แผนการชำระเงินระบบ POS',
            },
            unit_amount: total * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Use session.id after it's initialized
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/get-pos/success?session_id={CHECKOUT_SESSION_ID}&fname=${encodeURIComponent(fname)}&lname=${encodeURIComponent(lname)}&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&phone=${encodeURIComponent(phone)}&password=${encodeURIComponent(password)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/get-pos/cancel?session_id={CHECKOUT_SESSION_ID}`, 
    });

    // Return the session ID and URL
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

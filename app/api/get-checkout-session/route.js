import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  try {
    // Retrieve the checkout session from Stripe using the session_id
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return new Response(JSON.stringify(session), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error retrieving Stripe session:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve session' }),
      { status: 500 }
    );
  }
}

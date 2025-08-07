const { setSubscription } = require('../lib/db');

exports.handler = async (event) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    const message = 'Stripe configuration missing';
    console.error(message);
    return { statusCode: 500, body: JSON.stringify({ error: message }) };
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      event.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return { statusCode: 400, body: 'Webhook Error' };
  }

  if (stripeEvent.type === 'customer.subscription.updated') {
    const subscription = stripeEvent.data.object;
    try {
      const customer = await stripe.customers.retrieve(subscription.customer);
      const email = customer.email;
      const active = subscription.status === 'active';
      await setSubscription(email, active);
    } catch (err) {
      console.error('Failed to update subscription cache', err);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

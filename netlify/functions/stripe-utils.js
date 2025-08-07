const Stripe = require('stripe');

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key is not configured');
  }
  return Stripe(process.env.STRIPE_SECRET_KEY);
}

async function getActiveSubscription(email) {
  const stripe = getStripe();
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (!customers.data.length) {
    return null;
  }
  const subscriptions = await stripe.subscriptions.list({
    customer: customers.data[0].id,
    status: 'active',
    limit: 1,
  });
  return subscriptions.data[0] || null;
}

module.exports = { getActiveSubscription };

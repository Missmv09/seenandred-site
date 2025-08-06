const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  const email = req.query.email || (req.body && req.body.email);
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) {
      return res.json({ active: false });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1
    });

    const active = subscriptions.data.length > 0;
    res.json({ active });
  } catch (err) {
    console.error('Stripe check failed', err);
    res.status(500).json({ error: 'Internal error' });
  }
};

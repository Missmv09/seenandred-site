const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  let email;
  try {
    ({ email } = JSON.parse(event.body || '{}'));
  } catch (e) {
    email = null;
  }

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email required' })
    };
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) {
      return {
        statusCode: 200,
        body: JSON.stringify({ activated: false })
      };
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1
    });

    const active = subscriptions.data.length > 0;
    return {
      statusCode: 200,
      body: JSON.stringify({ activated: active })
    };
  } catch (err) {
    console.error('Stripe activation failed', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal error' })
    };
  }
};

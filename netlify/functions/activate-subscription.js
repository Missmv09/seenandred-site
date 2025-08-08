const { verifySession } = require('./token');

exports.handler = async (event) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const message = 'Stripe secret key is not configured';
    console.error(message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message })
    };
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const authHeader = event.headers && event.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;
  const email = verifySession(token);

  if (!email) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
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

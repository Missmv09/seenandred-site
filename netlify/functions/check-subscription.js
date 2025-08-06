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
  const email =
    (event.queryStringParameters && event.queryStringParameters.email) ||
    (event.body && JSON.parse(event.body).email);

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
        body: JSON.stringify({ active: false })
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
      body: JSON.stringify({ active })
    };
  } catch (err) {
    console.error('Stripe check failed', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal error' })
    };
  }
};

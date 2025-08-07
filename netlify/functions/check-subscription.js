const { getActiveSubscription } = require('./stripe-utils');

exports.handler = async (event) => {
  const email =
    (event.queryStringParameters && event.queryStringParameters.email) ||
    (event.body && JSON.parse(event.body).email);

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email required' }),
    };
  }

  try {
    const subscription = await getActiveSubscription(email);
    return {
      statusCode: 200,
      body: JSON.stringify({ active: Boolean(subscription) }),
    };
  } catch (err) {
    console.error('Stripe query failed', err);
    const message =
      err.message === 'Stripe secret key is not configured'
        ? err.message
        : 'Internal error';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
};

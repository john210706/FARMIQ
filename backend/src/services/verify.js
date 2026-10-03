const { fail } = require('../domain');
function configured() {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    /^VA[a-f0-9]{32}$/i.test(process.env.TWILIO_VERIFY_SERVICE_SID || '')
  );
}
async function request(resource, values) {
  if (!configured()) fail(503, 'SMS sign-in is not configured. Use your password.');
  let response;
  try {
    response = await fetch(
      `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SERVICE_SID}/${resource}`,
      {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString(
              'base64',
            ),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(values),
      },
    );
  } catch {
    fail(503, 'SMS verification is temporarily unavailable. Please try again later.');
  }
  if (response.status === 404 && resource === 'VerificationCheck') fail(400, 'Invalid or expired code');
  if (response.status === 429) fail(429, 'Too many verification requests. Please try again later.');
  if (!response.ok) fail(502, 'SMS verification is temporarily unavailable. Please try again later.');
  return response.json();
}
module.exports = { configured, request };

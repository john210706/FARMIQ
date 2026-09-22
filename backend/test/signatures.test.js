const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { validSignature } = require('../src/routes/payments');
const { signatureValid } = require('../src/routes/channels');
const channelI18n = require('../src/i18n');
test('payment signature binds exact raw bytes, rejects tampering and malformed signatures', () => {
  const raw = Buffer.from('{"event":"payment.captured"}'),
    secret = 'test-webhook';
  const sig = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  assert.equal(validSignature(raw, sig, secret), true);
  assert.equal(validSignature(Buffer.from('{}'), sig, secret), false);
  assert.equal(validSignature(raw, 'bad', secret), false);
  assert.equal(validSignature(raw, sig, ''), false);
});
test('SMS signature binds URL and all form values', () => {
  const url = 'https://example.com/api/channels/sms',
    params = { Body: 'STATUS', From: '+919000000001' },
    secret = 'test-token';
  const sig = crypto
    .createHmac('sha1', secret)
    .update(url + 'BodySTATUSFrom+919000000001')
    .digest('base64');
  assert.equal(signatureValid(url, params, sig, secret), true);
  assert.equal(signatureValid(url, { ...params, Body: 'BOOK' }, sig, secret), false);
  assert.equal(signatureValid('https://attacker.com', params, sig, secret), false);
});
test('SMS and IVR prompts honor Tamil and Hindi account languages', () => {
  assert.match(channelI18n.text('menu', 'ta'), /வரவேற்கிறோம்/);
  assert.match(channelI18n.text('menu', 'hi'), /स्वागत/);
  assert.equal(channelI18n.status('IN_TRANSIT', 'ta'), 'போக்குவரத்தில்');
  assert.equal(channelI18n.status('COMPLETED', 'hi'), 'पूर्ण');
  assert.equal(channelI18n.voiceLanguage('ta'), 'ta-IN');
});

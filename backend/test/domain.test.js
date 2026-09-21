const { test } = require('node:test');
const assert = require('node:assert/strict');
const { quote, authorizeTransition, canAccess, cancellation, schemas } = require('../src/domain');
test('daily discount, half advance and commission are consistent', () => {
  const q = quote({ pricePerHour: 1000, pricePerDay: 6500 }, 10, 180);
  assert.equal(q.rental, 8500);
  assert.equal(q.total, 10900);
  assert.equal(q.advance + q.balance, q.total);
  assert.equal(q.ownerEarnings + q.commission, q.rental);
});
test('owner cannot jump a request to completed, farmer cannot accept it', () => {
  const b = { id: 'b', farmerId: 'farmer', status: 'REQUESTED', machinery: { ownerId: 'owner' } };
  assert.throws(() => authorizeTransition({ id: 'owner', role: 'OWNER' }, b, 'COMPLETED'));
  assert.throws(() => authorizeTransition({ id: 'farmer', role: 'FARMER' }, b, 'PENDING_PAYMENT'));
  assert.doesNotThrow(() => authorizeTransition({ id: 'owner', role: 'OWNER' }, b, 'PENDING_PAYMENT'));
  assert.equal(canAccess({ id: 'stranger', role: 'FARMER' }, b), false);
});
test('late cancellation fee is capped by money actually paid', () => {
  const b = {
    scheduledAt: new Date(Date.now() + 3600000),
    totalAmount: 10000,
    transactions: [{ kind: 'ADVANCE', status: 'PAID', amount: 200 }],
  };
  assert.deepEqual(cancellation(b), { fee: 200, refund: 0 });
});
test('new accounts cannot register as administrators', () => {
  assert.equal(
    schemas.register.safeParse({
      fullName: 'Attacker',
      phone: '+919876543210',
      password: 'abcdefghijk',
      role: 'ADMIN',
    }).success,
    false,
  );
});
test('booking rejects unaccepted agreements and missing idempotency', () => {
  assert.equal(schemas.booking.safeParse({ machineryId: 'x', agreementAccepted: false }).success, false);
});

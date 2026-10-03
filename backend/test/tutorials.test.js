const { test } = require('node:test');
const assert = require('node:assert/strict');
const { schema, youtubeId } = require('../src/services/tutorials');
const { starterTutorials } = require('../src/learning-data');

test('learning links accept known YouTube shapes and reject lookalike hosts', () => {
  assert.equal(youtubeId('https://youtu.be/UMG5Wmskswc'), 'UMG5Wmskswc');
  assert.equal(youtubeId('https://www.youtube.com/watch?v=UMG5Wmskswc'), 'UMG5Wmskswc');
  for (const value of [
    'https://youtube.com.evil.test/watch?v=UMG5Wmskswc',
    'https://evil.test/embed/UMG5Wmskswc',
    'javascript:alert(1)',
    'https://youtube.com/watch?v=bad',
  ])
    assert.equal(youtubeId(value), null);
  const direct = { ...starterTutorials[0], videoUrl: 'https://example.com/safety.mp4' };
  assert.equal(schema.safeParse(direct).success, false, 'Published direct videos must have captions');
  assert.equal(schema.safeParse({ ...direct, captionsUrl: 'https://example.com/en.vtt' }).success, true);
  assert.equal(
    schema.safeParse({ ...direct, published: false }).success,
    true,
    'Drafts can be completed later',
  );
  assert.equal(schema.safeParse({ ...direct, videoUrl: 'https://example.com/watch?id=1' }).success, false);
  assert.equal(starterTutorials.filter((t) => t.published).length, 9);
  for (const tutorial of starterTutorials) assert.equal(schema.safeParse(tutorial).success, true);
});

test(
  'publishing a saved video draft validates existing captions and rejects bypass through partial updates',
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    const url = new URL(process.env.TEST_DATABASE_URL);
    assert.ok(['localhost', '127.0.0.1'].includes(url.hostname) && url.pathname.includes('test'));
    process.env.DATABASE_URL = url.href;
    const { prisma } = require('../src/config');
    const app = require('../src/app');
    const request = require('supertest');
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../src/config');
    try {
      const id = require('node:crypto').randomUUID();
      const admin = await prisma.user.create({
        data: {
          accountId: `TUTORIAL-${id}`,
          phone: `test-${id}`,
          fullName: 'Tutorial test',
          role: 'ADMIN',
          passwordHash: 'unused-test-only',
        },
      });
      const token = jwt.sign({ sub: admin.id, version: admin.sessionVersion }, JWT_SECRET, {
        algorithm: 'HS256',
      });
      const draft = await request(app)
        .post('/api/admin/tutorials')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...starterTutorials[0],
          published: false,
          videoUrl: 'https://example.com/tutorial.mp4',
        });
      assert.equal(draft.status, 201);
      const patch = (body) =>
        request(app)
          .patch(`/api/admin/tutorials/${draft.body.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(body);
      assert.equal((await patch({ published: true })).status, 400);
      assert.equal(
        (await patch({ captionsUrl: 'https://example.com/tutorial.vtt', published: true })).status,
        200,
      );
      assert.equal((await patch({ captionsUrl: null })).status, 400);
      assert.equal((await patch({ title: 'Updated video title' })).status, 200);
    } finally {
      await prisma.$disconnect();
    }
  },
);

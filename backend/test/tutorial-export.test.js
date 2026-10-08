const { test } = require('node:test');
const assert = require('node:assert/strict');
test('recording scripts and draft WebVTT retain localized text and escape markup', async () => {
  const { draftCaptions, recordingScript } = await import('../../frontend/src/lib/tutorial-export.mjs');
  const tutorial = {
    title: 'தமிழ் / हिंदी',
    summary: 'Guide',
    steps: ['தமிழ் <script> -->\nहिंदी', 'Second step'],
    sourceUrl: 'https://example.com',
  };
  const captions = draftCaptions(tutorial);
  assert.ok(captions.startsWith('WEBVTT\n\n1\n00:00:00.000 --> 00:00:20.000'));
  assert.ok(captions.includes('00:00:20.000 --> 00:00:40.000'));
  assert.ok(captions.includes('தமிழ் &lt;script&gt; → हिंदी'));
  assert.ok(recordingScript(tutorial).includes('2. [20–40s]'));
  assert.ok(recordingScript(tutorial).includes(tutorial.sourceUrl));
});

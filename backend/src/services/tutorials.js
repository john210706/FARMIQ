const { z, text, url } = require('../domain');

function youtubeId(value) {
  if (!value) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password || u.port) return null;
    const id =
      u.hostname === 'youtu.be'
        ? u.pathname.slice(1)
        : ['youtube.com', 'www.youtube.com', 'www.youtube-nocookie.com'].includes(u.hostname)
          ? u.pathname === '/watch'
            ? u.searchParams.get('v')
            : u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1]
          : null;
    return /^[\w-]{11}$/.test(id || '') ? id : null;
  } catch {
    return null;
  }
}
const fields = z.object({
  title: text(200),
  category: text(40),
  language: z.enum(['en', 'ta', 'hi']),
  summary: text(2000),
  steps: z.array(text(1000)).min(1).max(30),
  videoUrl: url.nullable().optional(),
  audioUrl: url.nullable().optional(),
  captionsUrl: url.nullable().optional(),
  sourceUrl: url,
  published: z.boolean(),
});
const schema = fields.superRefine((value, context) => {
  if (!value.videoUrl) return;
  if (youtubeId(value.videoUrl)) return;
  if (!/\.(mp4|webm)$/i.test(new URL(value.videoUrl).pathname))
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['videoUrl'],
      message: 'Use a direct MP4/WebM video or a YouTube video link',
    });
  if (value.published && !value.captionsUrl)
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['captionsUrl'],
      message: 'Captions are required for published video tutorials',
    });
});
const response = (tutorial) => ({ ...tutorial, youtubeVideoId: youtubeId(tutorial.videoUrl) });
module.exports = { fields, schema, response, youtubeId };

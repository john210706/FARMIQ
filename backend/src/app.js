const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const crypto = require('node:crypto');
const { FRONTEND_URL } = require('./config');
const app = express();
app.disable('x-powered-by');
const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (!Number.isInteger(proxyHops) || proxyHops < 0 || proxyHops > 5)
  throw new Error('TRUST_PROXY_HOPS must be between 0 and 5');
if (proxyHops) app.set('trust proxy', proxyHops);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://*.razorpay.com'],
        frameSrc: ['https://*.razorpay.com', 'https://www.youtube-nocookie.com'],
        mediaSrc: ["'self'", 'https:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
  }),
);
app.use(cors({ origin: FRONTEND_URL }));
app.use((req, res, next) => {
  const started = Date.now();
  req.requestId = crypto.randomUUID();
  res.set('X-Request-ID', req.requestId);
  res.set('Cache-Control', 'no-store');
  if (process.env.LOG_REQUESTS === 'true')
    res.on('finish', () =>
      console.log(
        JSON.stringify({
          level: 'info',
          requestId: req.requestId,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Date.now() - started,
        }),
      ),
    );
  next();
});
app.use(
  express.json({
    limit: '200kb',
    verify: (req, res, buf) => {
      req.rawBody = Buffer.from(buf);
    },
  }),
);
app.use(
  '/api',
  rateLimit({
    windowMs: 60000,
    limit: process.env.NODE_ENV === 'test' ? 6000 : 180,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a minute and try again.' },
  }),
);
app.use('/api', require('./routes/health'));
app.use('/api', require('./routes/platform-auth').router);
app.use('/api', require('./routes/channels').router);
app.use('/api', require('./routes/payments').router);
app.use('/api', require('./routes/operations'));
app.use('/api', require('./routes/platform'));
app.use('/api', require('./routes/intelligence'));
// Production serves the built frontend on the same origin as the API.
if (process.env.NODE_ENV === 'production') {
  const path = require('node:path');
  app.use(
    express.static(path.resolve(__dirname, '../../frontend/dist'), {
      setHeaders(res, file) {
        res.set(
          'Cache-Control',
          file.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
        );
      },
    }),
  );
}
app.use((req, res) => res.status(404).json({ error: 'API endpoint not found' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status =
    error.status ||
    (error.name === 'ZodError'
      ? 400
      : error.code === 'P2002' || error.code === 'P2034'
        ? 409
        : error.code === 'P2025'
          ? 404
          : error.code === 'LIMIT_FILE_SIZE'
            ? 413
            : 500);
  const message =
    error.name === 'ZodError'
      ? error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
      : error.code === 'P2002'
        ? 'This record already exists'
        : error.code === 'P2034'
          ? 'A concurrent update occurred. Please retry.'
          : status >= 500
            ? 'The server could not complete the request'
            : error.message;
  if (status >= 500)
    console.error(
      JSON.stringify({
        level: 'error',
        requestId: req.requestId,
        path: req.path,
        code: error.code,
        message: error.message,
      }),
    );
  res.status(status).json({ error: message, requestId: req.requestId });
});
module.exports = app;

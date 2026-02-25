import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, authMiddleware, serviceTokenAuth } from './auth';
import issues from './routes/issues';
import activity from './routes/activity';
import scan from './routes/scan';

const app = new Hono<{ Bindings: Env }>();

// CORS for GitHub Pages
app.use('*', cors({
  origin: ['https://nullref42.github.io', 'http://localhost:5173', 'http://localhost:4173'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Cf-Access-Jwt-Assertion', 'CF-Access-Client-Id', 'CF-Access-Client-Secret'],
  credentials: true,
}));

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Auth middleware for most routes
app.use('/api/issues/*', authMiddleware);
app.use('/api/activity/*', authMiddleware);

// Service token auth for scan results
app.use('/api/scan/results', serviceTokenAuth);

// Mount routes
app.route('/api/issues', issues);
app.route('/api/activity', activity);
app.route('/api/scan', scan);

// 404 fallback
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

export default app;

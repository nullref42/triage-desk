import { Hono } from 'hono';
import { Env, getUser } from '../auth';
import { queryAll, execute } from '../db';

const activity = new Hono<{ Bindings: Env }>();

// GET /api/activity
activity.get('/', async (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  const results = await queryAll(c.env.DB,
    'SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  return c.json({ activity: results });
});

// POST /api/activity
activity.post('/', async (c) => {
  const body = await c.req.json<{
    issue_number?: number;
    issue_title?: string;
    action: string;
    details?: string;
  }>();

  if (!body.action) return c.json({ error: 'action is required' }, 400);

  const id = crypto.randomUUID();
  const actor = getUser(c);
  const timestamp = new Date().toISOString();

  await execute(c.env.DB,
    'INSERT INTO activity_log (id, timestamp, issue_number, issue_title, actor, action, details) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, timestamp, body.issue_number ?? null, body.issue_title ?? null, actor, body.action, body.details ?? null]
  );

  return c.json({ success: true, id }, 201);
});

export default activity;

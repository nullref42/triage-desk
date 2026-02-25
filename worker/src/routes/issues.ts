import { Hono } from 'hono';
import { Env, getUser } from '../auth';
import { queryAll, queryOne, execute } from '../db';

const issues = new Hono<{ Bindings: Env }>();

// GET /api/issues
issues.get('/', async (c) => {
  const status = c.req.query('status');
  const component = c.req.query('component');

  let sql = `
    SELECT i.*, t.type, t.component, t.priority, t.completeness, t.summary,
           t.classification, t.checklist, t.suggested_labels, t.suggested_action,
           t.suggested_comment, t.investigation, t.analyzed_at
    FROM issues i
    LEFT JOIN triage_analysis t ON i.number = t.issue_number
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (status) {
    sql += ' AND i.status = ?';
    params.push(status);
  }
  if (component) {
    sql += ' AND t.component = ?';
    params.push(component);
  }

  sql += ' ORDER BY i.updated_at DESC';

  const results = await queryAll(c.env.DB, sql, params);
  return c.json({ issues: results });
});

// GET /api/issues/stats
issues.get('/stats', async (c) => {
  const [statusCounts, componentCounts, priorityCounts] = await Promise.all([
    queryAll(c.env.DB, 'SELECT status, COUNT(*) as count FROM issues GROUP BY status'),
    queryAll(c.env.DB, 'SELECT t.component, COUNT(*) as count FROM triage_analysis t GROUP BY t.component'),
    queryAll(c.env.DB, 'SELECT t.priority, COUNT(*) as count FROM triage_analysis t GROUP BY t.priority'),
  ]);
  return c.json({ byStatus: statusCounts, byComponent: componentCounts, byPriority: priorityCounts });
});

// GET /api/issues/:number
issues.get('/:number', async (c) => {
  const num = parseInt(c.req.param('number'));
  if (isNaN(num)) return c.json({ error: 'Invalid issue number' }, 400);

  const issue = await queryOne(c.env.DB, `
    SELECT i.*, t.type, t.component, t.priority, t.completeness, t.summary,
           t.classification, t.checklist, t.suggested_labels, t.suggested_action,
           t.suggested_comment, t.investigation, t.analyzed_at
    FROM issues i
    LEFT JOIN triage_analysis t ON i.number = t.issue_number
    WHERE i.number = ?
  `, [num]);

  if (!issue) return c.json({ error: 'Issue not found' }, 404);
  return c.json(issue);
});

// PATCH /api/issues/:number/status
issues.patch('/:number/status', async (c) => {
  const num = parseInt(c.req.param('number'));
  if (isNaN(num)) return c.json({ error: 'Invalid issue number' }, 400);

  const body = await c.req.json<{ status: string }>();
  const validStatuses = ['pending', 'done', 'skipped', 'archived', 'needs-attention', 'in-discussion'];
  if (!validStatuses.includes(body.status)) {
    return c.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400);
  }

  const user = getUser(c);
  await execute(c.env.DB,
    'UPDATE issues SET status = ?, updated_at = datetime("now"), updated_by = ? WHERE number = ?',
    [body.status, user, num]
  );

  return c.json({ success: true, number: num, status: body.status });
});

export default issues;

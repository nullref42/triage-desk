import { Hono } from 'hono';
import { Env } from '../auth';
import { queryOne, execute } from '../db';

const scan = new Hono<{ Bindings: Env }>();

// POST /api/scan/results
scan.post('/results', async (c) => {
  const body = await c.req.json<{
    issues: Array<{
      number: number;
      title: string;
      url: string;
      author: string;
      authorAvatar?: string;
      createdAt: string;
      body?: string;
      labels?: string[];
      status?: string;
      triage?: {
        type?: string;
        component?: string;
        priority?: string;
        completeness?: number;
        summary?: string;
        classification?: string;
        checklist?: string;
        suggestedLabels?: string[];
        suggestedAction?: string;
        suggestedComment?: string;
        investigation?: unknown;
      };
    }>;
    scanMeta?: {
      started_at?: string;
      finished_at?: string;
      issues_found?: number;
      issues_new?: number;
      issues_updated?: number;
    };
  }>();

  if (!body.issues || !Array.isArray(body.issues)) {
    return c.json({ error: 'issues array is required' }, 400);
  }

  // Create scan run
  const scanId = await execute(c.env.DB,
    `INSERT INTO scan_runs (started_at, finished_at, issues_found, issues_new, issues_updated, status)
     VALUES (?, ?, ?, ?, ?, 'completed')`,
    [
      body.scanMeta?.started_at || new Date().toISOString(),
      body.scanMeta?.finished_at || new Date().toISOString(),
      body.scanMeta?.issues_found ?? body.issues.length,
      body.scanMeta?.issues_new ?? 0,
      body.scanMeta?.issues_updated ?? 0,
    ]
  );

  // Upsert issues
  let inserted = 0;
  let updated = 0;
  for (const issue of body.issues) {
    const existing = await queryOne(c.env.DB, 'SELECT number FROM issues WHERE number = ?', [issue.number]);

    if (existing) {
      await execute(c.env.DB,
        `UPDATE issues SET title=?, url=?, author=?, author_avatar=?, created_at=?, body=?, labels=?, updated_at=datetime('now')
         WHERE number=?`,
        [issue.title, issue.url, issue.author, issue.authorAvatar ?? null, issue.createdAt, issue.body ?? null,
         JSON.stringify(issue.labels || []), issue.number]
      );
      updated++;
    } else {
      await execute(c.env.DB,
        `INSERT INTO issues (number, title, url, author, author_avatar, created_at, body, labels, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [issue.number, issue.title, issue.url, issue.author, issue.authorAvatar ?? null, issue.createdAt,
         issue.body ?? null, JSON.stringify(issue.labels || []), issue.status || 'pending']
      );
      inserted++;
    }

    // Upsert triage analysis
    if (issue.triage) {
      const t = issue.triage;
      await execute(c.env.DB,
        `INSERT OR REPLACE INTO triage_analysis
         (issue_number, type, component, priority, completeness, summary, classification, checklist,
          suggested_labels, suggested_action, suggested_comment, investigation, analyzed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [issue.number, t.type ?? null, t.component ?? null, t.priority ?? null,
         t.completeness ?? null, t.summary ?? null, t.classification ?? null,
         t.checklist ?? null, JSON.stringify(t.suggestedLabels || []),
         t.suggestedAction ?? null, t.suggestedComment ?? null,
         t.investigation ? JSON.stringify(t.investigation) : null]
      );
    }
  }

  return c.json({ success: true, inserted, updated, total: body.issues.length });
});

// GET /api/scan/status
scan.get('/status', async (c) => {
  const latest = await queryOne(c.env.DB,
    'SELECT * FROM scan_runs ORDER BY id DESC LIMIT 1'
  );
  return c.json(latest || { status: 'no runs' });
});

// GET /api/scan/history
scan.get('/history', async (c) => {
  const limit = Math.min(Number(c.req.query('limit') || 20), 100);
  const offset = Number(c.req.query('offset') || 0);

  const rows = await c.env.DB.prepare(
    'SELECT * FROM scan_runs ORDER BY id DESC LIMIT ? OFFSET ?'
  ).bind(limit, offset).all();

  const countRow = await queryOne(c.env.DB, 'SELECT COUNT(*) as total FROM scan_runs', []);

  return c.json({ runs: rows.results ?? [], total: (countRow as any)?.total ?? 0 });
});

// GET /api/scan/investigations
scan.get('/investigations', async (c) => {
  const limit = Math.min(Number(c.req.query('limit') || 50), 200);
  const offset = Number(c.req.query('offset') || 0);

  const rows = await c.env.DB.prepare(
    `SELECT i.number, i.title, i.url, i.status,
            ta.component, ta.priority, ta.investigation, ta.analyzed_at
     FROM triage_analysis ta
     JOIN issues i ON i.number = ta.issue_number
     WHERE ta.investigation IS NOT NULL
     ORDER BY ta.analyzed_at DESC
     LIMIT ? OFFSET ?`
  ).bind(limit, offset).all();

  const countRow = await queryOne(c.env.DB,
    'SELECT COUNT(*) as total FROM triage_analysis WHERE investigation IS NOT NULL', []);

  return c.json({ investigations: rows.results ?? [], total: (countRow as any)?.total ?? 0 });
});

export default scan;

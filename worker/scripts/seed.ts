/**
 * Seed script — generates SQL from triage-results.json and executes via wrangler d1.
 * Usage: cd worker && npx tsx scripts/seed.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

const dataPath = resolve(__dirname, '../../data/triage-results.json');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

function esc(s: string | null | undefined): string {
  if (s == null) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

let sql = '';

for (const issue of data) {
  sql += `INSERT OR REPLACE INTO issues (number, title, url, author, author_avatar, created_at, body, labels, status)
VALUES (${issue.number}, ${esc(issue.title)}, ${esc(issue.url)}, ${esc(issue.author)}, ${esc(issue.authorAvatar)}, ${esc(issue.createdAt)}, ${esc(issue.body)}, ${esc(JSON.stringify(issue.labels || []))}, ${esc(issue.status || 'pending')});\n`;

  if (issue.triage) {
    const t = issue.triage;
    sql += `INSERT OR REPLACE INTO triage_analysis (issue_number, type, component, priority, completeness, summary, classification, checklist, suggested_labels, suggested_action, suggested_comment, investigation)
VALUES (${issue.number}, ${esc(t.type)}, ${esc(t.component)}, ${esc(t.priority)}, ${t.completeness ?? 'NULL'}, ${esc(t.summary)}, ${esc(t.classification)}, ${esc(t.checklist)}, ${esc(JSON.stringify(t.suggestedLabels || []))}, ${esc(t.suggestedAction)}, ${esc(t.suggestedComment)}, ${esc(t.investigation ? JSON.stringify(t.investigation) : null)});\n`;
  }
}

const seedFile = resolve(__dirname, '../migrations/seed.sql');
writeFileSync(seedFile, sql);
console.log(`Generated seed SQL with ${data.length} issues → ${seedFile}`);
console.log('Run: wrangler d1 execute triage-desk-db --file=./migrations/seed.sql');

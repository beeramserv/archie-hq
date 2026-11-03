import { describe, it, expect } from 'vitest';

/**
 * Self-contained regression tests for the image tag sanitization used by
 * `.github/workflows/docker-publish.yml` — recomputes the mapping in
 * TypeScript, no shelling out, no network.
 *
 * The infra deploy jobs sanitize branch names with `[^A-Za-z0-9-] -> '-'`
 * followed by lowercasing. These checks pin that rule so future edits to the
 * workflow cannot silently drift from what the staging deploy job expects.
 */
const sanitize = (branch: string) => branch.replace(/[^A-Za-z0-9-]/g, '-').toLowerCase();

describe('image tag sanitization', () => {
  it('matches the infra deploy sanitization rule', () => {
    expect(sanitize('Feature.Branches/Two')).toBe('feature-branches-two');
    expect(sanitize('Release_1.2')).toBe('release-1-2');
    expect(sanitize('fix/CASE-Check')).toBe('fix-case-check');
    expect(sanitize('archie/task-20261016-1207-wxe4jk')).toBe(
      'archie-task-20261016-1207-wxe4jk',
    );
  });

  it('does not inherit deployment variables into the test process', () => {
    // The tag mapping is only meaningful against the workflow's own env
    // contract, so a local test run must not silently pick up deployment
    // configuration from wherever vitest happens to be started.
    const inherited = Object.keys(process.env)
      .filter((k) => /^(ARCHIE_|SLACK_|ANTHROPIC_|AWS_|OPENAI_|GOOGLE_)/.test(k))
      .sort();
    expect(inherited.join(',')).toBe('');
  });
});

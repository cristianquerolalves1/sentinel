const Results = require('./results');

class Detector {
  constructor(scanners = [], options = {}) {
    this.scanners = scanners;
    this.verbose = options.verbose || false;
    this.filterRules = options.filterRules || [];
  }

  scan(file, candidates, meta = {}) {
    if (this.verbose) console.log(`Detector scanning ${file}`);

    let all = [];
    for (const s of this.scanners) {
      if (!s || typeof s.scan !== 'function') continue;
      try {
        const res = s.scan(file, candidates, meta) || [];
        all.push(...res);
      } catch (err) {
        if (this.verbose) console.error(`Scanner ${s.constructor.name} failed on ${file}: ${err.message}`);
      }
    }

    const post = all.map(r => Detector._annotate(r, meta.originalContent));

    let filtered = post;
    if (this.filterRules && this.filterRules.length) {
      filtered = post.filter(r => this.filterRules.includes(r.ruleName));
    }

    return Results.deduplicate(filtered);
  }

  static _annotate(result, originalContent = '') {
    const r = { ...result };
    r.match = Detector._normalizeMatch(String(r.match || ''));
    if (originalContent && r.file && r.line) {
      const lines = originalContent.split(/\r?\n/);
      const idx = Math.max(0, r.line - 1);
      const before = lines.slice(Math.max(0, idx - 2), idx).join('\n');
      const after = lines.slice(idx + 1, idx + 3).join('\n');
      const current = lines[idx] || '';
      r.snippet = [before, current, after].filter(Boolean).join('\n');
    }
    r.severity = Detector._severity(r);
    return r;
  }

  static _normalizeMatch(s) {
    return s.replace(/^[\s"'`<>{[\(]+|[\s"'`>\.\)\]}]+$/g, '').trim();
  }

  static _severity(r) {
    if (!r.ruleName) return 'low';
    const high = ['aws_secret_key','aws_access_key','github_token','stripe_secret','slack_token','entropy_high'];
    if (high.includes(r.ruleName)) return 'high';
    if (/secret|password|private|token|apikey|credential/i.test(r.ruleName || r.match)) return 'medium';
    return 'low';
  }
}

module.exports = Detector;

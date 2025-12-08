class Results {
  static deduplicate(results) {
    const seen = new Map();
    const unique = [];
    for (const r of results) {
      const match = (r.match || '').toString().trim();
      const key = `${r.file}::${r.line}::${r.ruleName}::${match}`;
      if (!seen.has(key)) {
        seen.set(key, r);
        unique.push(r);
      } else {
        const prev = seen.get(key);
        if (!prev.snippet && r.snippet) prev.snippet = r.snippet;
      }
    }
    return unique;
  }

  static summarizeByType(results) {
    return results.reduce((acc, r) => {
      acc[r.ruleName] = (acc[r.ruleName] || 0) + 1;
      return acc;
    }, {});
  }

  static merge(...arrays) {
    const all = [];
    for (const a of arrays) if (Array.isArray(a)) all.push(...a);
    return Results.deduplicate(all);
  }

  static postProcess(results) {
    return results.map((r, i) => {
      const out = { ...r };
      out.match = (out.match || '').toString();
      out.file = out.file || 'unknown';
      out.ruleName = out.ruleName || 'unknown';
      out.line = out.line || 0;
      out.id = `${i}-${Math.abs(hashCode(out.file + out.ruleName + out.match))}`;
      return out;
    });
  }
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}

module.exports = Results;

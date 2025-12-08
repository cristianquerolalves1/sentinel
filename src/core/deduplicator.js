const crypto = require('crypto');

class Deduplicator {
    /**
     * @param {Array<{file:string,line:number,match:string,ruleName:string,snippet?:string}>} results
     * @returns {Array} unic results
     */
    static deduplicate(results) {
        const seen = new Map();
        const unique = [];

        results.forEach(r => {
            const matchNorm = (r.match || '').toString().trim().toLowerCase(); 
            const ruleBase = r.ruleName.replace(/(_v\d+|_upper|_lower)$/i, ''); 
            const key = `${r.file}::${r.line}::${ruleBase}::${matchNorm}`;

            if (!seen.has(key)) {
                const id = crypto.createHash('sha256')
                    .update(key + Math.random())
                    .digest('hex')
                    .slice(0, 12);

                unique.push({ ...r, ruleName: ruleBase, id });
                seen.set(key, true);
            } else {
                const existing = unique.find(u => u.file === r.file && u.line === r.line && u.ruleName === ruleBase);
                if (existing && !existing.snippet && r.snippet) {
                    existing.snippet = r.snippet;
                }
            }
        });

        return unique;
    }

    static postProcess(results) {
        return results.map((r, i) => ({
            ...r,
            file: r.file || 'unknown',
            line: r.line || 0,
            match: (r.match || '').toString(),
            ruleName: r.ruleName || 'unknown',
            id: r.id || crypto.createHash('sha256').update(r.file + r.ruleName + r.match + i).digest('hex').slice(0,12)
        }));
    }
}

module.exports = Deduplicator;

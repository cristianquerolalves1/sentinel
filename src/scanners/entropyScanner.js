const fs = require('fs');
class EntropyScanner {
    constructor(threshold = 4.5, minLength = 20, verbose = false) {
        this.threshold = threshold;
        this.minLength = minLength;
        this.verbose = verbose;
        this.commonTokens = [
            '123456', 'qwerty', 'password', 'admin', 'letmein',
            'secret', 'login', 'root', 'default', 'changeme'
        ];
    }

    /**
     * @param {string} str
     * @returns {number} Entropy
     */
    shannonEntropy(str) {
        const len = str.length;
        if (len === 0) return 0;

        const freq = {};
        for (const char of str) freq[char] = (freq[char] || 0) + 1;

        let entropy = 0;
        for (const char in freq) {
            const p = freq[char] / len;
            entropy -= p * Math.log2(p);
        }
        return entropy;
    }

    /**
     * @param {string} str
     * @returns {boolean}
     */
    isHighEntropy(str) {
        const entropy = this.shannonEntropy(str);
        const isBase64 = /^[A-Za-z0-9+/=]{20,}$/.test(str);
        const isHex = /^[0-9a-fA-F]{20,}$/.test(str);
        const notCommon = !this.commonTokens.some(t => str.includes(t));
        return (entropy >= this.threshold || isBase64 || isHex) && notCommon;
    }

    /**
     * @param {string} file
     * @param {string} content
     * @returns {Array<{file, line, match, ruleName}>}
     */
    scan(file, content) {
        const results = [];
        const lines = content.split(/\r?\n/);

        lines.forEach((line, idx) => {
            line.split(/\s+/).forEach(word => {
                if (word.length >= this.minLength && this.isHighEntropy(word)) {
                    results.push({
                        file,
                        line: idx + 1,
                        match: word,
                        ruleName: 'entropy_high'
                    });
                }
            });

            const potentialSecrets = line.match(/["']([A-Za-z0-9+/=]{20,})["']/g);
            if (potentialSecrets) {
                potentialSecrets.forEach(match => {
                    const clean = match.replace(/["']/g, '');
                    if (clean.length >= this.minLength && this.isHighEntropy(clean)) {
                        results.push({
                            file,
                            line: idx + 1,
                            match: clean,
                            ruleName: 'entropy_high_attr'
                        });
                    }
                });
            }
        });

        if (this.verbose) console.log(`Entropy scan on ${file}: ${results.length} high-entropy matches`);
        return results;
    }
}

module.exports = EntropyScanner;

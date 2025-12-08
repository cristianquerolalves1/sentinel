    const crypto = require('crypto');
    module.exports = {
    /**
     * @param {string} str
     * @returns {string} hex hash
     */
    sha256: function(str) {
        return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
    },

    /**
     * @param {string} str
     * @returns {number} entropy
     */
    shannonEntropy: function(str) {
        const len = str.length;
        if (len === 0) return 0;

        const freq = {};
        for (const char of str) {
        freq[char] = (freq[char] || 0) + 1;
        }

        let entropy = 0;
        for (const char in freq) {
        const p = freq[char] / len;
        entropy -= p * Math.log2(p);
        }

        return entropy;
    }
    };

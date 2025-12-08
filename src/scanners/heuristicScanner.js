class HeuristicScanner {
    constructor(verbose = false) {
        this.verbose = verbose;
        this.keywords = [
            'password','passwd','secret','token','api_key','apikey','private_key','auth','credential','client_secret'
        ];

        this.patterns = [
            /["']?(?:password|passwd|secret|token|api_key|apikey|client_secret)["']?\s*[:=]\s*["']?(.+?)["']?$/i,
            /<input[^>]*type=["']password["'][^>]*>/i,
            /aws_secret_access_key\s*=\s*["']?.+["']?/i,
            /GITHUB_TOKEN\s*=\s*["']?.+["']?/i
        ];
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
            const lower = line.toLowerCase();
  
            if (/^\s*(\/\/|#|\*|\-\-|\/*|<!--)/.test(line)) return;

            this.keywords.forEach(keyword => {
                if (lower.includes(keyword)) {
                    results.push({
                        file,
                        line: idx + 1,
                        match: line.trim(),
                        ruleName: 'heuristic_keyword'
                    });
                }
            });

            this.patterns.forEach(pattern => {
                const match = line.match(pattern);
                if (match) {
                    results.push({
                        file,
                        line: idx + 1,
                        match: match[1] || match[0],
                        ruleName: 'heuristic_pattern'
                    });
                }
            });
        });

        if (this.verbose) console.log(`Heuristic scan on ${file}: ${results.length} matches`);
        return results;
    }
}

module.exports = HeuristicScanner;

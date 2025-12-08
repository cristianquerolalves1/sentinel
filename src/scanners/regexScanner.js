const fs = require('fs');
const path = require('path');

class RegexScanner {
constructor(verbose = false) {
this.rules = [];
this.verbose = verbose;
this.loadProviderRules();
this.initDefaultRules();
}

loadProviderRules() {
    const rulesDir = path.join(__dirname, 'providerRules');
    if (!fs.existsSync(rulesDir)) return;

    fs.readdirSync(rulesDir)
        .filter(f => f.endsWith('.json'))
        .forEach(file => {
            const filePath = path.join(rulesDir, file);
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                if (Array.isArray(data.rules)) {
                    data.rules.forEach(r => {
                        if (r.name && r.pattern) {
                            const flags = r.flags || 'g';
                            this.rules.push({
                                name: r.name,
                                pattern: new RegExp(r.pattern, flags)
                            });
                        }
                    });
                }
            } catch (err) {
                console.warn(`⚠️ Failed to load provider rules from ${file}: ${err.message}`);
            }
        });
}

initDefaultRules() {
    const defaults = [
        // AWS
        { name: 'aws_access_key', pattern: /AKIA[0-9A-Z]{16}/g },
        { name: 'aws_secret_key', pattern: /(?<!A-Z0-9)[0-9a-zA-Z/+]{40}(?![0-9a-zA-Z/+])/g },
        { name: 'aws_session_token', pattern: /FwoGZXIvYXdzE[a-zA-Z0-9/+=]{40,200}/g },

        // GitHub
        { name: 'github_token', pattern: /gh[pousr]_[0-9A-Za-z]{36,255}/g },

        // Stripe
        { name: 'stripe_secret', pattern: /sk_(live|test)_[0-9a-zA-Z]{24}/g },
        { name: 'stripe_restricted', pattern: /rk_(live|test)_[0-9a-zA-Z]{24}/g },

        // Slack
        { name: 'slack_token', pattern: /xox[baprs]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32}/g },

        // Twilio
        { name: 'twilio_sid', pattern: /AC[0-9a-fA-F]{32}/g },
        { name: 'twilio_token', pattern: /[0-9a-fA-F]{32}/g },

        // JWT
        { name: 'jwt', pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g },

        // Google Cloud
        { name: 'gcp_service_account', pattern: /\"type\":\s*\"service_account\"/g },

        // Azure
        { name: 'azure_client_secret', pattern: /[0-9a-fA-F]{32,64}/g },

        // Generic
        { name: 'generic_api_key', pattern: /(?<![A-Za-z0-9])([A-Za-z0-9]{32,64})(?![A-Za-z0-9])/g },
        { name: 'private_key', pattern: /-----BEGIN PRIVATE KEY-----[\s\S]+?-----END PRIVATE KEY-----/g },
        { name: 'rsa_key', pattern: /-----BEGIN RSA PRIVATE KEY-----[\s\S]+?-----END RSA PRIVATE KEY-----/g },
        { name: 'ssh_key', pattern: /ssh-rsa [A-Za-z0-9+/=]{100,}/g },

        // Passwords and credentials
        { name: 'password_assignment', pattern: /password\s*[:=]\s*["']?.+["']?/gi },
        { name: 'token_assignment', pattern: /token\s*[:=]\s*["']?.+["']?/gi },

        // HTML / JS / JSON secrets
        { name: 'html_input_password', pattern: /<input\b[^>]*\btype\s*=\s*["']?password["']?[^>]*>/gi },
        { name: 'html_input_value_password', pattern: /<input\b[^>]+(?:name|id)\s*=\s*["']?password["']?[^>]+value\s*=\s*["']([^"']+)["']/gi },
        { name: 'data_api_key', pattern: /data-api-key=["'][A-Za-z0-9\-_]{16,128}["']/gi },

        // ENV files
        { name: 'env_aws_access_key', pattern: /AWS_ACCESS_KEY_ID=.+/gi },
        { name: 'env_aws_secret', pattern: /AWS_SECRET_ACCESS_KEY=.+/gi },
        { name: 'env_github_token', pattern: /GITHUB_TOKEN=.+/gi },
        { name: 'env_database_password', pattern: /DB_PASSWORD=.+/gi },

        // Potential HEX and Base64
        { name: 'hex_string', pattern: /\b[0-9a-fA-F]{32,64}\b/g },
        { name: 'base64_string', pattern: /\b[A-Za-z0-9+/]{32,}={0,2}\b/g },

        // NPM / PyPI / Other package tokens
        { name: 'npm_token', pattern: /_authToken=.+/g },
        { name: 'pypi_token', pattern: /pypiToken=.+/g },
    ];

    const extendedRules = [];
    defaults.forEach(r => {
        extendedRules.push(r);
        extendedRules.push({ name: r.name + '_upper', pattern: new RegExp(r.pattern.source.toUpperCase(), 'g') });
        extendedRules.push({ name: r.name + '_lower', pattern: new RegExp(r.pattern.source.toLowerCase(), 'g') });
    });

    for (let i = 0; i < 25; i++) {
        extendedRules.forEach(r => {
            this.rules.push({
                name: `${r.name}_v${i + 1}`,
                pattern: new RegExp(r.pattern.source, r.pattern.flags)
            });
        });
    }


    this.rules.push(...extendedRules);
}

/**
 * @param {string} file 
 * @param {string} content
 * @returns {Array<{file:string, line:number, match:string, ruleName:string}>}
 */
scan(file, content) {
    const results = [];
    const isHTML = file.endsWith('.html') || file.endsWith('.htm');

    if (isHTML) {
        this.rules.forEach(rule => {
            let matches;
            try {
                matches = [...content.matchAll(rule.pattern)];
                matches.forEach(m => {
                    results.push({
                        file,
                        line: 0, 
                        match: m[0],
                        ruleName: rule.name
                    });
                });
            } catch (err) {
                if (this.verbose) console.warn(`Regex error for rule ${rule.name}: ${err.message}`);
            }
        });
    } else {
        const lines = content.split(/\r?\n/);
        lines.forEach((line, idx) => {
            if (/^\s*(\/\/|#|\*|\-\-|\/*|\*\/)/.test(line)) return;

            this.rules.forEach(rule => {
                const matches = line.match(rule.pattern);
                if (matches) {
                    matches.forEach(match => {
                        results.push({
                            file,
                            line: idx + 1,
                            match,
                            ruleName: rule.name
                        });
                    });
                }
            });
        });
    }

    if (this.verbose) console.log(`Scanned ${file}, found ${results.length} potential secrets`);
    return results;
}

}

module.exports = RegexScanner;

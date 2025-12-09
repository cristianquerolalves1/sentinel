## Project Structure

```bash
Sentinel/                             # Project root — everything live & active
├── sentinel.js                       # Main CLI entry point — the heart of Sentinel
├── package.json                      # Project metadata + global `sentinel` command
├── package-lock.json                 
├── README.md                         # Main documentation (you’re reading it!)
├── SECURITY.md                       # Security policy & reporting
├── sentinel_report.html              # Latest beautiful HTML report
└── sentinel_report.json              # Latest machine-readable JSON report

└── docs/                             # Full up-to-date documentation
    ├── ci_cd.md                      # CI/CD guides (GitHub Actions, GitLab, Jenkins…)
    ├── configuration.md              # Advanced config & custom rules
    └── examples.md                   # Real-world commands & use cases

└── src/
    └── core/                         # Core engine — 100% active and running
        ├── deduplicator.js           # Removes duplicate findings like a pro
        ├── detector.js               # Orchestrates the entire scanning process
        ├── fileloader.js             # Smart recursive file loading + filtering
        ├── results.js                # Manages final scan results

        ├── providerRules/            # Ready-to-use & extensible rule set
        │   ├── aws.json              # AWS Access & Secret Keys
        │   ├── github.json           # GitHub PATs & tokens
        │   ├── google.json           # Google Cloud / OAuth tokens
        │   └── stripe.json           # Stripe secret & publishable keys

        ├── reporters/                # All reporting formats active
        │   ├── htmlReporter.js       # Gorgeous interactive HTML report
        │   ├── jsonReporter.js       # Perfect for CI/CD pipelines
        │   └── terminalReporter.js   # Clean, colorful console output

        └── scanners/                 # All three detection engines fully active
            ├── entropyScanner.js     # High-entropy strings → passwords & tokens
            ├── heuristicScanner.js   # Suspicious keywords & patterns
            ├── regexScanner.js       # Ultra-fast regex-based detection
            ├── cli.js                # Argument parsing & help system
            └── utils.js              # Shared utilities across scanners

└── node_modules/                     # Installed dependencies
└── .gitignore
└── .npmignore
```


---
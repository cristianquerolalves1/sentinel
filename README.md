```diff
+ ███████╗ ███████╗ ███╗   ██╗ ████████╗ ██╗ ███╗   ██╗ ███████╗ ██╗     
+ ██╔════╝ ██╔════╝ ████╗  ██║ ╚══██╔══╝ ██║ ████╗  ██║ ██╔════╝ ██║     
+ ███████╗ █████╗   ██╔██╗ ██║    ██║    ██║ ██╔██╗ ██║ █████╗   ██║     
+ ╚════██║ ██╔══╝   ██║╚██╗██║    ██║    ██║ ██║╚██╗██║ ██╔══╝   ██║     
+ ███████║ ███████╗ ██║ ╚████║    ██║    ██║ ██║ ╚████║ ███████╗ ███████╗
+ ╚══════╝ ╚══════╝ ╚═╝  ╚═══╝    ╚═╝    ╚═╝ ╚═╝  ╚═══╝ ╚══════╝ ╚══════╝

```


Prevent Code Leaks in Your Projects

Sentinel is an advanced secret scanning tool designed for developers, security engineers, and CI/CD pipelines. It helps prevent sensitive information, credentials, and API keys from leaking into public repositories or production environments by scanning codebases before deployment.

This documentation covers installation, usage, configuration, advanced features, reporting, examples, integration into pipelines, best practices, troubleshooting, and contributing guidelines.

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Options](#options)
5. [Architecture](#architecture)
6. [Scanners](#scanners)
7. [Advanced Examples](#advanced-examples)
8. [Configuration & Customization](#configuration--customization)
9. [Reporting](#reporting)
10. [CI/CD Integration](#cicd-integration)
11. [Best Practices](#best-practices)
12. [Troubleshooting & FAQ](#troubleshooting--faq)
13. [Contributing](#contributing)
14. [License](#license)

---

## Features

| Feature                    | Description                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Regex Scanner**          | Detects secrets using predefined and custom provider rules for AWS, GitHub, Stripe, Google, Slack, and more. |
| **Entropy Scanner**        | Identifies high-entropy strings likely to be passwords, tokens, or cryptographic keys.                       |
| **Heuristic Scanner**      | Detects suspicious keywords and patterns in source and configuration files.                                  |
| **Multi-format Reporting** | Outputs scan results to Terminal, JSON, and HTML.                                                            |
| **Fast & Deep Scans**      | Choose between quick regex-only scans or full deep scans including entropy and heuristics.                   |
| **Extensible**             | Add custom provider rules via JSON files without changing the code.                                          |
| **CI/CD Friendly**         | Seamless integration with GitHub Actions, GitLab CI, Jenkins, and other CI/CD platforms.                     |
| **Deduplication**          | Removes duplicate findings to ensure clean reports.                                                          |

---

## Installation

Install the package from npm:

```bash
npm install -g sentinel-cqa
```

> [!NOTE]
> The -g flag makes the sentinel CLI available globally.

Locally:

Clone the repository and install dependencies:

```bash
git clone https://github.com/cristianquerolalves1/sentinel.git
cd sentinel
npm install
npm link
```

Run the CLI:

```bash
sentinel <command>
```

**Important:**
Before scanning, remove or ignore folders that do not contain source code or sensitive information to improve scan speed and reduce false positives:

* `.git`
* `assets`
* `node_modules` (unless scanning dependencies is desired)
* `dist` / `build` / other auto-generated folders

---

## Usage

### Basic Scan (Fast)

```bash
sentinel /path/to/project --fast
```

* Performs a fast scan using only regex rules.
* Outputs results to Terminal.

### Deep Scan (Full)

```bash
sentinel /path/to/project --deep --json --html
```

* Runs Regex, Entropy, and Heuristic scans.
* Generates structured `JSON` and human-readable `HTML` reports.
* Suitable for CI/CD and security audits.

### Ignore Specific Directories

```bash
sentinel /path/to/project --deep --ignore node_modules dist test
```

* Excludes specific directories from scanning.
* Useful for large projects or third-party dependencies.

---

## Options

| Option               | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `--help, -h`         | Displays the version of Sentinel                            |
| `--version, -V`      | Displays the help panel                                     |
| `<directory>`        | Directory to scan (required)                                |
| `--fast`             | Fast scan using only regex rules                            |
| `--deep`             | Full scan including regex, entropy, and heuristic detection |
| `--json`             | Generate JSON report (`sentinel_report.json`)               |
| `--html`             | Generate HTML report (`sentinel_report.html`)               |
| `--ignore <dirs...>` | List of directories to ignore during scan                   |

---

## Architecture

Sentinel is modular and consists of the following components:

1. **File Loader**

   * Recursively loads files from the target directory.
   * Filters out ignored paths.
   * Supports large codebases efficiently.

2. **Scanners**

   * **RegexScanner:** Matches secrets with predefined and custom rules.
   * **EntropyScanner:** Detects high-entropy strings.
   * **HeuristicScanner:** Detects suspicious keywords and insecure patterns.

3. **Deduplication**

   * Ensures each secret is reported only once.
   * Uses a combination of file path, line number, and matched content.

4. **Reporting**

   * Terminal output for quick review.
   * JSON for CI/CD consumption.
   * HTML for visual, human-readable reports.

---

## Scanners Details

### Regex Scanner

* Detects patterns of known secrets like API keys, tokens, and credentials.
* Supports custom JSON-based rules.
* High performance, suitable for large codebases.

### Entropy Scanner

* Measures Shannon entropy of strings.
* Flags strings with unusually high entropy as potential secrets.
* Ideal for passwords, encryption keys, and API secrets.

### Heuristic Scanner

* Scans for keywords such as `password`, `secret`, `token`, `apikey`.
* Detects suspicious patterns and commented-out secrets.

---

## Advanced Examples

| Example                   | Command / YAML / JSON                                                                                                                                                                                                                                                                                                                                                                                     | Description                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Fast Scan**             | `sentinel ./my-project --fast`                                                                                                                                                                                                                                                                                                                                                              | Quick scan using regex only. Results printed in Terminal.                                                     |
| **Deep Scan**             | `sentinel ./my-project --deep --json --html`                                                                                                                                                                                                                                                                                                                                                | Full scan using Regex, Entropy, Heuristic. Generates JSON and HTML reports.                                   |
| **Ignore Directories**    | `sentinel ./my-project --deep --ignore node_modules dist test`                                                                                                                                                                                                                                                                                                                              | Excludes specific directories from scanning.                                                                  |
| **CI/CD GitHub Actions**  | `yaml name: Sentinel Scan on: [push, pull_request] jobs: scan: runs-on: ubuntu-latest steps: - uses: actions/checkout@v3 - name: Install Node.js   uses: actions/setup-node@v3   with:     node-version: '18' - run: npm ci - run: sentinel . --deep --json - name: Upload Sentinel Report   uses: actions/upload-artifact@v3   with:     name: sentinel-report     path: sentinel_report.json ` | Automatic scan on push/pull request. Uploads JSON report as artifact.                                         |
| **Custom Provider Rules** | `json { "rules": [ { "name": "custom_api_key", "pattern": "custom_[0-9a-zA-Z]{20}" } ] } `                                                                                                                                                                                                                                                                                                                | Place JSON in `src/scanners/providerRules/`. Run Sentinel with `--deep`. Custom rules included automatically. |

---

## Configuration & Customization

1. **Adding Custom Rules**

   * Create a `.json` file in `src/scanners/providerRules/`.
   * Each rule must have a `name` and `pattern` (regex).

2. **Excluding Files/Folders**

   * Use `--ignore` option to skip irrelevant directories.
   * Recommended: `.git`, `assets`, `node_modules`, `dist`.

3. **Adjusting Scan Depth**

   * `--fast`: Only regex, minimal processing.
   * `--deep`: Full scan, including entropy and heuristics.

---

## Reporting

* **Terminal:** Quick overview for development.
* **JSON:** Structured, ideal for pipelines. Includes file, line, type, and matched value.
* **HTML:** Human-readable report with color-coded severity and summary statistics.

**Example JSON Entry:**

```json
{
  "file": "src/config.js",
  "line": 12,
  "type": "AWS_SECRET_KEY",
  "match": "AKIA************"
}
```

---

## CI/CD Integration

* **GitHub Actions:** Automatically scan on push or pull request. Upload artifacts.
* **GitLab CI:** Use `script` section to run Sentinel and store reports as artifacts.
* **Jenkins:** Include `node` build step with `npm install` and run `sentinel.js`.

**Best Practice:** Integrate into pre-deploy or pre-merge pipelines to prevent secrets from entering production.

---

## Best Practices

* Exclude `.git`, `node_modules`, and generated folders to reduce false positives.
* Regularly update provider rules.
* Run deep scans before production deployment.
* Use custom rules for internal APIs or unique token patterns.
* Combine JSON reports with automated alerting in pipelines.

---

## Troubleshooting & FAQ

**Q:** Some files are not scanned.
**A:** Ensure they are not ignored via `--ignore` and check file permissions.

**Q:** False positives detected.
**A:** Review the rules in `src/scanners/providerRules/` and refine regex patterns.

**Q:** Scan takes too long.
**A:** Use `--fast` or exclude large directories like `node_modules`.

---

## Contributing

Sentinel is open-source. Contributions welcome:

* Add or improve provider rules (`src/scanners/providerRules/*.json`).
* Enhance scanner performance or add new strategies.
* Fix bugs, improve tests, or enhance documentation.

---

## License

MIT LICENSE

---

Sentinel provides developers, security engineers, and DevOps teams with a professional, enterprise-ready solution to prevent secrets from leaking and maintain secure codebases.

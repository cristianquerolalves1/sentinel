# Sentinel — Usage Examples

This document provides detailed examples of using Sentinel in different scenarios, from basic scans to complex CI/CD integrations.

---

## 1. Basic Fast Scan

```bash
sentinel ./my-project --fast
```

**Description:**
Performs a lightweight scan using only regex-based rules. Useful for quick checks during development.
**Output:** Terminal summary showing detected secrets.

---

## 2. Deep Scan with Reports

```bash
sentinel ./my-project --deep --json --html
```

**Description:**
Runs all scanners (Regex, Entropy, Heuristic) and generates JSON and HTML reports.
**Output:**

* `sentinel_report.json`: Machine-readable report for CI/CD.
* `sentinel_report.html`: Human-readable audit report.

---

## 3. Ignoring Directories

```bash
sentinel ./my-project --deep --ignore node_modules dist test
```

**Description:**
Excludes directories to reduce scan time and avoid false positives in third-party code.

---

## 4. CI/CD Integration (GitHub Actions)

```yaml
name: Sentinel Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: sentinel . --deep --json
      - name: Upload Sentinel Report
        uses: actions/upload-artifact@v3
        with:
          name: sentinel-report
          path: sentinel_report.json
```

**Description:**
Automates scanning on push or pull requests. Uploads JSON report as artifact for review.

---

## 5. Custom Provider Rules

```json
{
  "rules": [
    {
      "name": "custom_api_key",
      "pattern": "custom_[0-9a-zA-Z]{20}"
    }
  ]
}
```

**Description:**
Place the JSON file in `src/scanners/providerRules/`. Custom rules are automatically included in the deep scan.

---

## 6. Combining Options

```bash
sentinel ./my-project --deep --json --html --ignore node_modules dist
```

**Description:**
Runs deep scan, generates JSON and HTML reports, and ignores specified directories.

---

## 7. Interpreting Reports

**JSON Example:**

```json
{
  "file": "src/config.js",
  "line": 12,
  "type": "AWS_SECRET_KEY",
  "match": "AKIA************"
}
```

**HTML Reports:**
Includes color-coded highlights and summary tables of secret types by frequency.

---

## 8. Troubleshooting Common Scenarios

* **No results:** Check if files were ignored or if directories contain code.
* **False positives:** Update custom provider rules to refine matching patterns.
* **Slow scans:** Use `--fast` mode or exclude large directories like `node_modules`.

---

Sentinel examples demonstrate flexible usage from simple checks to full CI/CD integration.

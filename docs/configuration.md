# Sentinel — Configuration Guide

This document explains how to configure Sentinel for custom scanning rules, project-specific settings, and advanced options.

---

## 1. Provider Rules

Sentinel comes with predefined provider rules for common services (AWS, GitHub, Stripe, Google, etc.). You can extend these with **custom rules**.

### Creating a Custom Rule

1. Create a JSON file in `src/scanners/providerRules/`. For example:

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

2. Run a deep scan:

```bash
sentinel ./my-project --deep
```

**Behavior:** Sentinel automatically includes all JSON rules in the scan.

---

## 2. Ignoring Files or Directories

Use the `--ignore` option to skip irrelevant paths:

```bash
sentinel ./my-project --deep --ignore node_modules dist logs
```

You can also define `.sentinelignore` in the project root:

```
node_modules
dist
logs
*.tmp
```

Sentinel will automatically read this file and ignore specified paths.

---

## 3. Scan Modes

| Mode     | Description                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------- |
| **Fast** | Uses regex-only scanning. Quick for development, less comprehensive.                               |
| **Deep** | Uses Regex, Entropy, and Heuristic scanners. Detects high-entropy secrets and suspicious patterns. |

**Command Example:**

```bash
sentinel ./my-project --deep --json --html
```

---

## 4. Report Configuration

Sentinel supports **JSON** and **HTML** reports.

| Option   | Description                                                 |
| -------- | ----------------------------------------------------------- |
| `--json` | Outputs machine-readable report, ideal for CI/CD pipelines. |
| `--html` | Outputs human-readable report for audits and reviews.       |

**Example:**

```bash
sentinel ./my-project --deep --json --html
```

Reports will be saved in the current working directory:

* `sentinel_report.json`
* `sentinel_report.html`

---

## 5. Advanced Options

* **Custom regex patterns:** Extend `providerRules/*.json` with specific patterns for your organization.
* **Directory exclusion:** Combine `--ignore` and `.sentinelignore` for precise control.
* **Integration with scripts:** Call Sentinel from shell scripts or npm scripts for automated scans.

---

## 6. Best Practices for Configuration

* Maintain a dedicated folder for organization-specific provider rules.
* Regularly review and update `.sentinelignore` for irrelevant or generated files.
* Prefer deep scans for sensitive environments.
* Ensure reports are stored securely and not committed to version control.

---

Sentinel’s configuration system allows flexible, project-specific scanning while maintaining speed and accuracy.

# Sentinel — CI/CD Integration Guide

This document provides instructions for integrating Sentinel into automated CI/CD pipelines to prevent secret leaks before code is merged or deployed.

---

## 1. GitHub Actions

Example workflow:

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
      - run: ./bin/sentinel.js . --deep --json
      - name: Upload Sentinel Report
        uses: actions/upload-artifact@v3
        with:
          name: sentinel-report
          path: sentinel_report.json
```

**Description:** Scans code on every push or pull request and uploads a JSON report as an artifact for review.

---

## 2. GitLab CI

Example `.gitlab-ci.yml`:

```yaml
stages:
  - scan

sentinel_scan:
  stage: scan
  image: node:18
  script:
    - npm ci
    - ./bin/sentinel.js . --deep --json --html
  artifacts:
    paths:
      - sentinel_report.json
      - sentinel_report.html
    expire_in: 7 days
```

**Description:** Runs deep scans with both JSON and HTML reports stored as artifacts.

---

## 3. Jenkins Pipeline

```groovy
pipeline {
  agent any
  stages {
    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Run Sentinel Scan') {
      steps {
        sh './bin/sentinel.js . --deep --json'
      }
    }
    stage('Archive Reports') {
      steps {
        archiveArtifacts artifacts: 'sentinel_report.json', fingerprint: true
      }
    }
  }
}
```

**Description:** Executes Sentinel scans and archives the JSON report for auditing.

---

## 4. Best Practices for CI/CD

* **Fail pipelines on secrets:** Optionally, you can add a step to fail the build if any secrets are detected.
* **Separate scanning stage:** Run Sentinel in a dedicated stage before deployment.
* **Protect reports:** Avoid committing reports to version control. Store as artifacts only.
* **Regular updates:** Keep provider rules and Sentinel version up-to-date.

---

## 5. Advanced Pipeline Integration

* Combine Sentinel with automated secret rotation tools.
* Integrate with notifications (Slack, email) for immediate alerting.
* Schedule nightly scans on long-running branches to ensure no secrets slip through.

---

Sentinel integrates seamlessly into CI/CD pipelines, ensuring secret detection is automated and continuous.

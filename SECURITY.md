# Sentinel — Security Guidelines

This document provides security best practices for using Sentinel safely and effectively.

---

## 1. Purpose

Sentinel scans codebases to detect secrets before they are committed or deployed. It **does not modify your code** and operates locally or in CI/CD pipelines.

---

## 2. Best Practices

* **Exclude unnecessary directories:** `.git`, `node_modules`, `dist`, and auto-generated folders.
* **Update provider rules regularly:** Stay current with new API key formats and patterns.
* **Run deep scans:** Ensure both entropy and heuristic checks are executed before deployment.
* **Integrate in pipelines:** Prevent secrets from reaching production by scanning pre-merge or pre-deploy.
* **Review detected secrets:** Verify findings before removal or rotation.

---

## 3. Security Considerations

* **Local execution:** Sentinel runs locally and does not transmit code externally.
* **Report handling:** Treat JSON and HTML reports as sensitive since they may contain secrets.
* **Version control:** Never commit reports to repositories. Use pipeline artifact storage instead.
* **Access controls:** Restrict who can run scans or view reports in CI/CD pipelines.

---

## 4. Secret Handling

* **Rotation:** If a secret is detected, rotate the key immediately.
* **Removal:** Remove secrets from code and replace with environment variables or secure storage.
* **Audit:** Maintain a record of secret findings for compliance purposes.

---

## 5. Compliance

Using Sentinel contributes to secure development practices and can aid in meeting:

* SOC2 / ISO27001 / GDPR / HIPAA compliance standards (for secret management and code audits).
* Internal corporate security policies for secret handling.

---

## 6. Incident Response

* Treat any detected secret as potentially compromised.
* Revoke and rotate keys immediately.
* Audit logs to ensure no further exposure.

---

Sentinel helps enforce secure coding practices and prevents accidental exposure of sensitive credentials.

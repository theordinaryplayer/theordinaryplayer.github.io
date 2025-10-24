# Cross-Site Scripting (XSS) — Practical Guide
Author: Rosemary

Cross-Site Scripting (XSS) is a client-side code injection vulnerability that allows attackers to run JavaScript in victims’ browsers. Impact ranges from UI redress / defacement and session theft to more advanced flows like token theft or performing actions on behalf of the user. XSS remains one of the most common web vulnerabilities and appears in many OWASP Top 10 discussions.

![1](https://media.geeksforgeeks.org/wp-content/uploads/20190516152959/Cross-Site-ScriptingXSS.png)

## Types of XSS (short)

* **Reflected XSS:** Payload is part of a request (e.g., URL) and reflected in the immediate response. Common in search, error messages, or query parameters.
* **Stored (Persistent) XSS:** Payload is stored by the application (e.g., comment, profile) and served to multiple users — higher impact because every visitor can be affected.
* **DOM-based XSS:** Injection happens in client-side code (JS modifies DOM from untrusted sources). Detection requires inspecting front-end code and dynamic DOM flows.

---

## Quick, safe checks (authorized testing only)

Always test only targets you own or have explicit permission to test. Use non-destructive probes first to confirm reflection or storage behavior.

* **Inspect reflection (basic):**

```bash
# baseline
curl -s 'https://example.com/search?q=test' -o base.html

# inject a harmless script tag and compare
curl -s 'https://example.com/search?q=<script>alert(1)</script>' -o test.html
diff -u base.html test.html | head
```

If the injected string appears unescaped in `test.html`, it indicates a reflection point. (Do not run `alert()` payloads on real users — use clearly benign strings like `XSS_TEST_123` to avoid nuisance.)

* **Check stored injection points** (authorized):

  * Submit a simple marker to a comment or profile field, then view the page as another user to see if the marker renders unescaped. Document screenshots/diffs rather than extracting data.

* **DOM XSS reconnaissance:**

  * Inspect client JS (browser devtools) for uses of `innerHTML`, `document.write`, `eval`, or unsafe `location.hash` usage. These indicate potential DOM injection sinks.

---

## Minimal safe payloads for evidence (lab / in-scope only)

Use non-malicious markers that are easy to search for:

```
<script>/*XSS_PROOF_2025*/</script>
<img src=x onerror=console.log('XSS_PROOF_2025')>
```

Record where the marker appears (response body, DOM, or stored page). Do **not** publish exploit payloads that would enable mass abuse.

---

## Defensive controls (what dev teams must do)

* **Contextual output encoding:** Escape output depending on context (HTML body, attribute, JS, URL, CSS). Prefer framework templating that auto-escapes.
* **Input validation ≠ escaping:** Validate input shape, but rely on output encoding for safety.
* **Content Security Policy (CSP):** Enforce CSP with `script-src` and nonces to reduce impact of injected scripts.
* **HttpOnly + Secure cookies:** Prevent easy theft of session cookies via JS.
* **Sanitize rich text carefully:** Use a well-maintained sanitizer library (allowlist approach) for HTML inputs.

---

## Detection & monitoring (defender playbook)

* Log suspicious inputs and monitor for payload markers: `(<script|onerror|javascript:)` patterns in requests.
* Use security scanners and manual review for stored content flows (automated scanners find many reflected issues, but stored/DOM often require manual checks).

---

## Reporting checklist (for responsible disclosure)

1. Endpoint(s) and parameter(s) where marker appears.
2. Type (reflected / stored / DOM).
3. Safe reproduction steps using non-destructive markers.
4. Impact assessment (session theft, CSRF escalation, user impersonation, etc.).
5. Remediation recommendations (contextual encoding, CSP, sanitization).

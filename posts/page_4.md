# Uncovering Local File Inclusion Vulnerabilities: A Practical Approach to Path Traversal Hunting
Author: Rosemary

Local File Inclusion (LFI) is one of the most common yet impactful vulnerabilities in modern web applications. It arises when user-supplied input is used to build file paths without proper sanitization or validation. Exploiting LFI can lead to unauthorized access to sensitive system files, information disclosure, or even remote code execution under specific conditions.

![1](https://i0.wp.com/lab.wallarm.com/wp-content/uploads/2021/12/Local-File-Inclusion-work.png?resize=770%2C462&ssl=1)

**Overview**

Local File Inclusion (LFI) occurs when an application constructs filesystem paths from user-controlled input without proper validation. An attacker who can control the included path may read sensitive files, enumerate users, leak configuration secrets, or—in certain setups—lead to remote code execution. This guide shows a practical, defensible methodology for finding and validating LFI/path-traversal issues and how to harden systems against them. **Only test targets you own or have explicit authorization to test.**

---

## 1 — What is LFI (short and sharp)

An LFI happens when code like this takes user input and includes it directly:

```php
include($_GET['page']);
```

If `page` is not restricted, an attacker can change what file the server includes. Root causes are usually:

* Missing input validation or allowlists
* Concatenation of user input into file paths
* Exposed dev/backups or predictable file locations

Mapping the weakness to CWE: this is typically **CWE-22 (Path Traversal)** and sometimes **CWE-98/CWE-94** if inclusion leads to code execution.

---

## 2 — Recon & parameter discovery (safe, non-destructive)

Goal: enumerate endpoints and parameters that accept file-like input.

Useful tools & commands:

* **Gather archived URLs** (public sources)

```bash
gau example.com > urls.txt
```

* **Crawl & spider** (Burp Spider / Burp Scanner)

  * Use Burp’s crawler to enumerate dynamic endpoints and hidden parameters.

* **Directory & param discovery** (gobuster / ffuf)

```bash
gobuster dir -u https://example.com -w /usr/share/wordlists/dirb/common.txt -x php,html -t 50
# or
ffuf -u https://example.com/FUZZ -w /usr/share/wordlists/common.txt
```

* **Filter for likely parameters** (look for names that imply file/include)

```bash
grep -Eo "([?&](file|path|page|include|template|doc|view|download)=[^& ]+)" urls.txt | sort -u
```

Focus on parameters like: `file=`, `page=`, `template=`, `inc=`, `download=`, `path=`, `doc=`.

---

## 3 — Manual probing (confirming behavior, low-noise)

Principle: start with non-destructive checks that change **behavior** only (not data extraction). Always log timestamps and keep tests minimal.

Commands for behavioral checks:

* **Compare responses** (normal vs. manipulated input)

```bash
# baseline
curl -s 'https://example.com/view.php?page=home' -o baseline.html
# altered (proof of concept must be safe and limited)
curl -s 'https://example.com/view.php?page=..%2Fhome' -o test.html
diff -u baseline.html test.html | head
```

* **Identify error messages / stack traces**

```bash
curl -s 'https://example.com/view.php?page=bogus' -D - | sed -n '1,60p'
```

If the app returns filesystem errors or stack traces, it often leaks the server OS or application paths—useful for classification, not exploitation.

> **Safety note:** Do not use destructive payloads (e.g., writing files) on targets without express authorization.

---

## 4 — Typical LFI indicators and tests (explain, not weaponize)

Indicators that an LFI may be present:

* Parameter appears in server-side include or `require` logic.
* Application displays file contents or echoes included templates.
* Error messages contain absolute or relative path information.
* Response behavior changes when adding traversal sequences.

Common minimal checks (lab/authorized testing):

* Inject harmless traversal sequences and observe response differences (timing, content length, error).
* Check for inclusion of webroot files that are normally accessible (short, non-sensitive files) to verify include mechanics.

Do **not** publish or run destructive commands (e.g., file writes, webshell creation) on production targets you don’t control.

---

## 5 — Proof-of-concept & evidence collection (responsible)

When you have reasonable confidence an LFI exists, collect non-destructive evidence for a report:

* The vulnerable endpoint and exact parameter name.
* Baseline and altered responses (diffs/screenshots) showing the difference.
* Server headers and any error strings (do not reveal exploited content in public reports).
* Environment fingerprint (OS, server, app stack) gleaned from safe artifacts.

Example of documenting a behavioral PoC (conceptual):

```
1) Baseline: GET /view.php?page=home  -> 200 OK, content X
2) Test:     GET /view.php?page=../../home -> 200 OK, content differs (diff attached)
3) Observed server header: Server: nginx/1.18.0
4) Error output: "Warning: include(/var/www/html/home): failed to open stream..."
```

This is enough for vendors to triage without handing them exploit code.

---

## 6 — Escalation scenarios (what makes LFI worse)

LFI becomes significantly more severe if any of the following apply:

* **Writable upload directories**: Attacker can upload a file (logs, images) and include it later → RCE.
* **Log file inclusion**: If logs are user-injectable and included, attackers can place payloads in logs.
* **Remote file inclusion allowed (RFI)**: If remote file includes are enabled, exfil or code execution is easier.
* **Privileged DB or exec features**: Access to sensitive files like config with DB credentials increases blast radius.

Document whether such conditions exist during assessment — again, only via observation and safe checks.

---

## 7 — Defenses: code and deployment fixes

Concrete, actionable mitigations developers can apply.

### A. Code-level protections

* **Allowlist directories** (never accept arbitrary paths):

```php
$allowed = ['home','about','contact'];
$page = $_GET['page'] ?? 'home';
if (!in_array($page, $allowed)) { http_response_code(404); exit; }
include __DIR__ . '/pages/' . $page . '.php';
```

* **Use realpath + validation**:

```php
$base = realpath(__DIR__ . '/pages') . DIRECTORY_SEPARATOR;
$path = realpath($base . $_GET['page']);
if ($path === false || strpos($path, $base) !== 0) { http_response_code(403); exit; }
include $path;
```

* **Avoid dynamic includes** where possible — use routing or explicit mappings.

### B. Configuration & server hardening

* **Store uploads outside webroot** and serve via safe proxy that enforces content-type checks.
* **Disable risky PHP settings** (`allow_url_include = Off`) and ensure `open_basedir` is set to restrict accessible paths.
* **Remove verbose error messages** from production (no stack traces to end-users).

Nginx example to block obvious backup files:

```nginx
location ~* \.(zip|tar|sql|bak)$ {
    deny all;
    return 403;
}
```

### C. Principle of least privilege

* Application processes should not run as root.
* Limit file system permissions—application should only read files it needs.

---

## 8 — Detection & monitoring (what defenders should watch for)

Search logs for suspicious patterns that may indicate traversal attempts:

* Webserver logs:

```bash
# basic heuristic search
grep -Ei "(\.\./|\.\.\\|%2e%2e|etc/passwd|boot.ini|/proc/self)" /var/log/nginx/access.log | tail -n 200
```

* Monitor application errors for include/failed-open messages:

```bash
grep -i "failed to open stream" /var/log/php_errors.log
```

* Alert on attempts to access sensitive paths (e.g., `/etc/passwd`, `/proc/self/environ`) from the webapp.

---

## 9 — Responsible disclosure checklist

If you find an LFI (authorized testing):

1. **Document**: endpoint, parameter, controlled test inputs, server fingerprints, and diffs/screenshots.
2. **Avoid destructive steps**: do not write files, do not trigger RCE in the wild.
3. **Report privately** to the vendor/owner with a clear remediation suggestion (allowlist + realpath + config changes).
4. **Coordinate** timeline for patching and public disclosure per vendor policy.

---

## 10 — Lab practice (safe environments)

Set up legal, isolated labs to practice:

* OWASP Juice Shop (web vulnerabilities playground):

```bash
docker run --rm -p 3000:3000 bkimminich/juice-shop
# browse http://localhost:3000
```

* DVWA (Deliberately Vulnerable Web App) or custom containers with isolated LFI examples.

Practice detection and safe evidence collection in these environments before attempting any real-world testing.

---

## Conclusion

LFI issues are often the result of simple, fixable mistakes: dynamic includes and insufficient input validation. The most important habit for a researcher or dev is to **assume input is hostile**, use allowlists, resolve paths safely (realpath), and run the app with least privilege. When you find an LFI, document behavior, avoid destructive steps, and help the owner patch the root cause.

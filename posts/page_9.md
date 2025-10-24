# Remote File Inclusion (RFI) — Practical Guide
Author: Rosemary

Remote File Inclusion (RFI) is a severe web vulnerability where an application includes code or content from a *remote* resource (URL) based on user input. When exploitation is possible, an attacker can cause the server to fetch and execute attacker-controlled code — often resulting in full remote code execution. RFI is less common today than classic LFI because many environments disable remote includes, but it still appears in legacy apps and misconfigured PHP stacks.

![1](https://cdn.prod.website-files.com/5ff66329429d880392f6cba2/677d4b0e13efe97db0f7f0f5_615dbdfcbb0362643fa48c91_Remote%2520file%2520inclusion%2520work.png)

This guide explains how to *safely* hunt for RFI in authorized tests, how to detect and document it without creating exploit code, and how developers and ops teams can eliminate the risk.

> **Important:** All testing examples and commands below are for **authorized, in-scope** security testing only (bug bounty, pentest with permission, or local lab). Do not attempt on systems you don’t have explicit permission to test.

---

## 1 — What causes RFI (quick root causes)

Typical root causes:

* Using user input directly in an `include`, `require`, `file_get_contents`, or similar function.
* `allow_url_include = On` (PHP) or `allow_url_fopen = On` combined with inclusion logic.
* No allowlist / insufficient input validation.
* Legacy frameworks or plugins that trust external templates.

Example (unsafe pattern, conceptual):

```php
// unsafe: user-controlled value used directly in include
include $_GET['page'];
```

If `page` can be a URL and remote includes are allowed, the server may fetch and execute remote code.

---

## 2 — Recon & parameter discovery (non-destructive)

Goal: find likely inclusion points and parameters without executing remote code.

* **Collect URLs** (archives & crawling)

```bash
gau example.com > urls.txt
```

* **Find candidate parameters** (search for `page`, `include`, `template`, `url`, `view`, `file`)

```bash
grep -Eo "([?&](page|file|template|include|url|view)=[^& ]+)" urls.txt | sort -u
```

* **Inspect responses & errors** using safe, benign inputs (do not trigger remote code fetches):

```bash
curl -s -D - 'https://target.example/view.php?page=home' | sed -n '1,60p'
```

Look for error messages or stack traces hinting at `include()` usage or absolute file paths.

* **Static fingerprinting**: server headers, application frameworks, and exposed phpinfo (if accidentally public) provide clues about PHP configuration. A phpinfo page may reveal `allow_url_include`, but **never** request or leak phpinfo from a third-party unless authorized.

---

## 3 — Safe confirmation techniques (non-exploitative)

Confirm behavior by observing how the application *responds* to changes, not by including remote content.

* **Behavioral diffing**: submit harmless variations and compare responses.

```bash
curl -s 'https://target.example/view.php?page=home' -o base.html
curl -s 'https://target.example/view.php?page=home%2F' -o test.html
diff -u base.html test.html | head
```

Significant differences or new error output may indicate the parameter is used in an include path.

* **Error observation**: trigger a local-file-not-found path (non-sensitive) and capture server error messages (stack traces), which help triage whether the code uses include/require or file wrappers.

* **Passive evidence**: extract any helpful clues from pages, comments, or exposed backups that indicate remote include logic. Aggregate these as non-destructive evidence for reporting.

> Do **not** attempt to include remote resources or upload code on real targets you do not control. That would be destructive and illegal.

---

## 4 — Authorized tooling (use carefully)

Only use active scanners when allowed and tuned to be non-destructive.

* **Burp Suite** (manual inspection, intruder for safe fuzzing) — good for controlled, manual exploration.
* **Nikto** and **wpscan** — useful for fingerprinting but can be noisy; run only when permitted.
* **ffuf/gobuster** — to discover hidden endpoints and potential include points.

Example safe ffuf usage (discovery only):

```bash
ffuf -u https://target.example/FUZZ -w /usr/share/wordlists/common.txt -sf
```

When using any automation, set low concurrency and avoid payloads that cause remote fetches.

---

## 5 — Why RFI is dangerous — escalation scenarios

RFI becomes critical when one or more of the following conditions exist:

* **Remote include is executed by the interpreter** → attacker can run arbitrary code.
* **File wrappers available** (e.g., `php://input`, `data://`) and `allow_url_include` enabled → more attack vectors.
* **Writable upload directories** or log file injection allow combination with LFI to reach RCE.
* **Web server or PHP runs with high privileges** → greater impact.

Document whether any of the above conditions appear likely via safe observation; that increases severity and urgency in reporting.

---

## 6 — Mitigations — configuration & code (concrete)

### PHP configuration (defensive)

Ensure these are set in `php.ini` or the site’s PHP-FPM pool config:

```ini
allow_url_include = Off       ; Prevent including remote files
allow_url_fopen = Off         ; Disable remote file wrappers for file operations
```

Set `open_basedir` to confine PHP to the application directory:

```ini
open_basedir = /var/www/example.com/:/tmp/
```

After config changes, reload PHP-FPM / webserver:

```bash
sudo systemctl reload php8.1-fpm
sudo systemctl reload nginx
```

### Code-level controls

* **Never** include user-supplied URLs or filenames directly. Use explicit allowlists or routing maps:

```php
$map = [
  'home' => 'pages/home.php',
  'about'=> 'pages/about.php',
];

$key = $_GET['page'] ?? 'home';
if (!array_key_exists($key, $map)) {
    http_response_code(404); exit;
}
include __DIR__ . '/' . $map[$key];
```

* **Use realpath validation** before including local files:

```php
$base = realpath(__DIR__ . '/pages') . DIRECTORY_SEPARATOR;
$path = realpath($base . $_GET['page']);
if ($path === false || strpos($path, $base) !== 0) {
    http_response_code(403); exit;
}
include $path;
```

* **Remove legacy features** that allow remote templates or plugins to pull code from arbitrary sources.

### Deployment hardening

* Run web processes with **least privilege** (no root).
* Store uploads **outside** webroot and serve via controlled handlers (that never `include()` uploaded files).
* Enable WAF rules that detect suspicious upstream inclusion attempts as a compensating control.

---

## 7 — Detection & logging (for defenders)

Search logs for RFI-like attempts and suspicious patterns:

* **Access logs**: look for parameters containing URL patterns or remote hostnames:

```bash
grep -Ei "(https?://|ftp://|data:|php://)" /var/log/nginx/access.log | tail -n 200
```

* **Error logs**: look for include/require warnings and failure messages:

```bash
grep -i "failed to open stream" /var/log/php_errors.log
```

* **Alerting**: create SIEM rules for requests with `http(s)://` inside query parameters or bodies; correlate with spikes in 500 errors.

---

## 8 — Responsible reporting checklist

When you confirm an RFI-like issue in-scope:

1. **Describe the endpoint & parameter** (exact URL and parameter name).
2. **Provide non-destructive evidence** (response diffs, headers, stack trace excerpts) — do **not** include exploit payloads.
3. **Indicate PHP / server fingerprints** gleaned safely (e.g., header, plugin hints).
4. **List conditions that increase impact** (e.g., `allow_url_include` likely on, upload dir writable).
5. **Suggest fixes** (disable `allow_url_include`, use allowlists, set `open_basedir`, restrict privileges).
6. **Coordinate disclosure** per vendor policy.

---

## 9 — Safe lab for practice

Practice RFI detection and mitigation in isolated environments only:

* Deploy a local vulnerable VM/container or intentionally vulnerable applications (e.g., DVWA on a private Docker network).
* Configure a test PHP environment with `allow_url_include = On` in a lab to understand mechanics — never enable this in production.

Example to run a vulnerable app locally (lab):

```bash
# OWASP Juice Shop for general practice
docker run --rm -p 3000:3000 bkimminich/juice-shop
```

Build small custom examples in a local VM to safely observe behavior and test mitigations.

---

## 10 — Final notes

RFI is a high-risk issue when present because it can directly lead to arbitrary code execution. Modern defenses (default PHP settings, framework routing, and secure coding practices) make RFI rarer — but legacy code and plugin ecosystems still harbor it. The safest testing posture is: **observe, document, and report** — do not weaponize findings. Help teams remediate by showing exact configuration fixes and safe coding patterns.


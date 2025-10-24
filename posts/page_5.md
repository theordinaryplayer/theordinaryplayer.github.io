# Open-Source Intelligence (OSINT) — Practical Guide for Cyber Reconnaissance
Author: Frigg

Open-Source Intelligence (OSINT) is the practice of collecting and analyzing publicly available information to gain insights into a target — be it an organization, infrastructure, or digital footprint. In cybersecurity, OSINT is critical for **attack surface mapping, threat intelligence, vulnerability research**, and **incident response**.

![1](https://www.defenceonline.co.uk/wp-content/uploads/2024/11/osint-scaled.jpg)

This guide outlines how to conduct lawful and efficient OSINT for penetration testing, red teaming, or bug bounty reconnaissance, complete with safe tools and command-line workflows.

> **Note:** All examples and commands are for **authorized testing and research** only. Never use these techniques against systems or individuals without explicit permission.

---

## 1. Understanding OSINT

OSINT isn’t just Googling a company’s name — it’s a structured intelligence process:

1. **Define objective:** What’s the mission? (e.g., identify subdomains or exposed assets)
2. **Collect data:** Use passive sources like archives, search engines, and public databases.
3. **Process and enrich:** Correlate data from multiple sources.
4. **Analyze:** Identify patterns, risks, and relationships.
5. **Report:** Present findings clearly, with actionable insights.

---

## 2. Legal & Ethical Framework

OSINT operates within the boundaries of law and ethics. Key principles include:

* Collect only **publicly available** information.
* Respect **Terms of Service** for all platforms.
* Avoid scanning or brute-forcing without authorization.
* Protect personal data — don’t disclose private information unless there’s a clear, lawful reason.
* Always maintain an **audit trail** of your actions and evidence.

---

## 3. OSINT Toolkit (with Real Commands)

### Web & Archive Discovery

* **gau** – Retrieve archived URLs from sources like Wayback Machine:

```bash
gau example.com > urls.txt
```

* **waybackurls** – Get historical snapshots:

```bash
waybackurls example.com > wayback.txt
```

* **curl** – Download and inspect a page:

```bash
curl -sL 'https://example.com/page' -o page.html
```

---

### Subdomain & DNS Enumeration

* **amass** – Comprehensive subdomain discovery:

```bash
amass enum -d example.com -o amass.txt
```

* **subfinder** – Fast passive subdomain finder:

```bash
subfinder -d example.com -o subs.txt
```

* **dig** – Check DNS records:

```bash
dig +short example.com ANY
```

---

### Passive Service Discovery

* **Shodan** – Search internet-exposed devices:

```bash
shodan search --fields ip_str,port,org "hostname:example.com"
```

* **Censys** – Identify hosts via certificate and banner data.

> Passive reconnaissance avoids triggering alarms or violating access policies.

---

### Email, Identity & Leak Search

* **theHarvester** – Gather emails, hosts, and subdomains:

```bash
theHarvester -d example.com -b all -l 500
```

* **HaveIBeenPwned API** – Check if emails appear in breaches.
* **Hunter.io** – Find corporate email patterns and contacts.

---

### URL Filtering and Validation

Use `gf` and `httpx` to detect live endpoints with interesting parameters:

```bash
cat urls.txt | gf lfi | httpx -threads 50 -o live_lfi.txt
```

---

### Social Media & People Search

* **LinkedIn, GitHub, Twitter, Facebook** – Manual and API-based searches.
* **Maltego** – Visual link analysis between identities, domains, and organizations.
* **SpiderFoot** – Automated OSINT platform for aggregation and enrichment.

> Always use dummy or research accounts. Never engage with targets directly.

---

## 4. Google Dorking for Discovery

Example Google queries (dorks) for reconnaissance:

* Find admin panels:

```
site:example.com intitle:"login"
```

* Find configuration files:

```
site:example.com ext:conf OR ext:env OR ext:ini
```

* Find exposed documents:

```
site:example.com filetype:pdf OR filetype:xlsx
```

* GitHub code exposure:

```
org:example "AWS_SECRET_ACCESS_KEY"
```

**Use responsibly.** Avoid accessing or downloading sensitive files from external sources.

---

## 5. Certificate Transparency & Domain Correlation

Use **crt.sh** to find hidden subdomains:

```bash
curl -s "https://crt.sh/?q=%25.example.com&output=json" | jq -r '.[].name_value'
```

Use the output to feed enumeration tools like `amass` or `subfinder`.

---

## 6. Timeline Reconstruction

When conducting threat or leak analysis:

1. Record timestamps (archive date, WHOIS updates, commit history).
2. Normalize to UTC (ISO 8601 format).
3. Correlate key events — e.g., domain registration → GitHub repo creation → credential leak.
4. Store immutable evidence (hash files, archive URLs).

---

## 7. OPSEC for OSINT Investigators

* Use **VPNs or dedicated research environments** (VMs, containers).
* Isolate browser sessions per target.
* Avoid personal accounts or cookies.
* Maintain anonymous accounts for testing (within legal limits).
* Never “like,” “follow,” or interact with targets under observation.

---

## 8. Common OSINT Workflows

### A. Find Public S3 Buckets

```bash
grep -Eo "s3\.amazonaws\.com/[^\"' ]+" urls.txt | sort -u
```

### B. Enumerate Subdomains via Certificates

```bash
curl -s "https://crt.sh/?q=%25.example.com&output=json" | jq -r '.[].name_value'
```

### C. Shodan for Open Ports

```bash
shodan search --fields ip,port,org "ssl.cert.subject.CN:example.com"
```

### D. Collect Paste Leaks (manual or via APIs)

Use paste search engines or breach monitoring services — not public dumps.

---

## 9. OSINT Reporting Template

**Title:** Exposed Backup File on Public Server
**Scope:** example.com (and related subdomains)
**Impact:** Publicly accessible SQL backup containing user data.
**Evidence:** URL, screenshots, timestamps, SHA256 hash of downloaded file.
**Recommendation:** Restrict directory listing, remove backup, rotate database credentials.

## 10. Key Red Flags

* Publicly accessible credentials (`.env`, `.git`, or config files).
* Leaked databases or S3 buckets.
* Exposed admin panels or dev subdomains.
* Sensitive information on GitHub (tokens, private repos).

Treat these as **high-priority disclosures** — report via official bug bounty or responsible disclosure channels.

---

## 11. Final Thoughts

OSINT is not hacking — it’s **structured intelligence work**. When used responsibly, it strengthens cybersecurity, supports investigations, and improves digital resilience.
Your power as an OSINT analyst lies in curiosity, discipline, and respect for privacy.

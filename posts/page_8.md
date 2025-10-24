# Digital Forensics for CTFs & Labs
Author: Frigg

Short, practical, and focused on what you actually do in CTF forensic challenges: acquire, preserve, analyze, and report — with commands and tips you can run in your lab. All examples assume **legal, in-scope** work (CTF images, practice VMs).

![1](https://www.eiresystems.com/wp-content/uploads/IT-specialist-examines-computer-showcasing-what-is-digital-forensics-in-cybersecurity.jpg)

## Quick workflow (the 5-minute plan)

1. **Preserve** — don’t change the original. Work from bit-for-bit copies.
2. **Acquire** — image the target (disk / memory / network capture).
3. **Verify** — hash originals and images (SHA256/SHA1).
4. **Analyze** — triage artifacts (files, logs, registry, PCs), then deep-dive (memory, carved files, timelines).
5. **Report** — timeline, artifacts, hashes, reproducible steps, and remediation or flags (CTF).

---

## Tools you’ll use a lot (CTF-friendly)

* Disk imaging & handling: `dd`, `dcfldd`, `ewfacquire` (libewf), `ftkimager`
* Filesystem & carving: `fls`, `icat`, `tsk_recover` (SleuthKit), `bulk_extractor`, `scalpel`, `foremost`, `binwalk`
* Memory forensics: `volatility3`, `volatility` (legacy), `rekall`
* PCAP & network: `tcpdump`, `tshark`, `wireshark`, `zeek`
* Hashing & verification: `sha256sum`, `md5sum`
* Windows artifacts: `Registry Explorer`, `plaso/log2timeline` (psteal), `evtx`, `mftparser`
* Metadata & quick triage: `strings`, `exiftool`, `file`, `rmlint`
* Automation / visual: `autopsy` (SleuthKit GUI), `timesketch` (timeline), `Bulk Extractor`
* Scripting: Python + `pytsk`, `pyewf`, `pyshark`, `pycryptodome` for custom tasks

---

## Acquisition (examples)

**Disk image with dd (lab only)**

```bash
# Make a bit-for-bit image and calculate SHA256 on the fly
dd if=/dev/sdb bs=4M status=progress | tee >(sha256sum > original.sha256) > image.raw
```

**Use dcfldd for forensic-oriented imaging**

```bash
dcfldd if=/dev/sdb of=/mnt/evidence/image.dd hash=sha256 log=image.log
```

**Acquire an EWF (Expert Witness) image**

```bash
ewfacquire --evidence-name "ctf_disk" --description "CTF challenge" /dev/sdb /evidence/ctf.E01
```

**Memory capture (Linux)**

```bash
# LiME kernel module for lab VM
insmod lime.ko "path=/evidence/mem.lime format=lime"
```

**Memory capture (Windows, lab)**

* Use `winpmem` or `FTK Imager` to dump RAM to `mem.dmp`.

---

## Verification

```bash
sha256sum image.raw > image.raw.sha256
sha1sum image.raw > image.raw.sha1
# Compare later to prove integrity
sha256sum -c image.raw.sha256
```

---

## Quick triage (speed matters in CTFs)

**Find interesting files (type/strings/search)**

```bash
# list everything and top large files
find /mnt/image_mount -type f -printf '%s %p\n' | sort -nr | head

# find documents, config, keys
grep -R --line-number -iE "password|passwd|secret|api_key|private" /mnt/image_mount || true

# quick strings for binaries and suspicious files
strings -n 8 /mnt/image_mount/path/to/file | egrep -i "flag|password|secret|http|ssh|token"
```

**Carve files from a raw image**

```bash
# recover common filetypes
foremost -i image.raw -o foremost_out
# or
scalpel image.raw -o scalpel_out
```

**Bulk metadata extraction**

```bash
bulk_extractor -o bulk_out image.raw
# outputs: cookies, url, email, phone, creditcards (if present), and carved files
```

---

## Filesystem & Windows artifact quick hits

**SleuthKit example: list filesystem metadata**

```bash
# list file entries (inode-based)
fls -r -m / image.raw > fls.txt

# extract a file by inode
icat image.raw 12345 > recovered_file.bin
```

**NTFS Master File Table (MFT) / $MFT**

* Use `mftparser` or `fls` to enumerate deleted/renamed files and timestamps.

**Windows Registry (offline)**

* Mount or extract `SYSTEM`, `SOFTWARE`, `NTUSER.DAT`, `SAM` then use `reglookup` or `Registry Explorer` to parse:

```bash
# example: list user profiles from SOFTWARE/NTUSER keys (lab)
python reglookup.py -f NTUSER.DAT -k "Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders"
```

**Event Logs (EVTX)**

* Use `evtx_export` or `evtx_dump` to convert to JSON/CSV for timeline.

**Prefetch & LNK**

* Inspect `C:\Windows\Prefetch` and `.lnk` files for executed programs and timestamps (helpful in CTF challenges to find executed exploiters).

---

## Memory forensics (fast path)

**Identify profile & dump info with volatility3**

```bash
# Example: list processes
vol -f mem.dmp windows.pslist

# Extract network connections
vol -f mem.dmp windows.netstat

# Extract command history / strings
vol -f mem.dmp windows.cmdline | head
```

**Search memory for secrets/keys**

```bash
strings -a mem.dmp | egrep -i "password|ssh-rsa|BEGIN RSA PRIVATE KEY|API_KEY|token|flag"
```

**Dump process memory / modules**

```bash
vol -f mem.dmp windows.pstree
vol -f mem.dmp --pid 1234 windows.memmap
vol -f mem.dmp --pid 1234 windows.dumpfiles --dump-dir=proc_dump
```

---

## Network forensics (pcap)

**Capture traffic**

```bash
# capture on interface (lab)
tcpdump -i eth0 -w capture.pcap
```

**Quick pcap triage**

```bash
# extract HTTP objects
tshark -r capture.pcap -Y "http.request" -T fields -e http.request.uri -e ip.src -e http.host

# extract files from pcap (Wireshark GUI or tshark/export)
tcpflow -r capture.pcap -o tcpflow_out
```

**Zeek for higher-level logs**

```bash
zeek -r capture.pcap
# outputs conn.log, http.log, dns.log, files.log (great for CTF)
```

---

## Timeline building (crucial for forensics & CTF writeups)

**Use Plaso / log2timeline**

```bash
log2timeline.py plaso.dump image.raw
psteal.py --source image.raw --output file.plaso
# then
psort.py -o L2tcsv plaso.dump > timeline.csv
```

**Manual timeline assembly**

* Collect timestamps from MFT, $LogFile, macOS unified logs, web logs, and pcap timestamps.
* Normalize to UTC and sort events. Use `timesketch` for collaborative timeline review.

---

## Specialized artifact checks (CTF common finds)

**Search for flags (typical patterns)**

```bash
grep -R --line-number -iE "flag\{|FLAG\{|\bctf\b|\bsecret\b" /mnt/image_mount || true
strings image.raw | egrep -i "flag\{.*\}" || true
```

**Search for private keys or PEM blobs**

```bash
grep -R --line-number -E "-----BEGIN (RSA|PRIVATE) KEY-----" /mnt/image_mount || true
```

**Look for credentials in config files**

```bash
egrep -i "password|passwd|db_pass|connection_string|jdbc|mongo" -R /mnt/image_mount || true
```

**Extract browser history / cookies**

* For Chrome: `~/.config/google-chrome/Default/History` (SQLite)
* Use `sqlite3` to query URLs, or `plaso`/`autopsy` to parse.

---

## Carving & reverse-engineering files

**Binwalk for firmware / embedded**

```bash
binwalk -e firmware.bin
```

**Extract images & documents**

```bash
foremost -i image.raw -o foremost_output
```

---

## Reporting (CTF-style and forensic integrity)

Your report should include:

* **Scope** (image name, hash, acquisition time, who/where).
* **Methods** (commands used with versions and timestamps).
* **Findings** (timelines, key artifacts, flags or secrets found, file paths, offsets).
* **Evidence** (MD5/SHA hashes of recovered artifacts).
* **Repro steps** (how to extract artifact from image).
* **Conclusion & remediation** (for CTF: explanation of how flag relates to artifacts).

Example evidence snippet:

```
Artifact: /home/user/flag.txt
Offset: 0x1F4A000
SHA256: 3b3a...abcd
Acquired: 2025-10-24T09:12:34Z
Command used: icat image.raw 12345 > /tmp/flag.txt
```
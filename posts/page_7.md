# Cryptography in Capture The Flag (CTF)
Author: Frigg

Cryptography is the practice of developing and using coded algorithms to protect and obscure transmitted information so that it may only be read by those with the permission and ability to decrypt it. Put differently, cryptography obscures communications so that unauthorized parties are unable to access them.

![1](https://ik.imagekit.io/edtechdigit/uscsi/Content/images/articles/a-brief-guide-on-cryptography-technology-for-cybersecurity.jpg)

## Quick orientation (what CTF crypto challenges test)

* Recognize primitives (hash, MAC, symmetric, asymmetric).
* Find incorrect use (nonce reuse, ECB, static IV, unauthenticated encryption).
* Use tooling & small scripts to recover keys / forge data.
* Typical patterns: OTP reuse, RSA low-exponent, common modulus, padding oracle, hash length extension, HMAC misuse, PRNG predictability.

---

## Tools you’ll use a lot

* `hashcat` / `john` (password/hash cracking)
* `openssl` (inspect/convert/generate)
* `python3` (+ libraries: `pycryptodome`, `cryptography`, `sage` when allowed)
* `RsaCtfTool`, `msieve`, `yafu` / `pari/gp` (factorization)
* `netcat`, `curl`, `requests` (interact with challenge)
* Quick helpers: `xxd`, `base64`, `jq`, `cut`, `sed`

---

## Useful general commands (CTF lab)

```bash
# base64 decode/encode
echo 'aGVsbG8=' | base64 -d
echo -n 'hello' | base64

# hex dump / convert
echo -n '68656c6c6f' | xxd -r -p
xxd -p secret.bin

# openssl: AES decrypt (example, ECB or CBC)
openssl enc -aes-128-cbc -d -in cipher.bin -K <keyhex> -iv <ivhex> -nopad

# hash identification
hashid cipher.txt   # or use online hash identifiers in CTF labs

# hashcat example (sha1)
hashcat -m 100 -a 0 hash.txt /path/to/wordlist.txt

# john example
john --wordlist=rockyou.txt --format=raw-md5 hash.txt
```

---

## 1) Encoding / classical crypto (easy CTF starters)

* Recognize: base64, hex, ROT13, Caesar, Vigenère, XOR single-byte, XOR repeating key.
* Tools: `cyberchef`, `xorsearch`, `rabin2` for binaries.
* Quick XOR single byte (python):

```python
# find single-byte xor key
from itertools import cycle
data = bytes.fromhex(open('c.hex').read().strip())
for k in range(256):
    p = bytes([b ^ k for b in data])
    if b'CTF' in p or all(32<=c<127 for c in p[:20]):
        print(k, p[:200])
```

---

## 2) Hashes / cracking

* Identify hash type (hashid). Use `hashcat` with correct `-m`.
* Salted vs unsalted: if salted and salt known, craft appropriate input.
* Rainbow tables not common in modern CTFs — brute force / wordlists + rules typical.
* Hashcat example:

```bash
hashcat -m 0 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt
```

* When facing custom hash or multiple rounds, write python to replicate and then brute-force.

---

## 3) HMAC / MAC misuse

* Length-extension attack: applies to **Merkle–Damgård** hashes (MD5, SHA-1, SHA-256) if app uses `hash(secret || message)` to authenticate. If challenge reveals `hash(secret||msg)` and allows you to append data, do length extension.
* Tools: `hashpumpy` (python).

```bash
# example: use hashpumpy to forge message and new hash
hashpumpy -s <orig_hash> -d "<orig_msg>" -a "<append_data>" -k <key_len>
```

* If HMAC (proper) used, length-extension not possible. Look for `md5(secret + msg)` vs `hmac_md5`.

---

## 4) Symmetric crypto gotchas (AES)

* **ECB detection**: repeated blocks → identical ciphertext blocks. `detect-ecb.py` or just `xxd`.
* **Nonce/IV reuse**: CTR/GCM reuse catastrophic — recover keystream or plaintext XORs.
* **Padding oracle**: CBC with padding errors and distinguishable messages → full decryption via padding oracle attack.

### Padding oracle (CTF pattern)

* If server responds differently for valid vs invalid padding, you can brute-force plaintext block-by-block.
* Python skeleton (lab only):

```python
# pseudo-code: query oracle until padding valid
for i in range(256):
    test_block = craft_block(i, known_bytes, ...)
    resp = requests.get(url_with_cipher(test_block))
    if resp.status_code == 200 or 'padding' not in resp.text:
        # guessed byte
```

* Tools: `paddingoracle` libraries exist; implement per-challenge.

---

## 5) One-Time Pad / stream cipher reuse

* OTP reuse (same keystream XORed with two plaintexts): `c1 ^ c2 = p1 ^ p2`. Known-plaintext/ciphertext crib-dragging recovers texts.
* Use `xortool` or write crib-drag script.

---

## 6) RSA — the CTF goldmine

Common CTF RSA scenarios and quick edicts:

### Recognize from challenge

* Small `e` (e = 3,5,17) — potential low exponent attack (if m^e < n → cube root).
* Common modulus `n` reused across keys with different e — use `gcd(n1, n2)` to find shared prime.
* Small prime factors — factor `n` with `yafu`, `msieve`, `factordb` (CTF offline).
* `p` and `q` very close — Fermat factorization.
* `d` small → Wiener's attack (use `RsaCtfTool` or `wiener`).
* Broadcast attack (same message to multiple recipients with small e).
* Padding oracle / Bleichenbacher (advanced; rare in CTFs but possible).

### Commands & tools

```bash
# RsaCtfTool (automates many attacks)
git clone https://github.com/Ganapati/RsaCtfTool
python3 RsaCtfTool/RsaCtfTool.py --publickey target.pem --uncipher

# msieve / yafu for factoring
yafu 'factor(<n>)'
msieve <n>

# e=3 small message (use python gmpy2)
# compute integer cube root of ciphertext if m^3 < n
```

### Example: low e (e=3) decrypt if c < n and m^3 < n

```python
from gmpy2 import iroot, mpz
c = mpz(<ciphertext>)
m, exact = iroot(c, 3)
if exact:
    print(bytes.fromhex(hex(int(m))[2:]))
```

---

## 7) ECC / ECDSA traps in CTFs

* Reused nonce `k` in ECDSA → recover private key. If two signatures share `k`, solve linear equations.
* Weak curve params or small subgroup attacks sometimes appear.
* Tools: `sage` or write small scripts using `ecdsa` library.

---

## 8) PRNG / RNG weaknesses

* `rand()` or `mt19937` predictability is common in CTFs. If key or token generated by predictable RNG, reverse internal state.
* `mt19937`: capture 624 outputs, reconstruct state → predict next outputs. `pwntools` has helpers.
* Example Python for mt19937 state recovery: use `numpy`/`random` or `pymt19937` libs.

---

## 9) Signature forgery / length extension / format flaws

* XML Signature wrapping or naive verification often exploited in advanced CTFs.
* If signature verification compares strings instead of verifying with key — trivial bypass.

---

## 10) Practical CTF walk-throughs (mini examples)

### A. Hash challenge — salted bcrypt

* Given bcrypt hash string `$2b$12$...`, use `hashcat -m 3200` or `john --format=bcrypt` with wordlist.

```bash
hashcat -m 3200 bcrypt_hash.txt rockyou.txt
```

### B. RSA small e = 3, ciphertext c, public n

* Try low-exponent attack:

```python
# python3 snippet (gmpy2 recommended)
from gmpy2 import iroot, mpz
c=mpz(int(cipher_hex,16))
m, ok = iroot(c,3)
if ok: print(bytes.fromhex(hex(int(m))[2:]))
```

### C. Padding Oracle (CBC) — block-by-block

* Use padding oracle script (many public PoC scripts). Approach: iterate last byte values until server indicates valid padding. Build plaintext.

### D. OTP reuse (two ciphertexts)

* `c1 ^ c2 = p1 ^ p2`. Use crib dragging with common words (`"flag"`, `"CTF"`, `"http"`).

---

## 11) Scripts & snippets (CTF staples)

### Length extension (hashpumpy)

```bash
pip install hashpumpy
# Example:
hashpumpy -s <orig_hash> -d "<orig_msg>" -a "<append>" -k <keylen>
```

### RSA common modulus gcd quick test (python)

```python
import math
def gcd(a,b): return math.gcd(a,b)
n1 = int(open('n1.txt').read().strip())
n2 = int(open('n2.txt').read().strip())
g = gcd(n1,n2)
if g!=1: print("shared prime:", g)
```

### Crib-dragger simple (XOR)

```python
c1 = bytes.fromhex(open('c1.hex').read().strip())
c2 = bytes.fromhex(open('c2.hex').read().strip())
x = bytes([a^b for a,b in zip(c1,c2)])
# try cribs
cribs = [b'flag', b'CTF', b'http']
for crib in cribs:
    for i in range(len(x)-len(crib)):
        segment = bytes([x[j]^crib[j-i] for j in range(i,i+len(crib))])
```

---

## 12) Strategy & heuristics in CTF crypto

* **Recognize patterns fast.** Many challenges reuse the same classes: RSA quirks, padding oracle, length extension, OTP reuse.
* **Automate trial transforms.** Use CyberChef or scripts to try base64/hex/rot/xor combos quickly.
* **Use tooling first, then custom script.** `RsaCtfTool`, `hashcat`, `hashpumpy`, `xortool` save huge time.
* **Check challenge metadata.** CTF description often hints (e.g., “legacy” → likely MD5/SHA1; “embedded” → maybe LFSR/PRNG).
* **Read outputs carefully.** Error messages, whitespace, line endings often leak useful info (nonce lengths, byte-order).

---

## 13) Resources to practice

* Crypto CTF rooms on **HackTheBox / TryHackMe**
* Crypto challenges on **cryptohack.org** and old CTF writeups (study patterns)
* Implement small exercises locally: RSA toy keys, MT19937 state recoveries, padding oracle labs.
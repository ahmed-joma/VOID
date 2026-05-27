# V0ID 🖤

> Hide anything inside anything. Zero server. Zero trace.

**[→ Live Demo](https://ahmed-joma.github.io/VOID)**

---

## What is VOID?

VOID is a browser-based steganography tool that lets you hide secret messages inside ordinary images — or encode them as unreadable text strings — using military-grade encryption.

No server. No logs. No trace. Everything runs in your browser.

---

## Features

| Feature | Description |
|---------|-------------|
| **AES-256-GCM** | Military-grade encryption before hiding |
| **LSB Steganography** | Message hidden in pixel bits — image looks identical |
| **VOID CODE Mode** | Encrypt to a text string when no image is available |
| **Decoy Messages** | Wrong password reveals a fake message |
| **Self-Destruct** | Revealed messages auto-wipe after 30 seconds |
| **Zero Server** | Everything runs in your browser via Web Crypto API |
| **Open Source** | Verify every line of code yourself |

---

## How It Works

### 1 — AES-256-GCM Encryption
Your message is encrypted using AES-256-GCM with a key derived from your password via PBKDF2 (100,000 iterations, random salt). Without the exact password, decryption is computationally impossible.

### 2 — LSB Steganography
The encrypted data is hidden in the **Least Significant Bit** of each pixel's RGB channels. Changing the last bit of a color value (e.g., `200 → 201`) is invisible to the human eye but perfectly encodes your data.

### 3 — Plausible Deniability
Set a **decoy message** shown when someone enters a wrong password. If you're ever forced to reveal a password, give the decoy one. They'll see an innocent message with no way to prove another exists.

---

## Usage

### Encode (Hide a Message)
1. Go to **ENCODE** tab
2. Choose **Image Mode** or **VOID CODE** mode
3. Upload a PNG image (Image Mode only)
4. Type your secret message
5. Set a strong password (+ optional decoy message)
6. Click **ENCRYPT & HIDE**
7. Download the encoded image or copy the VOID CODE
8. Send to the recipient

### Decode (Reveal a Message)
1. Go to **DECODE** tab
2. Upload the encoded image or paste the VOID CODE
3. Enter the password
4. Click **REVEAL MESSAGE**
5. Read the message — it auto-wipes in 30 seconds

---

## Operational Security

```
✓ Send encoded images via Telegram or email (no compression)
✗ Never use WhatsApp — it compresses images and destroys hidden data
✓ Share your password through a completely separate channel
✓ Use VOID CODE mode when you cannot send images
✓ The encoded image is indistinguishable from the original
```

---

## Technical Details

```
Encryption:    AES-256-GCM
Key Derivation: PBKDF2 — SHA-256 — 100,000 iterations — 16-byte random salt
IV:            12-byte random nonce per message
Steganography: LSB (1 bit per RGB channel)
Capacity:      ~1 bit per pixel (1MP image ≈ 125KB of hidden data)
Runtime:       100% client-side via Web Crypto API
Dependencies:  None
```

---

## Project Structure

```
VOID/
├── index.html        ← Main app shell
├── src/
│   ├── style.css     ← All styling
│   ├── crypto.js     ← AES-256-GCM encryption/decryption
│   ├── steg.js       ← LSB steganography engine
│   └── app.js        ← Application logic & UI
└── README.md
```

---

## Run Locally

```bash
git clone https://github.com/ahmed-joma/VOID.git
cd VOID
# Open index.html in any modern browser
# No build step. No dependencies. No server needed.
open index.html
```

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 90+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Edge 90+ | ✅ Full |

Requires Web Crypto API (available in all modern browsers).

---

## License

MIT — do whatever you want with it.

---

*Built with zero dependencies. Runs anywhere. Leaves nothing behind.*

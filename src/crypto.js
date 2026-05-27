/* VOID — crypto.js | AES-256-GCM via Web Crypto API */

const VoidCrypto = (() => {

  const enc = new TextEncoder();
  const dec = new TextDecoder();

  async function deriveKey(password, salt) {
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encrypt(plaintext, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await deriveKey(password, salt);
    const ct   = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
    const out  = new Uint8Array(16 + 12 + ct.byteLength);
    out.set(salt, 0);
    out.set(iv, 16);
    out.set(new Uint8Array(ct), 28);
    return btoa(String.fromCharCode(...out));
  }

  async function decrypt(b64, password) {
    const raw  = new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)));
    const salt = raw.slice(0, 16);
    const iv   = raw.slice(16, 28);
    const ct   = raw.slice(28);
    const key  = await deriveKey(password, salt);
    const pt   = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return dec.decode(pt);
  }

  /* Pack real + decoy into one payload:
     [1 byte: real_len_high][1 byte: real_len_low][real_bytes][decoy_bytes]
     Both slots always encrypted with separate keys so they look identical.
  */
  async function encryptWithDecoy(realMsg, password, decoyMsg) {
    const realEnc  = await encrypt(realMsg, password);
    const decoyEnc = decoyMsg
      ? await encrypt(decoyMsg, '__D3C0Y__' + password)
      : await encrypt('', '__D3C0Y__' + password);

    const payload = JSON.stringify({ r: realEnc, d: decoyEnc });
    return btoa(unescape(encodeURIComponent(payload)));
  }

  async function decryptWithDecoy(b64payload, password, isDecoy = false) {
    try {
      const payload = JSON.parse(decodeURIComponent(escape(atob(b64payload))));
      if (isDecoy) {
        return await decrypt(payload.d, '__D3C0Y__' + password);
      }
      return await decrypt(payload.r, password);
    } catch {
      /* fallback: plain encrypted (no decoy) */
      return await decrypt(b64payload, password);
    }
  }

  return { encrypt, decrypt, encryptWithDecoy, decryptWithDecoy };

})();

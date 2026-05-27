/* VOID — deaddrop.js | Dead Drop via public internet images */

const VoidDeadDrop = (() => {

  /* Curated list of stable, high-res PNG sources from public domains */
  const SOURCES = [
    {
      name: 'NASA',
      label: 'NASA Public Domain',
      urls: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/GoldenGateBridge-001.jpg/1280px-GoldenGateBridge-001.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/640px-Camponotus_flavomarginatus_ant.jpg',
      ]
    }
  ];

  /* Fetch a public image as ArrayBuffer via CORS proxy */
  async function fetchPublicImage(url) {
    /* Use a CORS proxy to bypass cross-origin restrictions */
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const resp = await fetch(proxyUrl);
    if (!resp.ok) throw new Error('Failed to fetch image');
    const blob = await resp.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /* Encode: hide message in a fetched public image, return DEAD DROP KEY */
  async function createDeadDrop(message, password, sourceImageUrl) {
    /* 1. Fetch the public image */
    const imageDataUrl = await fetchPublicImage(sourceImageUrl);

    /* 2. Encrypt message */
    const encrypted = await VoidCrypto.encryptWithDecoy(message, password, '');
    const payload = 'V01D://' + encrypted;

    /* 3. Hide in image */
    const encodedDataUrl = await VoidSteg.hide(imageDataUrl, payload);

    /* 4. Generate Dead Drop Key */
    const seed = Math.random().toString(36).substring(2, 8).toUpperCase();
    const key = {
      v: 1,
      src: sourceImageUrl,
      seed: seed,
      ts: Date.now()
    };
    const keyStr = 'VOID-DROP://' + btoa(JSON.stringify(key));

    return {
      encodedImage: encodedDataUrl,
      deadDropKey: keyStr,
      seed: seed,
      sourceUrl: sourceImageUrl
    };
  }

  /* Decode: given a DEAD DROP KEY + password, fetch and extract */
  async function readDeadDrop(deadDropKey, password, encodedImageDataUrl) {
    /* If user provides the encoded image directly, use it */
    if (encodedImageDataUrl) {
      const raw = await VoidSteg.extract(encodedImageDataUrl);
      const payload = raw.startsWith('V01D://') ? raw.slice(7) : raw;
      return await VoidCrypto.decryptWithDecoy(payload, password, false);
    }

    /* Otherwise parse key and fetch */
    if (!deadDropKey.startsWith('VOID-DROP://')) throw new Error('Invalid Dead Drop key');
    const keyData = JSON.parse(atob(deadDropKey.replace('VOID-DROP://', '')));
    const imageDataUrl = await fetchPublicImage(keyData.src);
    const raw = await VoidSteg.extract(imageDataUrl);
    const payload = raw.startsWith('V01D://') ? raw.slice(7) : raw;
    return await VoidCrypto.decryptWithDecoy(payload, password, false);
  }

  return { createDeadDrop, readDeadDrop, SOURCES };
})();

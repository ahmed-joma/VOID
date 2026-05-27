/* VOID — steg.js | LSB Steganography Engine */

const VoidSteg = (() => {

  /* Convert string → binary bit string */
  function strToBits(str) {
    const bytes = new TextEncoder().encode(str);
    const lenBytes = new Uint8Array(4);
    new DataView(lenBytes.buffer).setUint32(0, bytes.length, false);
    let bits = '';
    for (const b of lenBytes) for (let i = 7; i >= 0; i--) bits += (b >> i) & 1;
    for (const b of bytes)   for (let i = 7; i >= 0; i--) bits += (b >> i) & 1;
    return bits;
  }

  /* Extract bit string → original string */
  function bitsToStr(bits) {
    let len = 0;
    for (let i = 0; i < 32; i++) len = (len << 1) | parseInt(bits[i]);
    if (len <= 0 || len > 10_000_000) throw new Error('Invalid data');
    const msgBits = bits.slice(32, 32 + len * 8);
    if (msgBits.length < len * 8) throw new Error('Incomplete data');
    const bytes = [];
    for (let i = 0; i < len; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | parseInt(msgBits[i * 8 + j]);
      bytes.push(b);
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  }

  /* Max chars a PNG image can store */
  function capacity(width, height) {
    const totalBits = width * height * 3; /* R,G,B channels, 1 bit each */
    return Math.floor((totalBits - 32) / 8); /* minus 4-byte length header */
  }

  /* Hide message inside image → returns new PNG data URL */
  function hide(imageDataUrl, message) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels  = imgData.data; /* RGBA flat array */

        const bits = strToBits(message);
        const cap  = capacity(canvas.width, canvas.height);

        if (bits.length > cap * 8 + 32) {
          return reject(new Error(`Image too small. Max ~${cap} chars for this image.`));
        }

        /* Embed bits into R,G,B channels (skip Alpha) */
        let bitIdx = 0;
        for (let px = 0; px < pixels.length && bitIdx < bits.length; px++) {
          if ((px % 4) === 3) continue; /* skip alpha */
          pixels[px] = (pixels[px] & 0xFE) | parseInt(bits[bitIdx++]);
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageDataUrl;
    });
  }

  /* Extract hidden message from image */
  function extract(imageDataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        /* Read first 32 bits to get message length */
        let lenBits = '';
        let pixelIdx = 0;
        while (lenBits.length < 32 && pixelIdx < pixels.length) {
          if ((pixelIdx % 4) !== 3) lenBits += (pixels[pixelIdx] & 1).toString();
          pixelIdx++;
        }

        let msgLen = 0;
        for (let i = 0; i < 32; i++) msgLen = (msgLen << 1) | parseInt(lenBits[i]);

        if (msgLen <= 0 || msgLen > 10_000_000) {
          return reject(new Error('No VOID data found in this image.'));
        }

        /* Read message bits */
        let msgBits = '';
        const totalNeeded = msgLen * 8;
        while (msgBits.length < totalNeeded && pixelIdx < pixels.length) {
          if ((pixelIdx % 4) !== 3) msgBits += (pixels[pixelIdx] & 1).toString();
          pixelIdx++;
        }

        try {
          resolve(bitsToStr(lenBits + msgBits));
        } catch (e) {
          reject(new Error('No VOID data found in this image.'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageDataUrl;
    });
  }

  /* Get capacity info for a loaded image */
  function getCapacity(imageDataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({
        chars: capacity(img.naturalWidth, img.naturalHeight),
        width: img.naturalWidth,
        height: img.naturalHeight,
        pixels: img.naturalWidth * img.naturalHeight
      });
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageDataUrl;
    });
  }

  return { hide, extract, getCapacity, capacity };

})();

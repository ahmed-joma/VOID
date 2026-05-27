/* VOID — visualkey.js | Image-as-Password via perceptual hash */

const VoidVisualKey = (() => {

  /* Generate a deterministic 256-bit key from an image
     Uses average hash (aHash) + difference hash (dHash) combined */
  async function deriveKeyFromImage(imageDataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          /* Step 1: Render to small canvas for hash extraction */
          const SIZE = 32;
          const canvas = document.createElement('canvas');
          canvas.width = SIZE; canvas.height = SIZE;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, SIZE, SIZE);
          const pixels = ctx.getImageData(0, 0, SIZE, SIZE).data;

          /* Step 2: Convert to grayscale values */
          const gray = [];
          for (let i = 0; i < SIZE * SIZE; i++) {
            const r = pixels[i*4], g = pixels[i*4+1], b = pixels[i*4+2];
            gray.push(Math.round(0.299*r + 0.587*g + 0.114*b));
          }

          /* Step 3: aHash — compare each pixel to mean */
          const mean = gray.reduce((a,b) => a+b, 0) / gray.length;
          let aHashBits = gray.map(v => v >= mean ? 1 : 0);

          /* Step 4: dHash — compare adjacent pixels (8x8 grid) */
          const DSIZE = 9;
          const dCanvas = document.createElement('canvas');
          dCanvas.width = DSIZE; dCanvas.height = 8;
          const dCtx = dCanvas.getContext('2d');
          dCtx.drawImage(img, 0, 0, DSIZE, 8);
          const dPixels = dCtx.getImageData(0, 0, DSIZE, 8).data;
          const dGray = [];
          for (let i = 0; i < DSIZE * 8; i++) {
            dGray.push(Math.round(0.299*dPixels[i*4] + 0.587*dPixels[i*4+1] + 0.114*dPixels[i*4+2]));
          }
          let dHashBits = [];
          for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
              dHashBits.push(dGray[row*DSIZE+col] > dGray[row*DSIZE+col+1] ? 1 : 0);
            }
          }

          /* Step 5: Combine both hashes → 256-bit key material */
          const combined = [...aHashBits.slice(0,128), ...dHashBits.slice(0,64),
                            ...aHashBits.slice(128,192), ...dHashBits.slice(64,128)];

          /* Step 6: Pack bits into bytes → base64 key string */
          const keyBytes = new Uint8Array(32);
          for (let i = 0; i < 32; i++) {
            let byte = 0;
            for (let j = 0; j < 8; j++) byte = (byte << 1) | (combined[i*8+j] || 0);
            keyBytes[i] = byte;
          }

          const keyB64 = btoa(String.fromCharCode(...keyBytes));
          resolve(keyB64);
        } catch(e) {
          reject(new Error('Failed to process key image'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load key image'));
      img.src = imageDataUrl;
    });
  }

  /* Get a visual "fingerprint" preview of the key (8x8 colored grid) */
  function getKeyFingerprint(imageDataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 8;
        const canvas = document.createElement('canvas');
        canvas.width = SIZE; canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL());
      };
      img.src = imageDataUrl;
    });
  }

  return { deriveKeyFromImage, getKeyFingerprint };
})();

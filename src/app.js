/* VOID — app.js | Main Application Logic */

(() => {
  /* ── State ─────────────────────────────────── */
  let encImageData = null;
  let decImageData = null;
  let encMode = 'image';
  let decMode = 'image';
  let selfDestructTimer = null;

  /* ── Tab Navigation ─────────────────────────── */
  const tabs = document.querySelectorAll('.void-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.void-section').forEach(s => s.classList.remove('active'));
      document.getElementById('tab-' + target).classList.add('active');
    });
  });

  document.getElementById('startBtn').addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector('[data-tab="encode"]').classList.add('active');
    document.querySelectorAll('.void-section').forEach(s => s.classList.remove('active'));
    document.getElementById('tab-encode').classList.add('active');
  });

  /* ── Encode Mode Toggle ─────────────────────── */
  document.getElementById('encImgBtn').addEventListener('click', function() {
    encMode = 'image';
    document.getElementById('encImgBtn').classList.add('active');
    document.getElementById('encTxtBtn').classList.remove('active');
    document.getElementById('enc-image-mode').style.display = 'block';
    document.getElementById('enc-text-mode').style.display = 'none';
    document.getElementById('encOutput').style.display = 'none';
  });

  document.getElementById('encTxtBtn').addEventListener('click', function() {
    encMode = 'text';
    document.getElementById('encTxtBtn').classList.add('active');
    document.getElementById('encImgBtn').classList.remove('active');
    document.getElementById('enc-image-mode').style.display = 'none';
    document.getElementById('enc-text-mode').style.display = 'block';
    document.getElementById('encOutput').style.display = 'none';
  });

  /* ── Decode Mode Toggle ─────────────────────── */
  document.getElementById('decImgBtn').addEventListener('click', function() {
    decMode = 'image';
    document.getElementById('decImgBtn').classList.add('active');
    document.getElementById('decTxtBtn').classList.remove('active');
    document.getElementById('dec-image-mode').style.display = 'block';
    document.getElementById('dec-text-mode').style.display = 'none';
    document.getElementById('decOutput').style.display = 'none';
    document.getElementById('decError').style.display = 'none';
  });

  document.getElementById('decTxtBtn').addEventListener('click', function() {
    decMode = 'text';
    document.getElementById('decTxtBtn').classList.add('active');
    document.getElementById('decImgBtn').classList.remove('active');
    document.getElementById('dec-image-mode').style.display = 'none';
    document.getElementById('dec-text-mode').style.display = 'block';
    document.getElementById('decOutput').style.display = 'none';
    document.getElementById('decError').style.display = 'none';
  });

  /* ── Image Upload Helpers ───────────────────── */
  function setupDrop(dropZone, fileInput, onLoad) {
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) readFile(file, onLoad);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) readFile(fileInput.files[0], onLoad);
    });
  }

  function readFile(file, cb) {
    const reader = new FileReader();
    reader.onload = e => cb(e.target.result, file);
    reader.readAsDataURL(file);
  }

  /* Encode image */
  setupDrop(
    document.getElementById('encDropZone'),
    document.getElementById('encImageInput'),
    async (dataUrl, file) => {
      encImageData = dataUrl;
      const preview = document.getElementById('encPreview');
      document.getElementById('encPreviewImg').src = dataUrl;
      preview.classList.add('show');

      try {
        const cap = await VoidSteg.getCapacity(dataUrl);
        const bar = document.getElementById('encCapacity');
        bar.classList.add('show');
        document.getElementById('encCapFill').style.width = '0%';
        document.getElementById('encCapText').textContent = `Up to ~${cap.chars.toLocaleString()} characters — ${cap.width}×${cap.height}px`;
        document.getElementById('encImgInfo').textContent = `${cap.width}×${cap.height} · ${(file.size/1024).toFixed(0)}KB · ~${cap.chars.toLocaleString()} chars capacity`;

        /* Live capacity meter */
        document.getElementById('encMessage').addEventListener('input', function() {
          const used = this.value.length;
          const pct  = Math.min(100, (used / cap.chars) * 100);
          const fill = document.getElementById('encCapFill');
          fill.style.width = pct + '%';
          fill.classList.toggle('warn', pct > 80);
          document.getElementById('encCapText').textContent = `${used.toLocaleString()} / ~${cap.chars.toLocaleString()} chars`;
        });
      } catch(e) {}
    }
  );

  /* Decode image */
  setupDrop(
    document.getElementById('decDropZone'),
    document.getElementById('decImageInput'),
    (dataUrl) => {
      decImageData = dataUrl;
      const preview = document.getElementById('decPreview');
      document.getElementById('decPreviewImg').src = dataUrl;
      preview.classList.add('show');
    }
  );

  /* ── ENCODE ─────────────────────────────────── */
  document.getElementById('encodeBtn').addEventListener('click', async () => {
    const message  = document.getElementById('encMessage').value.trim();
    const password = document.getElementById('encPassword').value.trim();
    const decoy    = document.getElementById('encDecoy').value.trim();

    if (!message)  return showEncError('Write a message first.');
    if (!password) return showEncError('Set a password.');
    if (encMode === 'image' && !encImageData) return showEncError('Select a PNG image first.');

    const btn = document.getElementById('encodeBtn');
    btn.textContent = 'ENCRYPTING...';
    btn.disabled = true;

    try {
      const payload = await VoidCrypto.encryptWithDecoy(message, password, decoy);

      if (encMode === 'image') {
        const result = await VoidSteg.hide(encImageData, 'V01D://' + payload);
        showEncImageResult(result);
      } else {
        showEncCodeResult('V01D://' + payload);
      }
    } catch(e) {
      showEncError(e.message || 'Encryption failed.');
    }

    btn.textContent = 'ENCRYPT & HIDE';
    btn.disabled = false;
  });

  function showEncImageResult(dataUrl) {
    const out = document.getElementById('encOutput');
    document.getElementById('encOutputHeader').textContent = 'ENCODED IMAGE — DOWNLOAD & SEND';
    document.getElementById('encResult').innerHTML = `
      <img src="${dataUrl}" style="width:100%;max-height:200px;object-fit:cover;display:block;margin-bottom:0.75rem;filter:brightness(0.7)">
      <a href="${dataUrl}" download="void_${Date.now()}.png" class="void-dl-btn">↓ DOWNLOAD ENCODED IMAGE</a>
      <div style="font-size:10px;color:#333;margin-top:0.75rem;letter-spacing:0.08em;line-height:1.8;">
        Send via Telegram or email attachment only.<br>
        WhatsApp compresses images and destroys the hidden data.
      </div>
    `;
    out.style.display = 'block';
  }

  function showEncCodeResult(code) {
    const out = document.getElementById('encOutput');
    document.getElementById('encOutputHeader').textContent = 'VOID CODE — COPY & SEND';
    document.getElementById('encResult').innerHTML = `
      <div class="void-code-output" id="voidCodeText">${code}</div>
      <button class="void-copy-btn" onclick="copyVoidCode()">COPY CODE</button>
      <div style="font-size:10px;color:#333;margin-top:0.75rem;letter-spacing:0.08em;line-height:1.8;">
        Send as plain text anywhere.<br>
        Looks like random noise to anyone without the password.
      </div>
    `;
    out.style.display = 'block';
  }

  function showEncError(msg) {
    const out = document.getElementById('encOutput');
    document.getElementById('encOutputHeader').textContent = 'ERROR';
    document.getElementById('encResult').innerHTML = `<div style="color:#e24b4a;font-size:12px;">${msg}</div>`;
    out.style.display = 'block';
  }

  window.copyVoidCode = function() {
    const code = document.getElementById('voidCodeText').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.querySelector('.void-copy-btn');
      btn.textContent = 'COPIED ✓';
      setTimeout(() => btn.textContent = 'COPY CODE', 2500);
    });
  };

  /* ── DECODE ─────────────────────────────────── */
  document.getElementById('decodeBtn').addEventListener('click', async () => {
    const password = document.getElementById('decPassword').value.trim();
    if (!password) return showDecError('Enter the password.');

    const btn = document.getElementById('decodeBtn');
    btn.textContent = 'EXTRACTING...';
    btn.disabled = true;

    document.getElementById('decOutput').style.display = 'none';
    document.getElementById('decError').style.display = 'none';

    try {
      let payload = '';

      if (decMode === 'image') {
        if (!decImageData) { btn.textContent = 'REVEAL MESSAGE'; btn.disabled = false; return showDecError('Load an encoded image first.'); }
        const raw = await VoidSteg.extract(decImageData);
        payload = raw.startsWith('V01D://') ? raw.slice(7) : raw;
      } else {
        let code = document.getElementById('decVoidCode').value.trim();
        payload = code.startsWith('V01D://') ? code.slice(7) : code;
        if (!payload) { btn.textContent = 'REVEAL MESSAGE'; btn.disabled = false; return showDecError('Paste a VOID CODE first.'); }
      }

      let message;
      try {
        message = await VoidCrypto.decryptWithDecoy(payload, password, false);
      } catch {
        /* Wrong password — try decoy slot */
        try {
          message = await VoidCrypto.decryptWithDecoy(payload, password, true);
          if (!message) throw new Error();
        } catch {
          throw new Error('Wrong password or corrupted data.');
        }
      }

      showDecResult(message);
    } catch(e) {
      showDecError(e.message || 'Decryption failed.');
    }

    btn.textContent = 'REVEAL MESSAGE';
    btn.disabled = false;
  });

  function showDecResult(message) {
    if (selfDestructTimer) clearInterval(selfDestructTimer);

    const out    = document.getElementById('decOutput');
    const result = document.getElementById('decResult');
    const timer  = document.getElementById('selfDestruct');

    result.textContent = message;
    out.style.display = 'block';

    let countdown = 30;
    timer.textContent = `SELF-DESTRUCT IN ${countdown}s`;

    selfDestructTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(selfDestructTimer);
        result.textContent = '';
        result.style.color = '#222';
        timer.textContent = '[ MESSAGE DESTROYED — VOID ]';
        timer.style.color = '#333';
      } else {
        timer.textContent = `SELF-DESTRUCT IN ${countdown}s`;
      }
    }, 1000);
  }

  function showDecError(msg) {
    const err = document.getElementById('decError');
    err.textContent = '✕ ' + msg;
    err.style.display = 'block';
  }

})();

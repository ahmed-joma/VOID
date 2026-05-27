/* VOID — app.js */
(() => {
  let encImageData = null;
  let decImageData = null;
  let encMode = 'image';
  let decMode = 'image';
  let selfDestructTimer = null;

  /* ── Language Setup ─────────────────────────── */
  function buildLangSwitcher() {
    const container = document.getElementById('langSwitcher');
    VoidI18n.getLangs().forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'void-lang-btn' + (lang === VoidI18n.getCurrent() ? ' active' : '');
      btn.textContent = VoidI18n.getLangFlag(lang);
      btn.dataset.lang = lang;
      btn.addEventListener('click', () => applyLang(lang));
      container.appendChild(btn);
    });
  }

  function buildFeatures() {
    const grid = document.getElementById('featuresGrid');
    const features = VoidI18n.langs[VoidI18n.getCurrent()].features;
    grid.innerHTML = features.map(f => `
      <div class="void-feature">
        <div class="void-feature-icon">◎</div>
        <div class="void-feature-title">${f.title}</div>
        <div class="void-feature-desc">${f.desc}</div>
      </div>
    `).join('');
  }

  function buildAboutBlocks() {
    const container = document.getElementById('aboutBlocks');
    const blocks = VoidI18n.langs[VoidI18n.getCurrent()].about.blocks;
    container.innerHTML = blocks.map(b => `
      <div class="void-about-block">
        <div class="void-about-num">${b.num}</div>
        <div>
          <div class="void-about-heading">${b.heading}</div>
          <div class="void-about-text">${b.text}</div>
        </div>
      </div>
    `).join('');
  }

  function applyPlaceholders() {
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = VoidI18n.get(el.dataset.i18nPh);
    });
  }

  function applyLang(lang) {
    VoidI18n.setLang(lang);
    buildFeatures();
    buildAboutBlocks();
    applyPlaceholders();
    localStorage.setItem('void-lang', lang);
  }

  /* ── Tab Navigation ─────────────────────────── */
  document.querySelectorAll('.void-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.void-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.void-section').forEach(s => s.classList.remove('active'));
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  document.getElementById('startBtn').addEventListener('click', () => {
    document.querySelector('[data-tab="encode"]').click();
  });

  /* ── Mode Toggles ───────────────────────────── */
  document.getElementById('encImgBtn').addEventListener('click', () => {
    encMode = 'image';
    document.getElementById('encImgBtn').classList.add('active');
    document.getElementById('encTxtBtn').classList.remove('active');
    document.getElementById('enc-image-mode').style.display = 'block';
    document.getElementById('enc-text-mode').style.display = 'none';
    document.getElementById('encOutput').style.display = 'none';
  });
  document.getElementById('encTxtBtn').addEventListener('click', () => {
    encMode = 'text';
    document.getElementById('encTxtBtn').classList.add('active');
    document.getElementById('encImgBtn').classList.remove('active');
    document.getElementById('enc-image-mode').style.display = 'none';
    document.getElementById('enc-text-mode').style.display = 'block';
    document.getElementById('encOutput').style.display = 'none';
  });
  document.getElementById('decImgBtn').addEventListener('click', () => {
    decMode = 'image';
    document.getElementById('decImgBtn').classList.add('active');
    document.getElementById('decTxtBtn').classList.remove('active');
    document.getElementById('dec-image-mode').style.display = 'block';
    document.getElementById('dec-text-mode').style.display = 'none';
    document.getElementById('decOutput').style.display = 'none';
    document.getElementById('decError').style.display = 'none';
  });
  document.getElementById('decTxtBtn').addEventListener('click', () => {
    decMode = 'text';
    document.getElementById('decTxtBtn').classList.add('active');
    document.getElementById('decImgBtn').classList.remove('active');
    document.getElementById('dec-image-mode').style.display = 'none';
    document.getElementById('dec-text-mode').style.display = 'block';
    document.getElementById('decOutput').style.display = 'none';
    document.getElementById('decError').style.display = 'none';
  });

  /* ── Drop Zones ─────────────────────────────── */
  function setupDrop(dropZone, fileInput, onLoad) {
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault(); dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) readFile(file, onLoad);
    });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) readFile(fileInput.files[0], onLoad); });
  }

  function readFile(file, cb) {
    const r = new FileReader();
    r.onload = e => cb(e.target.result, file);
    r.readAsDataURL(file);
  }

  setupDrop(
    document.getElementById('encDropZone'),
    document.getElementById('encImageInput'),
    async (dataUrl, file) => {
      encImageData = dataUrl;
      document.getElementById('encPreviewImg').src = dataUrl;
      document.getElementById('encPreview').classList.add('show');
      try {
        const cap = await VoidSteg.getCapacity(dataUrl);
        const bar = document.getElementById('encCapacity');
        bar.style.display = 'block';
        document.getElementById('encCapFill').style.width = '0%';
        document.getElementById('encCapText').textContent = `~${cap.chars.toLocaleString()} chars — ${cap.width}×${cap.height}px`;
        document.getElementById('encImgInfo').textContent = `${cap.width}×${cap.height} · ${(file.size/1024).toFixed(0)}KB · ~${cap.chars.toLocaleString()} chars`;
        document.getElementById('encMessage').addEventListener('input', function() {
          const pct = Math.min(100, (this.value.length / cap.chars) * 100);
          const fill = document.getElementById('encCapFill');
          fill.style.width = pct + '%';
          fill.classList.toggle('warn', pct > 80);
          document.getElementById('encCapText').textContent = `${this.value.length.toLocaleString()} / ~${cap.chars.toLocaleString()} chars`;
        });
      } catch(e) {}
    }
  );

  setupDrop(
    document.getElementById('decDropZone'),
    document.getElementById('decImageInput'),
    (dataUrl) => {
      decImageData = dataUrl;
      document.getElementById('decPreviewImg').src = dataUrl;
      document.getElementById('decPreview').classList.add('show');
    }
  );

  /* ── ENCODE ─────────────────────────────────── */
  document.getElementById('encodeBtn').addEventListener('click', async () => {
    const t = VoidI18n.get.bind(VoidI18n);
    const message  = document.getElementById('encMessage').value.trim();
    const password = document.getElementById('encPassword').value.trim();
    const decoy    = document.getElementById('encDecoy').value.trim();

    if (!message)  return showEncError(t('encode.errMsg'));
    if (!password) return showEncError(t('encode.errPass'));
    if (encMode === 'image' && !encImageData) return showEncError(t('encode.errImg'));

    const btn = document.getElementById('encodeBtn');
    btn.textContent = t('encode.btnWorking');
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
      showEncError(e.message || t('encode.errFailed'));
    }

    btn.textContent = t('encode.btn');
    btn.disabled = false;
  });

  function showEncImageResult(dataUrl) {
    const t = VoidI18n.get.bind(VoidI18n);
    const out = document.getElementById('encOutput');
    document.getElementById('encOutputHeader').textContent = t('encode.outputImg');
    document.getElementById('encResult').innerHTML = `
      <img src="${dataUrl}" style="width:100%;max-height:200px;object-fit:cover;display:block;margin-bottom:0.75rem;filter:brightness(0.7)">
      <a href="${dataUrl}" download="void_${Date.now()}.png" class="void-dl-btn">${t('encode.dlBtn')}</a>
      <div style="font-size:11px;color:#444;margin-top:0.75rem;letter-spacing:0.08em;line-height:1.9;">${t('encode.sendHint')}</div>
    `;
    out.style.display = 'block';
  }

  function showEncCodeResult(code) {
    const t = VoidI18n.get.bind(VoidI18n);
    const out = document.getElementById('encOutput');
    document.getElementById('encOutputHeader').textContent = t('encode.outputCode');
    document.getElementById('encResult').innerHTML = `
      <div class="void-code-output" id="voidCodeText">${code}</div>
      <button class="void-copy-btn" onclick="copyVoidCode()">${t('encode.copyBtn')}</button>
      <div style="font-size:11px;color:#444;margin-top:0.75rem;letter-spacing:0.08em;line-height:1.9;">${t('encode.codeHint')}</div>
    `;
    out.style.display = 'block';
  }

  function showEncError(msg) {
    const out = document.getElementById('encOutput');
    document.getElementById('encOutputHeader').textContent = 'ERROR';
    document.getElementById('encResult').innerHTML = `<div style="color:#e24b4a;font-size:13px;font-weight:700;">${msg}</div>`;
    out.style.display = 'block';
  }

  window.copyVoidCode = function() {
    const code = document.getElementById('voidCodeText').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.querySelector('.void-copy-btn');
      btn.textContent = VoidI18n.get('encode.copied');
      setTimeout(() => btn.textContent = VoidI18n.get('encode.copyBtn'), 2500);
    });
  };

  /* ── DECODE ─────────────────────────────────── */
  document.getElementById('decodeBtn').addEventListener('click', async () => {
    const t = VoidI18n.get.bind(VoidI18n);
    const password = document.getElementById('decPassword').value.trim();
    if (!password) return showDecError(t('decode.errPass'));

    const btn = document.getElementById('decodeBtn');
    btn.textContent = t('decode.btnWorking');
    btn.disabled = true;
    document.getElementById('decOutput').style.display = 'none';
    document.getElementById('decError').style.display = 'none';

    try {
      let payload = '';
      if (decMode === 'image') {
        if (!decImageData) { btn.textContent = t('decode.btn'); btn.disabled = false; return showDecError(t('decode.errImg')); }
        const raw = await VoidSteg.extract(decImageData);
        payload = raw.startsWith('V01D://') ? raw.slice(7) : raw;
      } else {
        let code = document.getElementById('decVoidCode').value.trim();
        payload = code.startsWith('V01D://') ? code.slice(7) : code;
        if (!payload) { btn.textContent = t('decode.btn'); btn.disabled = false; return showDecError(t('decode.errCode')); }
      }

      let message;
      try {
        message = await VoidCrypto.decryptWithDecoy(payload, password, false);
      } catch {
        try {
          message = await VoidCrypto.decryptWithDecoy(payload, password, true);
          if (!message) throw new Error();
        } catch {
          throw new Error(t('decode.errWrong'));
        }
      }

      showDecResult(message);
    } catch(e) {
      showDecError(e.message || t('decode.errFailed'));
    }

    btn.textContent = t('decode.btn');
    btn.disabled = false;
  });

  function showDecResult(message) {
    const t = VoidI18n.get.bind(VoidI18n);
    if (selfDestructTimer) clearInterval(selfDestructTimer);
    const out    = document.getElementById('decOutput');
    const result = document.getElementById('decResult');
    const timer  = document.getElementById('selfDestruct');
    result.textContent = message;
    result.style.color = '';
    out.style.display = 'block';
    let countdown = 30;
    timer.textContent = `${t('decode.selfDestruct')} ${countdown}s`;
    selfDestructTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(selfDestructTimer);
        result.textContent = '';
        result.style.color = '#1a1a1a';
        timer.textContent = t('decode.destroyed');
        timer.style.color = '#222';
      } else {
        timer.textContent = `${t('decode.selfDestruct')} ${countdown}s`;
      }
    }, 1000);
  }

  function showDecError(msg) {
    const err = document.getElementById('decError');
    err.textContent = '✕ ' + msg;
    err.style.display = 'block';
  }

  /* ── Init ───────────────────────────────────── */
  const savedLang = localStorage.getItem('void-lang') || 'en';
  VoidI18n.setLang(savedLang);
  buildLangSwitcher();
  buildFeatures();
  buildAboutBlocks();
  applyPlaceholders();

})();

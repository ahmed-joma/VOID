/* VOID — app.js */
(() => {
  let encImageData = null;
  let decImageData = null;
  let encMode = 'image';
  let decMode = 'image';
  let selfDestructTimer = null;

  /* ── i18n & Lang ── */
  function buildLangSwitcher() {
    const c = document.getElementById('langSwitcher');
    VoidI18n.getLangs().forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'void-lang-btn' + (lang === VoidI18n.getCurrent() ? ' active' : '');
      btn.textContent = VoidI18n.getLangFlag(lang);
      btn.dataset.lang = lang;
      btn.addEventListener('click', () => applyLang(lang));
      c.appendChild(btn);
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
      </div>`).join('');
  }

  function buildAboutBlocks() {
    const c = document.getElementById('aboutBlocks');
    c.innerHTML = VoidI18n.langs[VoidI18n.getCurrent()].about.blocks.map(b => `
      <div class="void-about-block">
        <div class="void-about-num">${b.num}</div>
        <div>
          <div class="void-about-heading">${b.heading}</div>
          <div class="void-about-text">${b.text}</div>
        </div>
      </div>`).join('');
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

  /* ── Tabs ── */
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

  /* ── Mode Toggles ── */
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

  /* ════════════════════════════════════
     IMAGE PICKER — المنطق الإبداعي
     ════════════════════════════════════ */

  function loadEncImage(dataUrl, file) {
    encImageData = dataUrl;

    /* إخفاء منطقة الإفلات وإظهار الصورة */
    document.getElementById('encDropZone').style.display = 'none';
    const loaded = document.getElementById('encImgLoaded');
    loaded.classList.add('show');
    document.getElementById('encLoadedImg').src = dataUrl;
    document.getElementById('encLoadedName').textContent = file.name;

    VoidSteg.getCapacity(dataUrl).then(cap => {
      document.getElementById('encLoadedMeta').textContent =
        `${cap.width}×${cap.height} · ${(file.size/1024).toFixed(0)}KB · ~${cap.chars.toLocaleString()} chars`;

      /* شريط السعة */
      const bar = document.getElementById('encCapacity');
      bar.style.display = 'block';
      document.getElementById('encCapFill').style.width = '0%';
      document.getElementById('encCapText').textContent = `~${cap.chars.toLocaleString()} chars available`;

      document.getElementById('encMessage').addEventListener('input', function() {
        const pct = Math.min(100, (this.value.length / cap.chars) * 100);
        const fill = document.getElementById('encCapFill');
        fill.style.width = pct + '%';
        fill.classList.toggle('warn', pct > 80);
        document.getElementById('encCapText').textContent =
          `${this.value.length.toLocaleString()} / ~${cap.chars.toLocaleString()} chars`;
      });
    }).catch(() => {});
  }

  function clearEncImage() {
    encImageData = null;
    document.getElementById('encDropZone').style.display = 'block';
    const loaded = document.getElementById('encImgLoaded');
    loaded.classList.remove('show');
    document.getElementById('encLoadedImg').src = '';
    document.getElementById('encLoadedMeta').textContent = '';
    document.getElementById('encLoadedName').textContent = '';
    document.getElementById('encCapacity').style.display = 'none';
    document.getElementById('encCapFill').style.width = '0%';
    document.getElementById('encImageInput').value = '';
    document.getElementById('encOutput').style.display = 'none';
  }

  /* Drop zone الرئيسية */
  const encDropZone = document.getElementById('encDropZone');
  const encImageInput = document.getElementById('encImageInput');

  encDropZone.addEventListener('dragover', e => { e.preventDefault(); encDropZone.classList.add('drag-over'); });
  encDropZone.addEventListener('dragleave', () => encDropZone.classList.remove('drag-over'));
  encDropZone.addEventListener('drop', e => {
    e.preventDefault(); encDropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) readFile(file, loadEncImage);
  });
  encImageInput.addEventListener('change', () => {
    if (encImageInput.files[0]) readFile(encImageInput.files[0], loadEncImage);
  });

  /* زر الحذف */
  document.getElementById('encDeleteBtn').addEventListener('click', () => {
    clearEncImage();
  });

  /* زر الاستبدال */
  const encReplaceInput = document.getElementById('encReplaceInput');
  document.getElementById('encReplaceBtn').addEventListener('click', () => {
    encReplaceInput.click();
  });
  encReplaceInput.addEventListener('change', () => {
    if (encReplaceInput.files[0]) {
      clearEncImage();
      readFile(encReplaceInput.files[0], loadEncImage);
      encReplaceInput.value = '';
    }
  });

  /* Decode drop zone */
  const decDropZone = document.getElementById('decDropZone');
  const decImageInput = document.getElementById('decImageInput');
  decDropZone.addEventListener('dragover', e => { e.preventDefault(); decDropZone.classList.add('drag-over'); });
  decDropZone.addEventListener('dragleave', () => decDropZone.classList.remove('drag-over'));
  decDropZone.addEventListener('drop', e => {
    e.preventDefault(); decDropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) readFile(file, (url, f) => {
      decImageData = url;
      document.getElementById('decPreviewImg').src = url;
      document.getElementById('decPreview').classList.add('show');
      document.getElementById('decImgInfo').textContent = f.name;
    });
  });
  decImageInput.addEventListener('change', () => {
    if (decImageInput.files[0]) readFile(decImageInput.files[0], (url, f) => {
      decImageData = url;
      document.getElementById('decPreviewImg').src = url;
      document.getElementById('decPreview').classList.add('show');
      document.getElementById('decImgInfo').textContent = f.name;
    });
  });

  function readFile(file, cb) {
    const r = new FileReader();
    r.onload = e => cb(e.target.result, file);
    r.readAsDataURL(file);
  }

  /* ── ENCODE ── */
  document.getElementById('encodeBtn').addEventListener('click', async () => {
    const t = k => VoidI18n.get(k);
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
    } catch(e) { showEncError(e.message || t('encode.errFailed')); }

    btn.textContent = t('encode.btn');
    btn.disabled = false;
  });

  function showEncImageResult(dataUrl) {
    const t = k => VoidI18n.get(k);
    document.getElementById('encOutputHeader').textContent = t('encode.outputImg');
    document.getElementById('encResult').innerHTML = `
      <img src="${dataUrl}" style="width:100%;max-height:200px;object-fit:cover;display:block;margin-bottom:0.75rem;filter:brightness(0.65)">
      <a href="${dataUrl}" download="void_${Date.now()}.png" class="void-dl-btn">${t('encode.dlBtn')}</a>
      <div style="font-size:12px;font-weight:700;color:#444;margin-top:0.75rem;letter-spacing:0.08em;line-height:1.9;">${t('encode.sendHint')}</div>`;
    document.getElementById('encOutput').style.display = 'block';
  }

  function showEncCodeResult(code) {
    const t = k => VoidI18n.get(k);
    document.getElementById('encOutputHeader').textContent = t('encode.outputCode');
    document.getElementById('encResult').innerHTML = `
      <div class="void-code-output" id="voidCodeText">${code}</div>
      <button class="void-copy-btn" onclick="copyVoidCode()">${t('encode.copyBtn')}</button>
      <div style="font-size:12px;font-weight:700;color:#444;margin-top:0.75rem;letter-spacing:0.08em;line-height:1.9;">${t('encode.codeHint')}</div>`;
    document.getElementById('encOutput').style.display = 'block';
  }

  function showEncError(msg) {
    document.getElementById('encOutputHeader').textContent = 'ERROR';
    document.getElementById('encResult').innerHTML = `<div style="color:#e24b4a;font-size:13px;font-weight:900;">${msg}</div>`;
    document.getElementById('encOutput').style.display = 'block';
  }

  window.copyVoidCode = function() {
    navigator.clipboard.writeText(document.getElementById('voidCodeText').textContent).then(() => {
      const btn = document.querySelector('.void-copy-btn');
      btn.textContent = VoidI18n.get('encode.copied');
      setTimeout(() => btn.textContent = VoidI18n.get('encode.copyBtn'), 2500);
    });
  };

  /* ── DECODE ── */
  document.getElementById('decodeBtn').addEventListener('click', async () => {
    const t = k => VoidI18n.get(k);
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
        } catch { throw new Error(t('decode.errWrong')); }
      }

      showDecResult(message);
    } catch(e) { showDecError(e.message || t('decode.errFailed')); }

    btn.textContent = t('decode.btn');
    btn.disabled = false;
  });

  function showDecResult(msg) {
    const t = k => VoidI18n.get(k);
    if (selfDestructTimer) clearInterval(selfDestructTimer);
    const result = document.getElementById('decResult');
    const timer  = document.getElementById('selfDestruct');
    result.textContent = msg;
    result.style.color = '';
    document.getElementById('decOutput').style.display = 'block';
    let countdown = 30;
    timer.textContent = `${t('decode.selfDestruct')} ${countdown}s`;
    selfDestructTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(selfDestructTimer);
        result.textContent = '';
        result.style.color = '#111';
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

  /* ── Init ── */
  const savedLang = localStorage.getItem('void-lang') || 'en';
  VoidI18n.setLang(savedLang);
  buildLangSwitcher();
  buildFeatures();
  buildAboutBlocks();
  applyPlaceholders();

})();

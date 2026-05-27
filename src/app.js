/* VOID — app.js | Complete Application Logic */
(() => {
  let encImageData = null, decImageData = null;
  let encMode = 'image', decMode = 'image';
  let audioFile = null, audioDecFile = null;
  let vkKeyData = null, vkCarrierData = null;
  let vkDecKeyData = null, vkDecImgData = null;
  let ddReadImageData = null;
  let selfDestructTimers = {};

  /* ── Helpers ── */
  function readFile(file, cb) {
    const r = new FileReader(); r.onload = e => cb(e.target.result, file); r.readAsDataURL(file);
  }
  function selfDestruct(resultEl, timerEl, key) {
    if (selfDestructTimers[key]) clearInterval(selfDestructTimers[key]);
    let c = 30;
    timerEl.textContent = `SELF-DESTRUCT IN ${c}s`;
    selfDestructTimers[key] = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(selfDestructTimers[key]);
        resultEl.textContent = ''; resultEl.style.color = '#111';
        timerEl.textContent = '[ MESSAGE DESTROYED — VOID ]'; timerEl.style.color = '#222';
      } else { timerEl.textContent = `SELF-DESTRUCT IN ${c}s`; }
    }, 1000);
  }
  function showError(el, msg) { el.textContent = '✕ ' + msg; el.style.display = 'block'; }
  function hideError(el) { el.style.display = 'none'; }

  /* ── Lang & i18n ── */
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
    grid.innerHTML = features.map(f => `<div class="void-feature"><div class="void-feature-icon">◎</div><div class="void-feature-title">${f.title}</div><div class="void-feature-desc">${f.desc}</div></div>`).join('');
  }
  function buildAboutBlocks() {
    const c = document.getElementById('aboutBlocks');
    c.innerHTML = VoidI18n.langs[VoidI18n.getCurrent()].about.blocks.map(b => `
      <div class="void-about-block"><div class="void-about-num">${b.num}</div><div><div class="void-about-heading">${b.heading}</div><div class="void-about-text">${b.text}</div></div></div>`).join('');
  }
  function applyLang(lang) {
    VoidI18n.setLang(lang); buildFeatures(); buildAboutBlocks();
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
  document.getElementById('startBtn').addEventListener('click', () => document.querySelector('[data-tab="encode"]').click());

  /* ── Image Picker Helper ── */
  function setupImagePicker(dropZoneId, inputId, loadedId, imgId, metaId, nameId, replBtnId, replInputId, delBtnId, onLoad, onClear) {
    const dropZone = document.getElementById(dropZoneId);
    const input = document.getElementById(inputId);
    const loaded = document.getElementById(loadedId);

    function load(file) {
      readFile(file, (url, f) => {
        if (dropZone) dropZone.style.display = 'none';
        loaded.classList.add('show');
        document.getElementById(imgId).src = url;
        if (nameId) document.getElementById(nameId).textContent = f.name;
        onLoad(url, f);
      });
    }

    if (dropZone) {
      dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
      dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); if(e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });
    }
    input.addEventListener('change', () => { if(input.files[0]) load(input.files[0]); });

    if (delBtnId) {
      document.getElementById(delBtnId).addEventListener('click', () => {
        if (dropZone) dropZone.style.display = 'block';
        loaded.classList.remove('show');
        document.getElementById(imgId).src = '';
        input.value = '';
        if (onClear) onClear();
      });
    }
    if (replBtnId && replInputId) {
      const ri = document.getElementById(replInputId);
      document.getElementById(replBtnId).addEventListener('click', () => ri.click());
      ri.addEventListener('change', () => {
        if (ri.files[0]) { if(onClear) onClear(); load(ri.files[0]); ri.value=''; }
      });
    }
  }

  /* ════ ENCODE ════ */
  document.getElementById('encImgBtn').addEventListener('click', () => {
    encMode='image'; document.getElementById('encImgBtn').classList.add('active'); document.getElementById('encTxtBtn').classList.remove('active');
    document.getElementById('enc-image-mode').style.display='block'; document.getElementById('enc-text-mode').style.display='none';
    document.getElementById('encOutput').style.display='none';
  });
  document.getElementById('encTxtBtn').addEventListener('click', () => {
    encMode='text'; document.getElementById('encTxtBtn').classList.add('active'); document.getElementById('encImgBtn').classList.remove('active');
    document.getElementById('enc-image-mode').style.display='none'; document.getElementById('enc-text-mode').style.display='block';
    document.getElementById('encOutput').style.display='none';
  });

  setupImagePicker('encDropZone','encImageInput','encImgLoaded','encLoadedImg','encLoadedMeta','encLoadedName','encReplaceBtn','encReplaceInput','encDeleteBtn',
    (url, file) => {
      encImageData = url;
      VoidSteg.getCapacity(url).then(cap => {
        document.getElementById('encLoadedMeta').textContent = `${cap.width}×${cap.height} · ${(file.size/1024).toFixed(0)}KB · ~${cap.chars.toLocaleString()} chars`;
        const bar = document.getElementById('encCapacity'); bar.style.display='block';
        document.getElementById('encCapText').textContent = `~${cap.chars.toLocaleString()} chars available`;
        document.getElementById('encMessage').addEventListener('input', function() {
          const pct = Math.min(100,(this.value.length/cap.chars)*100);
          const fill = document.getElementById('encCapFill'); fill.style.width=pct+'%'; fill.classList.toggle('warn',pct>80);
          document.getElementById('encCapText').textContent = `${this.value.length.toLocaleString()} / ~${cap.chars.toLocaleString()} chars`;
        });
      }).catch(()=>{});
    },
    () => { encImageData=null; document.getElementById('encCapacity').style.display='none'; }
  );

  document.getElementById('encodeBtn').addEventListener('click', async () => {
    const msg=document.getElementById('encMessage').value.trim(), pw=document.getElementById('encPassword').value.trim(), decoy=document.getElementById('encDecoy').value.trim();
    if(!msg) return showEncErr('Write a message first.');
    if(!pw) return showEncErr('Set a password.');
    if(encMode==='image'&&!encImageData) return showEncErr('Select a PNG image first.');
    const btn=document.getElementById('encodeBtn'); btn.textContent='ENCRYPTING...'; btn.disabled=true;
    try {
      const payload = await VoidCrypto.encryptWithDecoy(msg,pw,decoy);
      if(encMode==='image') { const r=await VoidSteg.hide(encImageData,'V01D://'+payload); showEncImgResult(r); }
      else showEncCodeResult('V01D://'+payload);
    } catch(e) { showEncErr(e.message||'Encryption failed.'); }
    btn.textContent='ENCRYPT & HIDE'; btn.disabled=false;
  });
  function showEncErr(m){document.getElementById('encOutputHeader').textContent='ERROR';document.getElementById('encResult').innerHTML=`<div style="color:#e24b4a;font-weight:900;">${m}</div>`;document.getElementById('encOutput').style.display='block';}
  function showEncImgResult(url){document.getElementById('encOutputHeader').textContent='ENCODED IMAGE — DOWNLOAD & SEND';document.getElementById('encResult').innerHTML=`<img src="${url}" style="width:100%;max-height:180px;object-fit:cover;display:block;margin-bottom:.75rem;filter:brightness(.65)"><a href="${url}" download="void_${Date.now()}.png" class="void-dl-btn">↓ DOWNLOAD ENCODED IMAGE</a><div style="font-size:12px;font-weight:700;color:#444;margin-top:.75rem;line-height:1.9;">Send via Telegram or email. Never WhatsApp.</div>`;document.getElementById('encOutput').style.display='block';}
  function showEncCodeResult(code){document.getElementById('encOutputHeader').textContent='VOID CODE — COPY & SEND';document.getElementById('encResult').innerHTML=`<div class="void-code-output" id="voidCodeText">${code}</div><button class="void-copy-btn" onclick="copyCode('voidCodeText','encCopyBtn')" id="encCopyBtn">COPY CODE</button>`;document.getElementById('encOutput').style.display='block';}
  window.copyCode=function(id,btnId){navigator.clipboard.writeText(document.getElementById(id).textContent).then(()=>{const b=document.getElementById(btnId);b.textContent='COPIED ✓';setTimeout(()=>b.textContent='COPY CODE',2500);});};

  /* ════ DECODE ════ */
  document.getElementById('decImgBtn').addEventListener('click', ()=>{decMode='image';document.getElementById('decImgBtn').classList.add('active');document.getElementById('decTxtBtn').classList.remove('active');document.getElementById('dec-image-mode').style.display='block';document.getElementById('dec-text-mode').style.display='none';document.getElementById('decOutput').style.display='none';hideError(document.getElementById('decError'));});
  document.getElementById('decTxtBtn').addEventListener('click', ()=>{decMode='text';document.getElementById('decTxtBtn').classList.add('active');document.getElementById('decImgBtn').classList.remove('active');document.getElementById('dec-image-mode').style.display='none';document.getElementById('dec-text-mode').style.display='block';document.getElementById('decOutput').style.display='none';hideError(document.getElementById('decError'));});

  const decDropZone=document.getElementById('decDropZone'),decImageInput=document.getElementById('decImageInput');
  decDropZone.addEventListener('dragover',e=>{e.preventDefault();decDropZone.classList.add('drag-over');});
  decDropZone.addEventListener('dragleave',()=>decDropZone.classList.remove('drag-over'));
  decDropZone.addEventListener('drop',e=>{e.preventDefault();decDropZone.classList.remove('drag-over');if(e.dataTransfer.files[0])loadDecImg(e.dataTransfer.files[0]);});
  decImageInput.addEventListener('change',()=>{if(decImageInput.files[0])loadDecImg(decImageInput.files[0]);});
  function loadDecImg(file){readFile(file,(url,f)=>{decImageData=url;document.getElementById('decPreviewImg').src=url;document.getElementById('decPreview').classList.add('show');document.getElementById('decImgInfo').textContent=f.name;});}

  document.getElementById('decodeBtn').addEventListener('click', async ()=>{
    const pw=document.getElementById('decPassword').value.trim();
    if(!pw) return showError(document.getElementById('decError'),'Enter the password.');
    const btn=document.getElementById('decodeBtn'); btn.textContent='EXTRACTING...'; btn.disabled=true;
    document.getElementById('decOutput').style.display='none'; hideError(document.getElementById('decError'));
    try {
      let payload='';
      if(decMode==='image'){if(!decImageData){btn.textContent='REVEAL MESSAGE';btn.disabled=false;return showError(document.getElementById('decError'),'Load an image first.');}const raw=await VoidSteg.extract(decImageData);payload=raw.startsWith('V01D://')?raw.slice(7):raw;}
      else{let c=document.getElementById('decVoidCode').value.trim();payload=c.startsWith('V01D://')?c.slice(7):c;if(!payload){btn.textContent='REVEAL MESSAGE';btn.disabled=false;return showError(document.getElementById('decError'),'Paste a VOID CODE first.');}}
      let msg; try{msg=await VoidCrypto.decryptWithDecoy(payload,pw,false);}catch{try{msg=await VoidCrypto.decryptWithDecoy(payload,pw,true);if(!msg)throw new Error();}catch{throw new Error('Wrong password or corrupted data.');}}
      document.getElementById('decResult').textContent=msg; document.getElementById('decResult').style.color='';
      document.getElementById('decOutput').style.display='block';
      selfDestruct(document.getElementById('decResult'),document.getElementById('selfDestruct'),'dec');
    } catch(e){showError(document.getElementById('decError'),e.message||'Decryption failed.');}
    btn.textContent='REVEAL MESSAGE'; btn.disabled=false;
  });

  /* ════ AUDIO ════ */
  document.getElementById('audioEncBtn').addEventListener('click',()=>{document.getElementById('audioEncBtn').classList.add('active');document.getElementById('audioDecBtn').classList.remove('active');document.getElementById('audio-enc-mode').style.display='block';document.getElementById('audio-dec-mode').style.display='none';});
  document.getElementById('audioDecBtn').addEventListener('click',()=>{document.getElementById('audioDecBtn').classList.add('active');document.getElementById('audioEncBtn').classList.remove('active');document.getElementById('audio-dec-mode').style.display='block';document.getElementById('audio-enc-mode').style.display='none';});

  function setupAudioDrop(dropId, inputId, onLoad) {
    const dz=document.getElementById(dropId),inp=document.getElementById(inputId);
    dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag-over');});
    dz.addEventListener('dragleave',()=>dz.classList.remove('drag-over'));
    dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('drag-over');if(e.dataTransfer.files[0])onLoad(e.dataTransfer.files[0]);});
    inp.addEventListener('change',()=>{if(inp.files[0])onLoad(inp.files[0]);});
  }

  setupAudioDrop('audioDropZone','audioInput', async (file) => {
    audioFile = file;
    const prev=document.getElementById('audioPreview'); prev.style.display='block';
    document.getElementById('audioPlayer').src=URL.createObjectURL(file);
    try {
      const cap=await VoidAudio.getCapacity(file);
      document.getElementById('audioInfo').textContent=`${cap.duration}s · ${cap.sampleRate}Hz · ~${cap.chars.toLocaleString()} chars capacity`;
      document.getElementById('audioCapacity').style.display='block';
      document.getElementById('audioCapText').textContent=`~${cap.chars.toLocaleString()} chars available`;
      document.getElementById('audioMessage').addEventListener('input',function(){
        const pct=Math.min(100,(this.value.length/cap.chars)*100);
        document.getElementById('audioCapFill').style.width=pct+'%';
        document.getElementById('audioCapFill').classList.toggle('warn',pct>80);
        document.getElementById('audioCapText').textContent=`${this.value.length.toLocaleString()} / ~${cap.chars.toLocaleString()} chars`;
      });
    } catch(e){}
  });

  setupAudioDrop('audioDecDropZone','audioDecInput',(file)=>{
    audioDecFile=file;
    document.getElementById('audioDecPreview').style.display='block';
    document.getElementById('audioDecPlayer').src=URL.createObjectURL(file);
  });

  document.getElementById('audioEncodeBtn').addEventListener('click', async ()=>{
    const msg=document.getElementById('audioMessage').value.trim(),pw=document.getElementById('audioPassword').value.trim();
    if(!audioFile) return alert('Select an audio file first.');
    if(!msg) return alert('Write a message first.');
    if(!pw) return alert('Set a password.');
    const btn=document.getElementById('audioEncodeBtn'); btn.textContent='PROCESSING...'; btn.disabled=true;
    try {
      const encrypted=await VoidCrypto.encryptWithDecoy(msg,pw,'');
      const wavUrl=await VoidAudio.hide(audioFile,'V01D://'+encrypted);
      document.getElementById('audioEncOutput').style.display='block';
      document.getElementById('audioEncResult').innerHTML=`
        <audio controls src="${wavUrl}" style="width:100%;margin-bottom:.75rem;filter:invert(1) hue-rotate(180deg);"></audio>
        <a href="${wavUrl}" download="void_audio_${Date.now()}.wav" class="void-dl-btn">↓ DOWNLOAD ENCODED WAV</a>
        <div style="font-size:12px;font-weight:700;color:#444;margin-top:.75rem;line-height:1.9;">Send as WAV only. MP3 conversion destroys hidden data.</div>`;
    } catch(e){alert('Error: '+e.message);}
    btn.textContent='HIDE IN AUDIO'; btn.disabled=false;
  });

  document.getElementById('audioDecodeBtn').addEventListener('click', async ()=>{
    const pw=document.getElementById('audioDecPassword').value.trim();
    if(!audioDecFile) return showError(document.getElementById('audioDecError'),'Load an audio file first.');
    if(!pw) return showError(document.getElementById('audioDecError'),'Enter the password.');
    hideError(document.getElementById('audioDecError'));
    const btn=document.getElementById('audioDecodeBtn'); btn.textContent='EXTRACTING...'; btn.disabled=true;
    try {
      const raw=await VoidAudio.extract(audioDecFile);
      const payload=raw.startsWith('V01D://')?raw.slice(7):raw;
      const msg=await VoidCrypto.decryptWithDecoy(payload,pw,false);
      document.getElementById('audioDecResult').textContent=msg; document.getElementById('audioDecResult').style.color='';
      document.getElementById('audioDecOutput').style.display='block';
      selfDestruct(document.getElementById('audioDecResult'),document.getElementById('audioSelfDestruct'),'audio');
    } catch(e){showError(document.getElementById('audioDecError'),e.message||'Wrong password or no VOID data found.');}
    btn.textContent='EXTRACT MESSAGE'; btn.disabled=false;
  });

  /* ════ DEAD DROP ════ */
  document.getElementById('ddCreateBtn').addEventListener('click',()=>{document.getElementById('ddCreateBtn').classList.add('active');document.getElementById('ddReadBtn').classList.remove('active');document.getElementById('dd-create-mode').style.display='block';document.getElementById('dd-read-mode').style.display='none';});
  document.getElementById('ddReadBtn').addEventListener('click',()=>{document.getElementById('ddReadBtn').classList.add('active');document.getElementById('ddCreateBtn').classList.remove('active');document.getElementById('dd-read-mode').style.display='block';document.getElementById('dd-create-mode').style.display='none';});

  const ddReadDropZone=document.getElementById('ddReadDropZone'),ddReadImageInput=document.getElementById('ddReadImageInput');
  ddReadDropZone.addEventListener('dragover',e=>{e.preventDefault();ddReadDropZone.classList.add('drag-over');});
  ddReadDropZone.addEventListener('dragleave',()=>ddReadDropZone.classList.remove('drag-over'));
  ddReadDropZone.addEventListener('drop',e=>{e.preventDefault();ddReadDropZone.classList.remove('drag-over');if(e.dataTransfer.files[0])readFile(e.dataTransfer.files[0],(url)=>{ddReadImageData=url;});});
  ddReadImageInput.addEventListener('change',()=>{if(ddReadImageInput.files[0])readFile(ddReadImageInput.files[0],(url)=>{ddReadImageData=url;});});

  document.getElementById('ddCreateDropBtn').addEventListener('click', async ()=>{
    const msg=document.getElementById('ddMessage').value.trim();
    const pw=document.getElementById('ddPassword').value.trim();
    const url=document.getElementById('ddCustomUrl').value.trim();
    if(!msg) return showError(document.getElementById('ddCreateError'),'Write a message.');
    if(!pw) return showError(document.getElementById('ddCreateError'),'Set a password.');
    if(!url) return showError(document.getElementById('ddCreateError'),'Enter a public image URL.');
    hideError(document.getElementById('ddCreateError'));
    const btn=document.getElementById('ddCreateDropBtn'); btn.textContent='CREATING DROP...'; btn.disabled=true;
    try {
      const result=await VoidDeadDrop.createDeadDrop(msg,pw,url);
      document.getElementById('ddCreateOutput').style.display='block';
      document.getElementById('ddCreateResult').innerHTML=`
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:.5rem;">DEAD DROP KEY — SEND THIS:</div>
        <div class="void-dead-drop-key" id="ddKeyText">${result.deadDropKey}</div>
        <button class="void-copy-btn" onclick="copyCode('ddKeyText','ddCopyBtn')" id="ddCopyBtn">COPY KEY</button>
        <div style="margin-top:1rem;">
          <a href="${result.encodedImage}" download="void_drop_${Date.now()}.png" class="void-dl-btn">↓ DOWNLOAD ENCODED IMAGE (BACKUP)</a>
        </div>
        <div style="font-size:12px;font-weight:700;color:#444;margin-top:.75rem;line-height:1.9;">
          Send the DEAD DROP KEY to recipient. Share password separately.<br>
          Download the image as backup in case the public URL changes.
        </div>`;
    } catch(e){showError(document.getElementById('ddCreateError'),'Failed: '+e.message+'. Try a different image URL.');}
    btn.textContent='☠ CREATE DEAD DROP'; btn.disabled=false;
  });

  document.getElementById('ddReadBtn2').addEventListener('click', async ()=>{
    const key=document.getElementById('ddKey').value.trim();
    const pw=document.getElementById('ddReadPassword').value.trim();
    if(!pw) return showError(document.getElementById('ddReadError'),'Enter the password.');
    hideError(document.getElementById('ddReadError'));
    const btn=document.getElementById('ddReadBtn2'); btn.textContent='RETRIEVING...'; btn.disabled=true;
    try {
      const msg=await VoidDeadDrop.readDeadDrop(key||null,pw,ddReadImageData||null);
      document.getElementById('ddReadResult').textContent=msg; document.getElementById('ddReadResult').style.color='';
      document.getElementById('ddReadOutput').style.display='block';
      selfDestruct(document.getElementById('ddReadResult'),document.getElementById('ddSelfDestruct'),'dd');
    } catch(e){showError(document.getElementById('ddReadError'),e.message||'Failed to retrieve message.');}
    btn.textContent='🔍 RETRIEVE MESSAGE'; btn.disabled=false;
  });

  /* ════ VISUAL KEY ════ */
  document.getElementById('vkEncBtn').addEventListener('click',()=>{document.getElementById('vkEncBtn').classList.add('active');document.getElementById('vkDecBtn').classList.remove('active');document.getElementById('vk-enc-mode').style.display='block';document.getElementById('vk-dec-mode').style.display='none';});
  document.getElementById('vkDecBtn').addEventListener('click',()=>{document.getElementById('vkDecBtn').classList.add('active');document.getElementById('vkEncBtn').classList.remove('active');document.getElementById('vk-dec-mode').style.display='block';document.getElementById('vk-enc-mode').style.display='none';});

  function setupVKPicker(dropId,inputId,loadedId,imgId,clearBtnId,fpId,onLoad,onClear){
    const dz=document.getElementById(dropId),inp=document.getElementById(inputId),loaded=document.getElementById(loadedId);
    function load(file){readFile(file,async(url)=>{dz.style.display='none';loaded.classList.add('show');document.getElementById(imgId).src=url;const fp=await VoidVisualKey.getKeyFingerprint(url);document.getElementById(fpId).innerHTML=`<img src="${fp}"><span class="void-vk-fingerprint-label">VISUAL FINGERPRINT</span>`;onLoad(url);});}
    dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag-over');});
    dz.addEventListener('dragleave',()=>dz.classList.remove('drag-over'));
    dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('drag-over');if(e.dataTransfer.files[0])load(e.dataTransfer.files[0]);});
    inp.addEventListener('change',()=>{if(inp.files[0])load(inp.files[0]);});
    document.getElementById(clearBtnId).addEventListener('click',()=>{dz.style.display='block';loaded.classList.remove('show');document.getElementById(imgId).src='';inp.value='';if(onClear)onClear();});
  }

  setupVKPicker('vkKeyDropZone','vkKeyInput','vkKeyLoaded','vkKeyImg','vkKeyClearBtn','vkEncFingerprint',(url)=>{vkKeyData=url;},()=>{vkKeyData=null;});

  setupImagePicker('vkCarrierDropZone','vkCarrierInput','vkCarrierLoaded','vkCarrierImg','vkCarrierMeta',null,null,null,'vkCarrierClearBtn',
    (url,file)=>{vkCarrierData=url;document.getElementById('vkCarrierMeta').textContent=`${file.name} — ${(file.size/1024).toFixed(0)}KB`;},
    ()=>{vkCarrierData=null;}
  );

  document.getElementById('vkEncodeBtn').addEventListener('click', async ()=>{
    const msg=document.getElementById('vkMessage').value.trim();
    if(!vkKeyData) return showError(document.getElementById('vkEncError'),'Load your key image first.');
    if(!vkCarrierData) return showError(document.getElementById('vkEncError'),'Load a carrier PNG image.');
    if(!msg) return showError(document.getElementById('vkEncError'),'Write a message.');
    hideError(document.getElementById('vkEncError'));
    const btn=document.getElementById('vkEncodeBtn'); btn.textContent='LOCKING...'; btn.disabled=true;
    try {
      const visualPw=await VoidVisualKey.deriveKeyFromImage(vkKeyData);
      const payload=await VoidCrypto.encryptWithDecoy(msg,visualPw,'');
      const result=await VoidSteg.hide(vkCarrierData,'V01D://'+payload);
      document.getElementById('vkEncOutput').style.display='block';
      document.getElementById('vkEncResult').innerHTML=`
        <img src="${result}" style="width:100%;max-height:180px;object-fit:cover;display:block;margin-bottom:.75rem;filter:brightness(.65)">
        <a href="${result}" download="void_vk_${Date.now()}.png" class="void-dl-btn">↓ DOWNLOAD LOCKED IMAGE</a>
        <div style="font-size:12px;font-weight:700;color:#444;margin-top:.75rem;line-height:1.9;">
          Recipient needs your exact key image to unlock.<br>Share it through a secure channel.
        </div>`;
    } catch(e){showError(document.getElementById('vkEncError'),e.message||'Failed to lock.');}
    btn.textContent='👁 LOCK WITH IMAGE KEY'; btn.disabled=false;
  });

  setupVKPicker('vkDecKeyDropZone','vkDecKeyInput','vkDecKeyLoaded','vkDecKeyImg','vkDecKeyClearBtn','vkDecFingerprint',(url)=>{vkDecKeyData=url;},()=>{vkDecKeyData=null;});

  const vkDecImgDropZone=document.getElementById('vkDecImgDropZone'),vkDecImgInput=document.getElementById('vkDecImgInput');
  vkDecImgDropZone.addEventListener('dragover',e=>{e.preventDefault();vkDecImgDropZone.classList.add('drag-over');});
  vkDecImgDropZone.addEventListener('dragleave',()=>vkDecImgDropZone.classList.remove('drag-over'));
  vkDecImgDropZone.addEventListener('drop',e=>{e.preventDefault();vkDecImgDropZone.classList.remove('drag-over');if(e.dataTransfer.files[0])readFile(e.dataTransfer.files[0],(url)=>{vkDecImgData=url;document.getElementById('vkDecPreviewImg').src=url;document.getElementById('vkDecImgPreview').classList.add('show');});});
  vkDecImgInput.addEventListener('change',()=>{if(vkDecImgInput.files[0])readFile(vkDecImgInput.files[0],(url)=>{vkDecImgData=url;document.getElementById('vkDecPreviewImg').src=url;document.getElementById('vkDecImgPreview').classList.add('show');});});

  document.getElementById('vkDecodeBtn').addEventListener('click', async ()=>{
    if(!vkDecKeyData) return showError(document.getElementById('vkDecError'),'Load your key image first.');
    if(!vkDecImgData) return showError(document.getElementById('vkDecError'),'Load the encoded image.');
    hideError(document.getElementById('vkDecError'));
    const btn=document.getElementById('vkDecodeBtn'); btn.textContent='UNLOCKING...'; btn.disabled=true;
    try {
      const visualPw=await VoidVisualKey.deriveKeyFromImage(vkDecKeyData);
      const raw=await VoidSteg.extract(vkDecImgData);
      const payload=raw.startsWith('V01D://')?raw.slice(7):raw;
      const msg=await VoidCrypto.decryptWithDecoy(payload,visualPw,false);
      document.getElementById('vkDecResult').textContent=msg; document.getElementById('vkDecResult').style.color='';
      document.getElementById('vkDecOutput').style.display='block';
      selfDestruct(document.getElementById('vkDecResult'),document.getElementById('vkSelfDestruct'),'vk');
    } catch(e){showError(document.getElementById('vkDecError'),'Wrong key image or corrupted data.');}
    btn.textContent='🔓 UNLOCK WITH IMAGE KEY'; btn.disabled=false;
  });

  /* ── Init ── */
  const savedLang=localStorage.getItem('void-lang')||'en';
  VoidI18n.setLang(savedLang); buildLangSwitcher(); buildFeatures(); buildAboutBlocks();

})();

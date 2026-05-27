/* VOID — app.js */
(() => {
  const $=id=>document.getElementById(id);
  const timers={};

  /* ── State ── */
  let encImageData=null, decImageData=null;
  let audioFile=null, audioDecFile=null;
  let vkKeyData=null, vkCarrierData=null;
  let vkDecKeyData=null, vkDecImgData=null;
  let ddReadImageData=null;
  let currentMethod='image';

  /* ── Helpers ── */
  function readFile(f,cb){const r=new FileReader();r.onload=e=>cb(e.target.result,f);r.readAsDataURL(f);}
  function showErr(el,msg){if(!el)return;el.textContent='✕ '+msg;el.style.display='block';}
  function hideErr(el){if(el)el.style.display='none';}
  function selfDestruct(rEl,tEl,key){
    if(timers[key])clearInterval(timers[key]);
    let c=30;tEl.textContent=`SELF-DESTRUCT IN ${c}s`;
    timers[key]=setInterval(()=>{c--;
      if(c<=0){clearInterval(timers[key]);rEl.textContent='';rEl.style.color='#111';tEl.textContent='[ MESSAGE DESTROYED — VOID ]';tEl.style.color='#222';}
      else tEl.textContent=`SELF-DESTRUCT IN ${c}s`;
    },1000);
  }
  function setupDrop(dzId,inpId,onFile){
    const dz=$(dzId),inp=$(inpId);
    if(!dz||!inp)return;
    dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag-over');});
    dz.addEventListener('dragleave',()=>dz.classList.remove('drag-over'));
    dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('drag-over');if(e.dataTransfer.files[0])onFile(e.dataTransfer.files[0]);});
    inp.addEventListener('change',()=>{if(inp.files[0])onFile(inp.files[0]);});
  }

  /* ══════════════════════════════════
     TWO-LEVEL NAVIGATION
  ══════════════════════════════════ */
  const METHODS = ['image','audio','deaddrop','visualkey'];

  function showPanels(method) {
    /* Hide ALL enc/dec panels first */
    METHODS.forEach(m => {
      const e = $('enc-'+m);
      const d = $('dec-'+m);
      if(e) e.style.display = 'none';
      if(d) d.style.display = 'none';
    });
    /* Show only the selected method */
    const encEl = $('enc-'+method);
    const decEl = $('dec-'+method);
    if(encEl) encEl.style.display = 'block';
    if(decEl) decEl.style.display = 'block';
  }

  function activateMethod(method) {
    currentMethod = method;
    document.querySelectorAll('.void-subtab').forEach(b =>
      b.classList.toggle('active', b.dataset.method === method)
    );
    showPanels(method);
  }

  function showSubnav(show) {
    const sn = $('subNav');
    if(show) sn.classList.add('show');
    else sn.classList.remove('show');
  }

  /* Main tabs */
  document.querySelectorAll('.void-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const t = tab.dataset.tab;
      document.querySelectorAll('.void-tab').forEach(x => x.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.void-section').forEach(s => s.classList.remove('active'));
      $('tab-'+t).classList.add('active');
      const hasSub = t==='encode' || t==='decode';
      showSubnav(hasSub);
      if(hasSub) showPanels(currentMethod);
    });
  });

  /* Sub tabs */
  document.querySelectorAll('.void-subtab').forEach(btn => {
    btn.addEventListener('click', () => activateMethod(btn.dataset.method));
  });

  $('startBtn').addEventListener('click', () =>
    document.querySelector('[data-tab="encode"]').click()
  );

  /* ══ LANG & I18N ══ */
  function buildLangSwitcher(){
    const c=$('langSwitcher');
    VoidI18n.getLangs().forEach(lang=>{
      const btn=document.createElement('button');
      btn.className='void-lang-btn'+(lang===VoidI18n.getCurrent()?' active':'');
      btn.textContent=VoidI18n.getLangFlag(lang);
      btn.dataset.lang=lang;
      btn.addEventListener('click',()=>{
        VoidI18n.setLang(lang);buildFeatures();buildAboutBlocks();
        localStorage.setItem('void-lang',lang);
        document.querySelectorAll('.void-lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
      });
      c.appendChild(btn);
    });
  }
  function buildFeatures(){
    $('featuresGrid').innerHTML=VoidI18n.langs[VoidI18n.getCurrent()].features
      .map(f=>`<div class="void-feature"><div class="void-feature-icon">◎</div><div class="void-feature-title">${f.title}</div><div class="void-feature-desc">${f.desc}</div></div>`).join('');
  }
  function buildAboutBlocks(){
    $('aboutBlocks').innerHTML=VoidI18n.langs[VoidI18n.getCurrent()].about.blocks
      .map(b=>`<div class="void-about-block"><div class="void-about-num">${b.num}</div><div><div class="void-about-heading">${b.heading}</div><div class="void-about-text">${b.text}</div></div></div>`).join('');
  }

  /* ══ IMAGE PICKER FACTORY ══ */
  function makeImgPicker(dzId,inpId,loadedId,imgId,metaId,nameId,replBtnId,replInpId,delBtnId,onLoad,onClear){
    const dz=$(dzId),inp=$(inpId),loaded=$(loadedId);
    if(!inp||!loaded)return;
    function load(file){
      readFile(file,(url,f)=>{
        if(dz)dz.style.display='none';
        loaded.classList.add('show');
        $(imgId).src=url;
        if(nameId&&$(nameId))$(nameId).textContent=f.name;
        onLoad(url,f);
      });
    }
    if(dz){
      dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag-over');});
      dz.addEventListener('dragleave',()=>dz.classList.remove('drag-over'));
      dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('drag-over');if(e.dataTransfer.files[0])load(e.dataTransfer.files[0]);});
    }
    inp.addEventListener('change',()=>{if(inp.files[0])load(inp.files[0]);});
    if(delBtnId&&$(delBtnId)){
      $(delBtnId).addEventListener('click',()=>{
        if(dz)dz.style.display='block';
        loaded.classList.remove('show');
        $(imgId).src='';inp.value='';
        if(onClear)onClear();
      });
    }
    if(replBtnId&&replInpId&&$(replBtnId)&&$(replInpId)){
      const ri=$(replInpId);
      $(replBtnId).addEventListener('click',()=>ri.click());
      ri.addEventListener('change',()=>{if(ri.files[0]){if(onClear)onClear();load(ri.files[0]);ri.value='';}});
    }
  }

  /* ══════════════════════════════════
     ENCODE › IMAGE
  ══════════════════════════════════ */
  $('encImgBtn').addEventListener('click',()=>{
    $('encImgBtn').classList.add('active');$('encTxtBtn').classList.remove('active');
    $('enc-img-carrier').style.display='block';$('enc-code-info').style.display='none';
    $('encOutput').style.display='none';
  });
  $('encTxtBtn').addEventListener('click',()=>{
    $('encTxtBtn').classList.add('active');$('encImgBtn').classList.remove('active');
    $('enc-img-carrier').style.display='none';$('enc-code-info').style.display='block';
    $('encOutput').style.display='none';
  });

  makeImgPicker('encDropZone','encImageInput','encImgLoaded','encLoadedImg','encLoadedMeta','encLoadedName',
    'encReplaceBtn','encReplaceInput','encDeleteBtn',
    (url,file)=>{
      encImageData=url;
      VoidSteg.getCapacity(url).then(cap=>{
        $('encLoadedMeta').textContent=`${cap.width}×${cap.height} · ${(file.size/1024).toFixed(0)}KB · ~${cap.chars.toLocaleString()} chars`;
        $('encCapacity').style.display='block';
        $('encCapText').textContent=`~${cap.chars.toLocaleString()} chars available`;
        $('encMessage').addEventListener('input',function(){
          const pct=Math.min(100,(this.value.length/cap.chars)*100);
          $('encCapFill').style.width=pct+'%';
          $('encCapFill').classList.toggle('warn',pct>80);
          $('encCapText').textContent=`${this.value.length.toLocaleString()} / ~${cap.chars.toLocaleString()} chars`;
        });
      }).catch(()=>{});
    },
    ()=>{encImageData=null;$('encCapacity').style.display='none';}
  );

  $('encodeBtn').addEventListener('click',async()=>{
    const msg=$('encMessage').value.trim(),pw=$('encPassword').value.trim(),decoy=$('encDecoy').value.trim();
    const isImg=$('encImgBtn').classList.contains('active');
    if(!msg)return showEncErr('Write a message first.');
    if(!pw)return showEncErr('Set a password.');
    if(isImg&&!encImageData)return showEncErr('Select a PNG image first.');
    const btn=$('encodeBtn');btn.textContent='ENCRYPTING...';btn.disabled=true;
    try{
      const payload=await VoidCrypto.encryptWithDecoy(msg,pw,decoy);
      if(isImg){const r=await VoidSteg.hide(encImageData,'V01D://'+payload);showEncImgResult(r);}
      else showEncCodeResult('V01D://'+payload);
    }catch(e){showEncErr(e.message||'Encryption failed.');}
    btn.textContent='ENCRYPT & HIDE';btn.disabled=false;
  });
  function showEncErr(m){$('encOutputHeader').textContent='ERROR';$('encResult').innerHTML=`<div style="color:#e24b4a;font-weight:900;">${m}</div>`;$('encOutput').style.display='block';}
  function showEncImgResult(url){
    $('encOutputHeader').textContent='ENCODED IMAGE';
    $('encResult').innerHTML=`<img src="${url}" style="width:100%;max-height:180px;object-fit:cover;display:block;margin-bottom:.75rem;filter:brightness(.65)">
      <a href="${url}" download="void_${Date.now()}.png" class="void-dl-btn">↓ DOWNLOAD ENCODED IMAGE</a>
      <div style="font-size:12px;font-weight:700;color:#444;margin-top:.75rem;line-height:1.9;">Send via Telegram or email. Never WhatsApp.</div>`;
    $('encOutput').style.display='block';
  }
  function showEncCodeResult(code){
    $('encOutputHeader').textContent='VOID CODE';
    $('encResult').innerHTML=`<div class="void-code-output" id="voidCodeText">${code}</div><button class="void-copy-btn" onclick="copyText('voidCodeText',this)">COPY CODE</button>`;
    $('encOutput').style.display='block';
  }
  window.copyText=function(id,btn){
    navigator.clipboard.writeText($(id).textContent).then(()=>{btn.textContent='COPIED ✓';setTimeout(()=>btn.textContent='COPY CODE',2500);});
  };

  /* ══════════════════════════════════
     DECODE › IMAGE
  ══════════════════════════════════ */
  $('decImgBtn').addEventListener('click',()=>{
    $('decImgBtn').classList.add('active');$('decTxtBtn').classList.remove('active');
    $('dec-img-zone').style.display='block';$('dec-code-zone').style.display='none';
    $('decOutput').style.display='none';hideErr($('decError'));
  });
  $('decTxtBtn').addEventListener('click',()=>{
    $('decTxtBtn').classList.add('active');$('decImgBtn').classList.remove('active');
    $('dec-img-zone').style.display='none';$('dec-code-zone').style.display='block';
    $('decOutput').style.display='none';hideErr($('decError'));
  });

  setupDrop('decDropZone','decImageInput',file=>readFile(file,(url,f)=>{
    decImageData=url;$('decPreviewImg').src=url;$('decPreview').classList.add('show');$('decImgInfo').textContent=f.name;
  }));

  $('decodeBtn').addEventListener('click',async()=>{
    const pw=$('decPassword').value.trim();
    if(!pw)return showErr($('decError'),'Enter the password.');
    const isImg=$('decImgBtn').classList.contains('active');
    const btn=$('decodeBtn');btn.textContent='EXTRACTING...';btn.disabled=true;
    $('decOutput').style.display='none';hideErr($('decError'));
    try{
      let payload='';
      if(isImg){
        if(!decImageData){btn.textContent='REVEAL MESSAGE';btn.disabled=false;return showErr($('decError'),'Load an image first.');}
        const raw=await VoidSteg.extract(decImageData);
        payload=raw.startsWith('V01D://')?raw.slice(7):raw;
      }else{
        let c=$('decVoidCode').value.trim();
        payload=c.startsWith('V01D://')?c.slice(7):c;
        if(!payload){btn.textContent='REVEAL MESSAGE';btn.disabled=false;return showErr($('decError'),'Paste a VOID CODE first.');}
      }
      let msg;
      try{msg=await VoidCrypto.decryptWithDecoy(payload,pw,false);}
      catch{try{msg=await VoidCrypto.decryptWithDecoy(payload,pw,true);if(!msg)throw new Error();}
      catch{throw new Error('Wrong password or corrupted data.');}}
      $('decResult').textContent=msg;$('decResult').style.color='';
      $('decOutput').style.display='block';
      selfDestruct($('decResult'),$('selfDestruct'),'dec');
    }catch(e){showErr($('decError'),e.message||'Decryption failed.');}
    btn.textContent='REVEAL MESSAGE';btn.disabled=false;
  });

  /* ══════════════════════════════════
     ENCODE › AUDIO
  ══════════════════════════════════ */
  setupDrop('audioDropZone','audioInput',async file=>{
    audioFile=file;
    $('audioPreview').style.display='block';
    $('audioPlayer').src=URL.createObjectURL(file);
    try{
      const cap=await VoidAudio.getCapacity(file);
      $('audioInfo').textContent=`${cap.duration}s · ${cap.sampleRate}Hz · ~${cap.chars.toLocaleString()} chars`;
      $('audioCapacity').style.display='block';
      $('audioCapText').textContent=`~${cap.chars.toLocaleString()} chars available`;
      $('audioMessage').addEventListener('input',function(){
        const pct=Math.min(100,(this.value.length/cap.chars)*100);
        $('audioCapFill').style.width=pct+'%';
        $('audioCapFill').classList.toggle('warn',pct>80);
        $('audioCapText').textContent=`${this.value.length.toLocaleString()} / ~${cap.chars.toLocaleString()} chars`;
      });
    }catch(e){}
  });

  $('audioEncodeBtn').addEventListener('click',async()=>{
    const msg=$('audioMessage').value.trim(),pw=$('audioPassword').value.trim();
    if(!audioFile)return alert('Select an audio file first.');
    if(!msg)return alert('Write a message first.');
    if(!pw)return alert('Set a password.');
    const btn=$('audioEncodeBtn');btn.textContent='PROCESSING...';btn.disabled=true;
    try{
      const enc=await VoidCrypto.encryptWithDecoy(msg,pw,'');
      const wavUrl=await VoidAudio.hide(audioFile,'V01D://'+enc);
      $('audioEncOutput').style.display='block';
      $('audioEncResult').innerHTML=`
        <audio controls src="${wavUrl}" style="width:100%;margin-bottom:.75rem;filter:invert(1) hue-rotate(180deg);"></audio>
        <a href="${wavUrl}" download="void_audio_${Date.now()}.wav" class="void-dl-btn">↓ DOWNLOAD ENCODED WAV</a>
        <div style="font-size:12px;font-weight:700;color:#444;margin-top:.75rem;line-height:1.9;">Send as WAV only — MP3 re-encoding destroys hidden data.</div>`;
    }catch(e){alert('Error: '+e.message);}
    btn.textContent='🎵 HIDE IN AUDIO';btn.disabled=false;
  });

  /* ══════════════════════════════════
     DECODE › AUDIO
  ══════════════════════════════════ */
  setupDrop('audioDecDropZone','audioDecInput',file=>{
    audioDecFile=file;
    $('audioDecPreview').style.display='block';
    $('audioDecPlayer').src=URL.createObjectURL(file);
  });

  $('audioDecodeBtn').addEventListener('click',async()=>{
    const pw=$('audioDecPassword').value.trim();
    if(!audioDecFile)return showErr($('audioDecError'),'Load an audio file first.');
    if(!pw)return showErr($('audioDecError'),'Enter the password.');
    hideErr($('audioDecError'));
    const btn=$('audioDecodeBtn');btn.textContent='EXTRACTING...';btn.disabled=true;
    try{
      const raw=await VoidAudio.extract(audioDecFile);
      const payload=raw.startsWith('V01D://')?raw.slice(7):raw;
      const msg=await VoidCrypto.decryptWithDecoy(payload,pw,false);
      $('audioDecResult').textContent=msg;$('audioDecResult').style.color='';
      $('audioDecOutput').style.display='block';
      selfDestruct($('audioDecResult'),$('audioSelfDestruct'),'audio');
    }catch(e){showErr($('audioDecError'),e.message||'Wrong password or no VOID data.');}
    btn.textContent='🎵 EXTRACT MESSAGE';btn.disabled=false;
  });

  /* ══════════════════════════════════
     ENCODE › DEAD DROP
  ══════════════════════════════════ */
  $('ddCreateDropBtn').addEventListener('click',async()=>{
    const msg=$('ddMessage').value.trim(),pw=$('ddPassword').value.trim(),url=$('ddCustomUrl').value.trim();
    if(!msg)return showErr($('ddCreateError'),'Write a message.');
    if(!pw)return showErr($('ddCreateError'),'Set a password.');
    if(!url)return showErr($('ddCreateError'),'Enter a public image URL.');
    hideErr($('ddCreateError'));
    const btn=$('ddCreateDropBtn');btn.textContent='CREATING DROP...';btn.disabled=true;
    try{
      const result=await VoidDeadDrop.createDeadDrop(msg,pw,url);
      $('ddCreateOutput').style.display='block';
      $('ddCreateResult').innerHTML=`
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:.5rem;">DEAD DROP KEY — SEND THIS:</div>
        <div class="void-dead-drop-key" id="ddKeyText">${result.deadDropKey}</div>
        <button class="void-copy-btn" onclick="copyText('ddKeyText',this)">COPY KEY</button>
        <a href="${result.encodedImage}" download="void_drop_${Date.now()}.png" class="void-dl-btn" style="margin-top:1rem;">↓ DOWNLOAD BACKUP IMAGE</a>
        <div style="font-size:12px;font-weight:700;color:#444;margin-top:.75rem;line-height:1.9;">Send only the key. Share password separately.</div>`;
    }catch(e){showErr($('ddCreateError'),'Failed: '+e.message);}
    btn.textContent='☠ CREATE DEAD DROP';btn.disabled=false;
  });

  /* ══════════════════════════════════
     DECODE › DEAD DROP
  ══════════════════════════════════ */
  setupDrop('ddReadDropZone','ddReadImageInput',file=>readFile(file,url=>{ddReadImageData=url;}));

  $('ddReadBtn').addEventListener('click',async()=>{
    const key=$('ddKey').value.trim(),pw=$('ddReadPassword').value.trim();
    if(!pw)return showErr($('ddReadError'),'Enter the password.');
    hideErr($('ddReadError'));
    const btn=$('ddReadBtn');btn.textContent='RETRIEVING...';btn.disabled=true;
    try{
      const msg=await VoidDeadDrop.readDeadDrop(key||null,pw,ddReadImageData||null);
      $('ddReadResult').textContent=msg;$('ddReadResult').style.color='';
      $('ddReadOutput').style.display='block';
      selfDestruct($('ddReadResult'),$('ddSelfDestruct'),'dd');
    }catch(e){showErr($('ddReadError'),e.message||'Failed to retrieve message.');}
    btn.textContent='☠ RETRIEVE MESSAGE';btn.disabled=false;
  });

  /* ══════════════════════════════════
     VISUAL KEY PICKER FACTORY
  ══════════════════════════════════ */
  function makeVKPicker(dzId,inpId,loadedId,imgId,clearId,fpId,onLoad,onClear){
    const dz=$(dzId),inp=$(inpId),loaded=$(loadedId);
    if(!inp||!loaded)return;
    function load(file){
      readFile(file,async(url)=>{
        if(dz)dz.style.display='none';
        loaded.classList.add('show');
        $(imgId).src=url;
        const fp=await VoidVisualKey.getKeyFingerprint(url);
        $(fpId).innerHTML=`<img src="${fp}"><span class="void-vk-fingerprint-label">VISUAL FINGERPRINT</span>`;
        onLoad(url);
      });
    }
    if(dz){
      dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag-over');});
      dz.addEventListener('dragleave',()=>dz.classList.remove('drag-over'));
      dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('drag-over');if(e.dataTransfer.files[0])load(e.dataTransfer.files[0]);});
    }
    inp.addEventListener('change',()=>{if(inp.files[0])load(inp.files[0]);});
    if($(clearId)){
      $(clearId).addEventListener('click',()=>{
        if(dz)dz.style.display='block';
        loaded.classList.remove('show');
        $(imgId).src='';inp.value='';
        if(onClear)onClear();
      });
    }
  }

  /* ══════════════════════════════════
     ENCODE › VISUAL KEY
  ══════════════════════════════════ */
  makeVKPicker('vkKeyDropZone','vkKeyInput','vkKeyLoaded','vkKeyImg','vkKeyClearBtn','vkEncFingerprint',
    url=>{vkKeyData=url;},()=>{vkKeyData=null;}
  );
  makeImgPicker('vkCarrierDropZone','vkCarrierInput','vkCarrierLoaded','vkCarrierImg','vkCarrierMeta',
    null,null,null,'vkCarrierClearBtn',
    (url,file)=>{vkCarrierData=url;$('vkCarrierMeta').textContent=`${file.name} · ${(file.size/1024).toFixed(0)}KB`;},
    ()=>{vkCarrierData=null;}
  );

  $('vkEncodeBtn').addEventListener('click',async()=>{
    const msg=$('vkMessage').value.trim();
    if(!vkKeyData)return showErr($('vkEncError'),'Load your key image first.');
    if(!vkCarrierData)return showErr($('vkEncError'),'Load a carrier PNG image.');
    if(!msg)return showErr($('vkEncError'),'Write a message.');
    hideErr($('vkEncError'));
    const btn=$('vkEncodeBtn');btn.textContent='LOCKING...';btn.disabled=true;
    try{
      const vp=await VoidVisualKey.deriveKeyFromImage(vkKeyData);
      const payload=await VoidCrypto.encryptWithDecoy(msg,vp,'');
      const result=await VoidSteg.hide(vkCarrierData,'V01D://'+payload);
      $('vkEncOutput').style.display='block';
      $('vkEncResult').innerHTML=`
        <img src="${result}" style="width:100%;max-height:180px;object-fit:cover;display:block;margin-bottom:.75rem;filter:brightness(.65)">
        <a href="${result}" download="void_vk_${Date.now()}.png" class="void-dl-btn">↓ DOWNLOAD LOCKED IMAGE</a>
        <div style="font-size:12px;font-weight:700;color:#444;margin-top:.75rem;line-height:1.9;">Recipient needs your exact key image to unlock.</div>`;
    }catch(e){showErr($('vkEncError'),e.message||'Failed to lock.');}
    btn.textContent='👁 LOCK WITH IMAGE KEY';btn.disabled=false;
  });

  /* ══════════════════════════════════
     DECODE › VISUAL KEY
  ══════════════════════════════════ */
  makeVKPicker('vkDecKeyDropZone','vkDecKeyInput','vkDecKeyLoaded','vkDecKeyImg','vkDecKeyClearBtn','vkDecFingerprint',
    url=>{vkDecKeyData=url;},()=>{vkDecKeyData=null;}
  );
  setupDrop('vkDecImgDropZone','vkDecImgInput',file=>readFile(file,url=>{
    vkDecImgData=url;$('vkDecPreviewImg').src=url;$('vkDecImgPreview').classList.add('show');
  }));

  $('vkDecodeBtn').addEventListener('click',async()=>{
    if(!vkDecKeyData)return showErr($('vkDecError'),'Load your key image first.');
    if(!vkDecImgData)return showErr($('vkDecError'),'Load the encoded image.');
    hideErr($('vkDecError'));
    const btn=$('vkDecodeBtn');btn.textContent='UNLOCKING...';btn.disabled=true;
    try{
      const vp=await VoidVisualKey.deriveKeyFromImage(vkDecKeyData);
      const raw=await VoidSteg.extract(vkDecImgData);
      const payload=raw.startsWith('V01D://')?raw.slice(7):raw;
      const msg=await VoidCrypto.decryptWithDecoy(payload,vp,false);
      $('vkDecResult').textContent=msg;$('vkDecResult').style.color='';
      $('vkDecOutput').style.display='block';
      selfDestruct($('vkDecResult'),$('vkSelfDestruct'),'vk');
    }catch(e){showErr($('vkDecError'),'Wrong key image or corrupted data.');}
    btn.textContent='🔓 UNLOCK WITH IMAGE KEY';btn.disabled=false;
  });

  /* ══ INIT ══ */
  const savedLang=localStorage.getItem('void-lang')||'en';
  VoidI18n.setLang(savedLang);
  buildLangSwitcher();
  buildFeatures();
  buildAboutBlocks();

  /* Hide all method panels initially — show only when tab is clicked */
  METHODS.forEach(m=>{
    const e=$('enc-'+m), d=$('dec-'+m);
    if(e) e.style.display='none';
    if(d) d.style.display='none';
  });

})();

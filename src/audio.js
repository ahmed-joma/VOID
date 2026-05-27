/* VOID — audio.js | Audio Steganography via LSB in WAV samples */

const VoidAudio = (() => {

  /* Encode message bits into WAV audio samples (LSB of each sample) */
  async function hide(audioFile, message) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const arrayBuffer = e.target.result;
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

          const sampleRate = audioBuffer.sampleRate;
          const numChannels = audioBuffer.numberOfChannels;
          const frameCount = audioBuffer.length;

          /* Convert message to bits */
          const enc = new TextEncoder();
          const msgBytes = enc.encode(message);
          const lenBytes = new Uint8Array(4);
          new DataView(lenBytes.buffer).setUint32(0, msgBytes.length, false);
          let bits = '';
          for (const b of lenBytes) for (let i = 7; i >= 0; i--) bits += (b >> i) & 1;
          for (const b of msgBytes) for (let i = 7; i >= 0; i--) bits += (b >> i) & 1;

          if (bits.length > frameCount * 0.8) {
            return reject(new Error(`Audio too short. Need ~${Math.ceil(bits.length/8)} more samples.`));
          }

          /* Create output buffer */
          const offlineCtx = new OfflineAudioContext(numChannels, frameCount, sampleRate);
          const outBuffer = offlineCtx.createBuffer(numChannels, frameCount, sampleRate);

          /* Copy channel 0 and embed bits */
          for (let ch = 0; ch < numChannels; ch++) {
            const inData = audioBuffer.getChannelData(ch);
            const outData = outBuffer.getChannelData(ch);
            for (let i = 0; i < frameCount; i++) {
              if (ch === 0 && i < bits.length) {
                /* Quantize to 16-bit, flip LSB, re-normalize */
                let sample = Math.max(-1, Math.min(1, inData[i]));
                let int16 = Math.round(sample * 32767);
                int16 = (int16 & 0xFFFE) | parseInt(bits[i]);
                outData[i] = int16 / 32767;
              } else {
                outData[i] = inData[i];
              }
            }
          }

          /* Render to WAV */
          const wavBlob = audioBufferToWav(outBuffer);
          resolve(URL.createObjectURL(wavBlob));
        } catch(err) {
          reject(new Error('Failed to process audio: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsArrayBuffer(audioFile);
    });
  }

  async function extract(audioFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await ctx.decodeAudioData(e.target.result);
          const data = audioBuffer.getChannelData(0);
          const frameCount = audioBuffer.length;

          /* Read 32 bits for length */
          let lenBits = '';
          for (let i = 0; i < 32 && i < frameCount; i++) {
            let int16 = Math.round(Math.max(-1, Math.min(1, data[i])) * 32767);
            lenBits += (int16 & 1).toString();
          }
          let msgLen = 0;
          for (let i = 0; i < 32; i++) msgLen = (msgLen << 1) | parseInt(lenBits[i]);

          if (msgLen <= 0 || msgLen > 5_000_000) return reject(new Error('No VOID data found in this audio.'));

          let msgBits = '';
          const needed = msgLen * 8;
          for (let i = 32; i < 32 + needed && i < frameCount; i++) {
            let int16 = Math.round(Math.max(-1, Math.min(1, data[i])) * 32767);
            msgBits += (int16 & 1).toString();
          }

          const bytes = [];
          for (let i = 0; i < msgLen; i++) {
            let b = 0;
            for (let j = 0; j < 8; j++) b = (b << 1) | parseInt(msgBits[i*8+j]);
            bytes.push(b);
          }
          resolve(new TextDecoder().decode(new Uint8Array(bytes)));
        } catch(err) {
          reject(new Error('No VOID data found in this audio.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsArrayBuffer(audioFile);
    });
  }

  /* Convert AudioBuffer to WAV Blob */
  function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const blockAlign = numChannels * bitDepth / 8;
    const byteRate = sampleRate * blockAlign;
    const dataLength = buffer.length * blockAlign;
    const wavBuffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(wavBuffer);

    function writeStr(offset, str) {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeStr(36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        view.setInt16(offset, Math.round(sample * 32767), true);
        offset += 2;
      }
    }

    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  function getCapacity(audioFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const buf = await ctx.decodeAudioData(e.target.result);
          resolve({
            samples: buf.length,
            chars: Math.floor((buf.length - 32) / 8),
            duration: buf.duration.toFixed(1),
            sampleRate: buf.sampleRate
          });
        } catch { reject(new Error('Cannot read audio')); }
      };
      reader.readAsArrayBuffer(audioFile);
    });
  }

  return { hide, extract, getCapacity };
})();

#!/usr/bin/env node
// Push a text message to a Tidbyt device as a scrolling pixel-font GIF
// Usage: node push-message.js "Your message here" [--color "#ff0000"] [--scroll] [--preview]

const https = require('https');

const DEVICE_ID = process.env.TIDBYT_DEVICE_ID || 'offensively-cleansing-convenient-tamarin-950';
const API_TOKEN = process.env.TIDBYT_API_TOKEN || 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjY1YzFhMmUzNzJjZjljMTQ1MTQyNzk5ODZhMzYyNmQ1Y2QzNTI0N2IiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJodHRwczovL2FwaS50aWRieXQuY29tIiwiZXhwIjozMjY3NDY5OTIxLCJpYXQiOjE2OTA2Njk5MjEsImlzcyI6Imh0dHBzOi8vYXBpLnRpZGJ5dC5jb20iLCJzdWIiOiJMd3FzUFVHaGZQUmlabmNobGRhalRtOUNFUGUyIiwic2NvcGUiOiJkZXZpY2UiLCJkZXZpY2UiOiJvZmZlbnNpdmVseS1jbGVhbnNpbmctY29udmVuaWVudC10YW1hcmluLTk1MCJ9.we_NvvtUwqZ7FIo7xs6Oms0AQTTLnkzGM8qpN_dZthztafBo7SzA-HGOdhGOp1JHoYRavGLwnOFlT1YC0zd-dg';

const W = 64, H = 32;

// 4x6 bitmap pixel font
const PIXEL_FONT = {};
(function(){
  const raw = {
    ' ':[0,0,0,0,0,0],'!':[4,4,4,0,4,0],'"':[10,10,0,0,0,0],'#':[10,15,10,15,10,0],
    '$':[6,13,6,11,6,0],'%':[9,2,4,9,0,0],'&':[4,10,4,11,6,0],"'":[4,4,0,0,0,0],
    '(':[2,4,4,4,2,0],')':[4,2,2,2,4,0],'*':[10,4,14,4,10,0],'+':[0,4,14,4,0,0],
    ',':[0,0,0,4,4,8],'-':[0,0,14,0,0,0],'.':[0,0,0,0,4,0],'/':[1,2,4,8,0,0],
    '0':[6,9,9,9,6,0],'1':[4,12,4,4,14,0],'2':[6,9,2,4,15,0],'3':[6,9,2,9,6,0],
    '4':[2,6,10,15,2,0],'5':[15,8,14,1,14,0],'6':[6,8,14,9,6,0],'7':[15,1,2,4,4,0],
    '8':[6,9,6,9,6,0],'9':[6,9,7,1,6,0],':':[0,4,0,4,0,0],';':[0,4,0,4,4,8],
    '<':[2,4,8,4,2,0],'=':[0,14,0,14,0,0],'>':[8,4,2,4,8,0],'?':[6,9,2,0,2,0],
    '@':[6,9,11,8,6,0],
    'A':[6,9,15,9,9,0],'B':[14,9,14,9,14,0],'C':[6,9,8,9,6,0],'D':[14,9,9,9,14,0],
    'E':[15,8,14,8,15,0],'F':[15,8,14,8,8,0],'G':[6,8,11,9,6,0],'H':[9,9,15,9,9,0],
    'I':[14,4,4,4,14,0],'J':[1,1,1,9,6,0],'K':[9,10,12,10,9,0],'L':[8,8,8,8,15,0],
    'M':[9,15,15,9,9,0],'N':[9,13,11,9,9,0],'O':[6,9,9,9,6,0],'P':[14,9,14,8,8,0],
    'Q':[6,9,9,10,5,0],'R':[14,9,14,10,9,0],'S':[6,8,6,1,6,0],'T':[14,4,4,4,4,0],
    'U':[9,9,9,9,6,0],'V':[9,9,9,10,4,0],'W':[9,9,15,15,9,0],'X':[9,9,6,9,9,0],
    'Y':[9,9,7,1,6,0],'Z':[15,1,6,8,15,0],
    '[':[6,4,4,4,6,0],'\\':[8,4,2,1,0,0],']':[6,2,2,2,6,0],'^':[4,10,0,0,0,0],
    '_':[0,0,0,0,15,0],'`':[4,2,0,0,0,0],
    'a':[0,6,10,10,7,0],'b':[8,14,9,9,14,0],'c':[0,6,8,8,6,0],'d':[1,7,9,9,7,0],
    'e':[0,6,11,12,6,0],'f':[2,4,14,4,4,0],'g':[0,7,9,7,1,6],'h':[8,14,9,9,9,0],
    'i':[4,0,4,4,4,0],'j':[2,0,2,2,10,4],'k':[8,10,12,10,9,0],'l':[4,4,4,4,2,0],
    'm':[0,9,15,15,9,0],'n':[0,14,9,9,9,0],'o':[0,6,9,9,6,0],'p':[0,14,9,14,8,8],
    'q':[0,7,9,7,1,1],'r':[0,6,9,8,8,0],'s':[0,7,12,3,14,0],'t':[4,14,4,4,2,0],
    'u':[0,9,9,9,7,0],'v':[0,9,9,10,4,0],'w':[0,9,15,15,6,0],'x':[0,9,6,6,9,0],
    'y':[0,9,9,7,1,6],'z':[0,15,2,4,15,0],
    '{':[2,4,8,4,2,0],'|':[4,4,4,4,4,0],'}':[8,4,2,4,8,0],'~':[0,5,10,0,0,0],
  };
  for (const [ch, rows] of Object.entries(raw)) PIXEL_FONT[ch] = rows;
})();

function hexToRgb(hex) {
  hex = hex.replace('#','');
  return { r: parseInt(hex.slice(0,2),16), g: parseInt(hex.slice(2,4),16), b: parseInt(hex.slice(4,6),16) };
}

function renderFrame(text, offsetX, color, bgColor) {
  const fg = hexToRgb(color);
  const bg = hexToRgb(bgColor || '#000000');
  const rgba = new Uint8Array(W * H * 4);
  // Fill background
  for (let i = 0; i < W * H; i++) {
    rgba[i*4] = bg.r; rgba[i*4+1] = bg.g; rgba[i*4+2] = bg.b; rgba[i*4+3] = 255;
  }
  // Draw text
  const y = Math.floor((H - 6) / 2); // vertically centered
  for (let ci = 0; ci < text.length; ci++) {
    const glyph = PIXEL_FONT[text[ci]] || PIXEL_FONT['?'];
    if (!glyph) continue;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        if (glyph[row] & (8 >> col)) {
          const px = offsetX + ci * 5 + col;
          const py = y + row;
          if (px >= 0 && px < W && py >= 0 && py < H) {
            const idx = (py * W + px) * 4;
            rgba[idx] = fg.r; rgba[idx+1] = fg.g; rgba[idx+2] = fg.b;
          }
        }
      }
    }
  }
  return rgba;
}

function textWidth(text) { return text.length * 5 - 1; }

// ===== GIF ENCODER =====
const GIFEncoder = {
  encode(framesRGBA, width, height, delayMs) {
    const delay = Math.round(delayMs / 10);
    const out = [];
    const write = b => { if (Array.isArray(b)) b.forEach(v => out.push(v)); else out.push(b); };
    const writeStr = s => { for (let i=0;i<s.length;i++) out.push(s.charCodeAt(i)); };
    const writeU16 = v => { write(v & 0xff); write((v >> 8) & 0xff); };
    writeStr('GIF89a'); writeU16(width); writeU16(height);
    write(0xf7); write(0); write(0);
    const gct = [];
    for (let r=0;r<6;r++) for (let g=0;g<6;g++) for (let b=0;b<6;b++)
      gct.push(Math.round(r*255/5), Math.round(g*255/5), Math.round(b*255/5));
    while (gct.length < 768) gct.push(0);
    write(gct);
    write(0x21); write(0xff); write(11); writeStr('NETSCAPE2.0');
    write(3); write(1); writeU16(0); write(0);
    function quantize(r,g,b) { return Math.round(r*5/255)*36+Math.round(g*5/255)*6+Math.round(b*5/255); }
    for (const rgba of framesRGBA) {
      write(0x21); write(0xf9); write(4); write(0x00); writeU16(delay); write(0); write(0);
      write(0x2c); writeU16(0); writeU16(0); writeU16(width); writeU16(height); write(0);
      const pixels = new Uint8Array(width*height);
      for (let i=0;i<width*height;i++) pixels[i] = quantize(rgba[i*4],rgba[i*4+1],rgba[i*4+2]);
      const compressed = this.lzwEncode(8, pixels);
      write(8);
      let pos = 0;
      while (pos < compressed.length) {
        const chunk = Math.min(255, compressed.length - pos);
        write(chunk);
        for (let i=0;i<chunk;i++) out.push(compressed[pos++]);
      }
      write(0);
    }
    write(0x3b);
    return Buffer.from(out);
  },
  lzwEncode(minCodeSize, pixels) {
    const clearCode = 1 << minCodeSize;
    const eoiCode = clearCode + 1;
    let codeSize = minCodeSize + 1;
    let nextCode = eoiCode + 1;
    const out = [];
    let buf = 0, bufLen = 0;
    const emit = code => { buf |= code << bufLen; bufLen += codeSize; while (bufLen >= 8) { out.push(buf & 0xff); buf >>= 8; bufLen -= 8; } };
    let table = new Map();
    for (let i = 0; i < clearCode; i++) table.set(String(i), i);
    emit(clearCode);
    let current = String(pixels[0]);
    for (let i = 1; i < pixels.length; i++) {
      const next = String(pixels[i]);
      const combined = current + ',' + next;
      if (table.has(combined)) { current = combined; }
      else {
        emit(table.get(current));
        if (nextCode < 4096) { table.set(combined, nextCode++); if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++; }
        else { emit(clearCode); table = new Map(); for (let j=0;j<clearCode;j++) table.set(String(j),j); nextCode = eoiCode+1; codeSize = minCodeSize+1; }
        current = next;
      }
    }
    emit(table.get(current));
    emit(eoiCode);
    if (bufLen > 0) out.push(buf & 0xff);
    return out;
  }
};

function pushToTidbyt(gifBuffer, installationID, background) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      deviceID: DEVICE_ID,
      image: gifBuffer.toString('base64'),
      ...(installationID ? { installationID, background: !!background } : {}),
    });
    const req = https.request({
      hostname: 'api.tidbyt.com',
      path: `/v0/devices/${DEVICE_ID}/push`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => res.statusCode === 200 ? resolve(body) : reject(new Error(`API ${res.statusCode}: ${body}`)));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) { console.error('Usage: node push-message.js "message" [--color #fff] [--bg #000] [--scroll] [--install id] [--preview]'); process.exit(1); }

  let text = '', color = '#ffffff', bgColor = '#000000', scroll = false, installId = '', preview = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--color') color = args[++i];
    else if (args[i] === '--bg') bgColor = args[++i];
    else if (args[i] === '--scroll') scroll = true;
    else if (args[i] === '--install') installId = args[++i];
    else if (args[i] === '--preview') preview = true;
    else text = args[i];
  }

  if (!text) { console.error('No message text provided'); process.exit(1); }

  let framesRGBA;
  const tw = textWidth(text);

  if (scroll && tw > W) {
    // Generate scrolling frames: text enters from right, exits left
    framesRGBA = [];
    const totalFrames = W + tw + W;
    for (let f = 0; f < totalFrames; f++) {
      const offset = W - f;
      framesRGBA.push(renderFrame(text, offset, color, bgColor));
    }
  } else {
    // Static: center text
    const offsetX = Math.max(0, Math.floor((W - tw) / 2));
    framesRGBA = [renderFrame(text, offsetX, color, bgColor)];
  }

  const gif = GIFEncoder.encode(framesRGBA, W, H, scroll ? 50 : 100);
  console.log(`Encoded ${framesRGBA.length} frame(s), ${gif.length} bytes`);

  const iid = preview ? undefined : (installId || 'tidbyt-message');
  await pushToTidbyt(gif, iid, false);
  console.log(`✅ Pushed to Tidbyt${iid ? ` (install: ${iid})` : ' (preview)'}`);
}

// Export for use as module
module.exports = { renderFrame, textWidth, GIFEncoder, pushToTidbyt, PIXEL_FONT };

if (require.main === module) main().catch(e => { console.error('❌', e.message); process.exit(1); });

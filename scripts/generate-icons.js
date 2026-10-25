import fs from 'fs';
import zlib from 'zlib';

// Minimal PNG encoder in pure Node.js
function encodePNG(width, height, getPixel) {
  // 1 byte filter type (0 = none) + width * 4 bytes per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth: 8
  ihdrData[9] = 6; // color type: 6 (RGBA)
  ihdrData[10] = 0; // compression method: 0
  ihdrData[11] = 0; // filter method: 0
  ihdrData[12] = 0; // interlace: 0
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcTarget = chunk.subarray(4, 8 + length);
  const crcValue = crc32(crcTarget);
  chunk.writeUInt32BE(crcValue, 8 + length);
  return chunk;
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Procedural Oak & Brass Clock Renderer
function renderClockPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxRadius = w / 2;

  // Background for maskable: full oak wood bleed
  if (isMaskable) {
    if (dist > maxRadius) {
      return [42, 22, 10, 255]; // Deep dark oak
    }
  }

  // Outer Oak Frame circle / rounded rect
  const oakRadius = maxRadius * 0.94;
  const brassRadiusOuter = maxRadius * 0.82;
  const brassRadiusInner = maxRadius * 0.76;
  const dialRadius = maxRadius * 0.74;

  if (dist > oakRadius) {
    if (isMaskable) return [45, 24, 10, 255];
    return [0, 0, 0, 0]; // Transparent outside icon border
  }

  // Oak Rim
  if (dist > brassRadiusOuter) {
    const woodGrain = Math.sin((x * 0.15) + Math.cos(y * 0.08) * 4) * 12;
    const r = Math.min(255, Math.max(0, 68 + woodGrain));
    const g = Math.min(255, Math.max(0, 38 + woodGrain * 0.6));
    const b = Math.min(255, Math.max(0, 18 + woodGrain * 0.3));
    return [r, g, b, 255];
  }

  // Brass Bezel Ring
  if (dist > brassRadiusInner) {
    const angle = Math.atan2(dy, dx);
    const sheen = Math.sin(angle * 3) * 35;
    const r = Math.min(255, Math.max(0, 218 + sheen));
    const g = Math.min(255, Math.max(0, 175 + sheen * 0.85));
    const b = Math.min(255, Math.max(0, 70 + sheen * 0.4));
    return [r, g, b, 255];
  }

  // Dark Bevel Divider
  if (dist > dialRadius) {
    return [45, 30, 12, 255];
  }

  // Dial Parchment / Antique Face
  const parchmentGrad = 1 - (dist / dialRadius) * 0.18;
  let pr = Math.floor(250 * parchmentGrad);
  let pg = Math.floor(242 * parchmentGrad);
  let pb = Math.floor(226 * parchmentGrad);

  // Hour hand (approx 10 o'clock): angle ~ 300 deg (-60 deg = -PI/3)
  // Minute hand (approx 2 o'clock / 10 past): angle ~ 60 deg (PI/3)
  const angle = Math.atan2(dy, dx);

  // Minute Hand (longer)
  const minuteAngle = 1.05; // ~60 deg
  const minuteDiff = Math.abs(angle - minuteAngle);
  if (dist < dialRadius * 0.85 && dist > 10 && (minuteDiff < 0.04 || minuteDiff > Math.PI * 2 - 0.04)) {
    return [30, 18, 10, 255]; // Dark antique brass hand
  }

  // Hour Hand (shorter, thicker)
  const hourAngle = -1.2; // ~10 o'clock
  const hourDiff = Math.abs(angle - hourAngle);
  if (dist < dialRadius * 0.58 && dist > 10 && (hourDiff < 0.07 || hourDiff > Math.PI * 2 - 0.07)) {
    return [25, 15, 8, 255];
  }

  // Center brass cap
  if (dist < 14) {
    return [220, 180, 70, 255];
  }
  if (dist < 5) {
    return [40, 25, 10, 255];
  }

  // Dial tick marks at each hour (12 ticks)
  const angleNorm = (angle + Math.PI * 2) % (Math.PI * 2);
  const hourSector = Math.PI / 6;
  const nearestTick = Math.round(angleNorm / hourSector) * hourSector;
  const tickDiff = Math.abs(angleNorm - nearestTick);
  if (dist > dialRadius * 0.84 && dist < dialRadius * 0.96 && tickDiff < 0.035) {
    return [60, 40, 20, 255]; // Roman numeral / tick marks
  }

  return [pr, pg, pb, 255];
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

console.log('Generating PWA icons...');
const icon192 = encodePNG(192, 192, (x, y, w, h) => renderClockPixel(x, y, w, h, false));
fs.writeFileSync('./public/pwa-192x192.png', icon192);

const icon512 = encodePNG(512, 512, (x, y, w, h) => renderClockPixel(x, y, w, h, false));
fs.writeFileSync('./public/pwa-512x512.png', icon512);

const iconMaskable = encodePNG(512, 512, (x, y, w, h) => renderClockPixel(x, y, w, h, true));
fs.writeFileSync('./public/pwa-maskable-512x512.png', iconMaskable);

const appleIcon = encodePNG(180, 180, (x, y, w, h) => renderClockPixel(x, y, w, h, true));
fs.writeFileSync('./public/apple-touch-icon.png', appleIcon);

// Create favicon
fs.writeFileSync('./public/favicon.ico', icon192);

console.log('All icons generated successfully!');

/**
 * Rasterises the DevPrep mark into the PNG sizes a PWA manifest needs.
 *
 * The mark is the product's thesis: two channel tracks on a faceplate. The
 * upper track carries signal (brass, filled); the lower one is still inert
 * (cool, short, dim) because the model answer stays locked until you speak.
 *
 * Drawn by hand into an RGBA buffer and encoded with node's own zlib so the
 * repository does not carry an image toolchain just for three icons.
 *
 * Run: node scripts/generate-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, '../public/icons');

const COLORS = {
  booth: [17, 13, 10, 255],
  plate: [31, 25, 20, 255],
  rule: [72, 63, 55, 255],
  well: [17, 13, 10, 255],
  brass: [201, 145, 61, 255],
  cool: [110, 126, 140, 255],
};

/** Signed distance to a rounded rectangle, used for anti-aliased edges. */
function roundedRectSdf(px, py, cx, cy, halfW, halfH, radius) {
  const qx = Math.abs(px - cx) - (halfW - radius);
  const qy = Math.abs(py - cy) - (halfH - radius);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - radius;
}

function blend(dst, offset, rgba, coverage) {
  if (coverage <= 0) return;
  const a = coverage * (rgba[3] / 255);
  for (let c = 0; c < 3; c += 1) {
    dst[offset + c] = Math.round(dst[offset + c] * (1 - a) + rgba[c] * a);
  }
  dst[offset + 3] = Math.max(dst[offset + 3], Math.round(255 * a));
}

/**
 * @param {number} size    output edge in pixels
 * @param {boolean} maskable adds the safe-zone padding Android expects
 */
function drawMark(size, maskable) {
  const SS = 4; // supersampling factor for edge quality
  const buf = new Uint8ClampedArray(size * size * 4);

  // Maskable icons get cropped to a circle of ~80% width, so the artwork
  // shrinks into the safe zone and the plate fills the whole frame.
  const inset = maskable ? size * 0.18 : size * 0.085;
  const plateHalf = size / 2 - inset;
  const cx = size / 2;
  const cy = size / 2;
  const plateRadius = plateHalf * 0.26;

  const trackHeight = plateHalf * 0.2;
  const trackRadius = trackHeight / 2;
  const trackGap = plateHalf * 0.3;
  const trackLeft = cx - plateHalf * 0.58;

  // Both channels show the same empty well; only the fill differs. That is
  // what makes the mark read as two level meters rather than a list.
  const wellW = plateHalf * 1.16;
  const upperW = wellW * 0.82; // signal present
  const lowerW = wellW * 0.16; // still silent

  const upperCy = cy - trackGap;
  const lowerCy = cy + trackGap;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;

      let plateCov = 0;
      let ruleCov = 0;
      let wellCov = 0;
      let upperCov = 0;
      let lowerCov = 0;

      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;

          const dPlate = roundedRectSdf(px, py, cx, cy, plateHalf, plateHalf, plateRadius);
          if (dPlate <= 0) plateCov += 1;
          // A hairline machined edge one pixel inside the plate.
          const strokeW = Math.max(1, size / 96);
          if (dPlate <= 0 && dPlate >= -strokeW) ruleCov += 1;

          for (const wellCy of [upperCy, lowerCy]) {
            const dWell = roundedRectSdf(
              px, py, trackLeft + wellW / 2, wellCy, wellW / 2, trackHeight / 2, trackRadius,
            );
            if (dWell <= 0) wellCov += 1;
          }

          const dUpper = roundedRectSdf(
            px, py, trackLeft + upperW / 2, upperCy, upperW / 2, trackHeight / 2, trackRadius,
          );
          if (dUpper <= 0) upperCov += 1;

          const dLower = roundedRectSdf(
            px, py, trackLeft + lowerW / 2, lowerCy, lowerW / 2, trackHeight / 2, trackRadius,
          );
          if (dLower <= 0) lowerCov += 1;
        }
      }

      const total = SS * SS;
      if (maskable) blend(buf, offset, COLORS.booth, 1);
      blend(buf, offset, COLORS.plate, plateCov / total);
      blend(buf, offset, COLORS.rule, ruleCov / total);
      blend(buf, offset, COLORS.well, wellCov / (total * 2));
      blend(buf, offset, COLORS.brass, upperCov / total);
      blend(buf, offset, COLORS.cool, (lowerCov / total) * 0.85);
    }
  }

  return buf;
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i += 1) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(rgba, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0; // no filter
    for (let i = 0; i < size * 4; i += 1) {
      raw[y * (size * 4 + 1) + 1 + i] = rgba[y * size * 4 + i];
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: true },
];

for (const target of targets) {
  const png = encodePng(drawMark(target.size, target.maskable), target.size);
  writeFileSync(resolve(OUT_DIR, target.name), png);
  console.log(`wrote icons/${target.name} (${png.length} bytes)`);
}

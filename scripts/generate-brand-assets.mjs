import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WIDTH = 2400;
const HEIGHT = 1350;
const root = process.cwd();
const coversDir = path.join(root, "public/covers");
const socialDir = path.join(root, "public/og-tracks");
const tracks = JSON.parse(await readFile(path.join(root, "app/data/tracks.json"), "utf8"));

await mkdir(socialDir, { recursive: true });
await mkdir(path.join(root, "public/icons/pwa"), { recursive: true });

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const wrap = (text, max = 22) => {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
};

const roundedCover = async (cover, size) => {
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="44" fill="white"/></svg>`);
  return sharp(path.join(coversDir, `${cover}.jpg`))
    .resize(size, size, { fit: "cover" })
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
};

const rootBackground = Buffer.from(`
  <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="wash" cx="64%" cy="48%" r="72%">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#eee7d8"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#wash)"/>
    <text x="150" y="205" font-family="Arial, Helvetica, sans-serif" font-size="132" font-weight="700" letter-spacing="-8" fill="#111111">yeezyflow</text>
    <text x="159" y="276" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="500" letter-spacing="5" fill="#111111" opacity=".54">55 TRACKS  ·  17 RELEASES  ·  2004—2026</text>
    <text x="2240" y="1215" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#111111" opacity=".42">A CURATED KANYE WEST INDEX</text>
  </svg>
`);

const collage = [
  ["the-college-dropout", 340, -10, 110, 610],
  ["graduation", 395, -6, 410, 510],
  ["808s-and-heartbreak", 420, -2, 755, 450],
  ["my-beautiful-dark-twisted-fantasy", 470, 1, 1120, 410],
  ["yeezus", 420, 5, 1510, 465],
  ["the-life-of-pablo", 380, 8, 1840, 560],
];

const collageInputs = [];
for (const [cover, size, angle, left, top] of collage) {
  const image = await roundedCover(cover, size);
  const rotated = await sharp(image).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  collageInputs.push({ input: rotated, left, top });
}

await sharp(rootBackground)
  .composite(collageInputs)
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, "public/opengraph-image.png"));

for (const track of tracks) {
  const coverPath = path.join(coversDir, `${track.cover}.jpg`);
  const backdrop = await sharp(coverPath)
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .blur(58)
    .modulate({ brightness: 0.58, saturation: 0.82 })
    .png()
    .toBuffer();
  const cover = await roundedCover(track.cover, 820);
  const lines = wrap(track.title, track.title.length > 28 ? 19 : 23);
  const fontSize = lines.length > 2 ? 91 : track.title.length > 25 ? 106 : 122;
  const title = lines.map((line, index) => `<tspan x="1085" dy="${index ? fontSize * 1.04 : 0}">${escapeXml(line)}</tspan>`).join("");
  const text = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="veil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#0a0a0a" stop-opacity=".42"/>
          <stop offset=".45" stop-color="#0a0a0a" stop-opacity=".72"/>
          <stop offset="1" stop-color="#0a0a0a" stop-opacity=".9"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#veil)"/>
      <rect x="130" y="230" width="860" height="860" rx="58" fill="#000000" opacity=".30"/>
      <text x="1085" y="335" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600" letter-spacing="5" fill="#ffffff" opacity=".62">${escapeXml(track.project.toUpperCase())}  ·  ${track.year}</text>
      <text x="1085" y="510" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="-5" fill="#ffffff">${title}</text>
      <text x="1085" y="1035" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#ffffff" opacity=".64">${escapeXml(track.artists.join(" · "))}</text>
      <text x="1085" y="1100" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#ffffff" opacity=".48">${escapeXml(track.duration)}</text>
      <text x="2220" y="1215" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="43" font-weight="700" letter-spacing="-2" fill="#ffffff">yeezyflow</text>
    </svg>
  `);
  await sharp(backdrop)
    .composite([{ input: text }, { input: cover, left: 150, top: 250 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(socialDir, `${track.id}.png`));
}

const iconSvg = Buffer.from(`
  <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="112" fill="#efe7d7"/>
    <circle cx="256" cy="256" r="184" fill="#111111"/>
    <text x="256" y="302" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="164" font-weight="700" letter-spacing="-12" fill="#efe7d7">yf</text>
  </svg>
`);
const icon512 = await sharp(iconSvg).png().toBuffer();
await writeFile(path.join(root, "public/icon-source.png"), icon512);
await sharp(icon512).resize(512, 512).png().toFile(path.join(root, "public/icons/pwa/android-chrome-512x512.png"));
await sharp(icon512).resize(192, 192).png().toFile(path.join(root, "public/icons/pwa/android-chrome-192x192.png"));
await sharp(icon512).resize(180, 180).png().toFile(path.join(root, "public/apple-icon.png"));
await sharp(icon512).resize(1200, 1200).flatten({ background: "#efe7d7" }).jpeg({ quality: 90 }).toFile(path.join(coversDir, "placeholder.jpg"));

const faviconPng = await sharp(icon512).resize(64, 64).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(64, 6);
header.writeUInt8(64, 7);
header.writeUInt8(0, 8);
header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(faviconPng.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(path.join(root, "public/favicon.ico"), Buffer.concat([header, faviconPng]));

console.log(`Generated Yeezyflow identity, ${tracks.length} social cards, and PWA icons.`);

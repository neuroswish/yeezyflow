import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, readFile, readdir, stat } from "node:fs/promises";
import net from "node:net";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const publicRoot = new URL("../public/", import.meta.url);
const tracks = JSON.parse(await readFile(new URL("../app/data/tracks.json", import.meta.url), "utf8"));
let server;
let baseUrl;
let serverLog = "";

async function availablePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => resolve(address.port));
    });
  });
}

test.before(async () => {
  const port = await availablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: fileURLToPath(projectRoot),
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (chunk) => { serverLog += chunk; });
  server.stderr.on("data", (chunk) => { serverLog += chunk; });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Next server exited early:\n${serverLog}`);
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Next server did not become ready:\n${serverLog}`);
});

test.after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
});

async function render(pathname) {
  return fetch(new URL(pathname, baseUrl), { headers: { accept: "text/html" } });
}

function pngSize(buffer) {
  assert.equal(buffer.toString("hex", 0, 8), "89504e470d0a1a0a");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

test("server-renders the complete Yeezyflow shell and root metadata", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();

  assert.match(html, /<title>yeezyflow<\/title>/i);
  assert.match(html, /55 Kanye West tracks spanning 2004 to 2026/);
  assert.match(html, /mobile-web-app-capable/);
  assert.match(html, /apple-mobile-web-app-title/);
  assert.match(html, /opengraph-image\?5bd683d04aac139f/);
  assert.match(html, />Runaway</);
  assert.match(html, />My Beautiful Dark Twisted Fantasy</);
  assert.match(html, />Kanye West</);
  assert.match(html, />9:08</);
  assert.match(html, /aria-label="Cover flow"/);
  assert.doesNotMatch(html, /Building your site|react-loading-skeleton|codex-preview/i);
});

test("supports bare-query and path deep links", async () => {
  const queryResponse = await render("/?i-wonder");
  assert.equal(queryResponse.status, 200);
  const queryHtml = await queryResponse.text();
  assert.match(queryHtml, />I Wonder</);
  assert.match(queryHtml, />Graduation</);

  const trackResponse = await render("/runaway");
  assert.equal(trackResponse.status, 200);
  const trackHtml = await trackResponse.text();
  assert.match(trackHtml, /<title>Runaway · yeezyflow<\/title>/i);
  assert.match(trackHtml, /Nine minutes of piano, self-indictment/);
  assert.match(trackHtml, /\/runaway\/opengraph-image\?30c237afccd2e788/);
  assert.match(trackHtml, /property="og:site_name" content="yeezyflow"/);
});

test("renders every track route and a full noindex 404", async () => {
  for (const track of tracks) {
    const response = await render(`/${track.id}`);
    assert.equal(response.status, 200, track.id);
    const html = await response.text();
    assert.ok(html.includes(track.title), `missing title for ${track.id}`);
    assert.ok(html.includes(track.note.replaceAll("&", "&amp;")), `missing note for ${track.id}`);
  }

  const missing = await render("/not-a-track");
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await missing.text();
  assert.match(html, /Track not found/);
  assert.match(html, /<meta(?=[^>]*name="robots")(?=[^>]*content="noindex")[^>]*>/);
});

test("ships a complete, route-safe catalog and every referenced asset", async () => {
  assert.equal(tracks.length, 55);
  assert.equal(new Set(tracks.map((track) => track.id)).size, tracks.length);

  for (const track of tracks) {
    assert.match(track.id, /^[a-z0-9-]+$/);
    assert.match(track.duration, /^\d+:\d{2}$/);
    assert.match(track.youtubeId, /^[\w-]{11}$/);
    assert.equal(track.links.youtube, `https://www.youtube.com/watch?v=${track.youtubeId}`);
    assert.ok(track.links.appleMusic.startsWith("https://music.apple.com/"));
    assert.ok(track.links.spotify.startsWith("https://open.spotify.com/"));
    assert.ok(Array.isArray(track.artists) && track.artists.length > 0);
    await access(new URL(`covers/${track.cover}.jpg`, publicRoot));
    const og = await readFile(new URL(`og-tracks/${track.id}.png`, publicRoot));
    assert.deepEqual(pngSize(og), { width: 2400, height: 1350 }, track.id);
  }

  await Promise.all([
    "favicon.ico",
    "icon-source.png",
    "apple-icon.png",
    "manifest.webmanifest",
    "opengraph-image.png",
    "icons/icon-spotify.svg",
    "icons/icon-apple.svg",
    "icons/icon-youtube.svg",
    "icons/pwa/android-chrome-192x192.png",
    "icons/pwa/android-chrome-512x512.png",
  ].map((asset) => access(new URL(asset, publicRoot))));

  assert.deepEqual(pngSize(await readFile(new URL("opengraph-image.png", publicRoot))), { width: 2400, height: 1350 });
  assert.deepEqual(pngSize(await readFile(new URL("icons/pwa/android-chrome-192x192.png", publicRoot))), { width: 192, height: 192 });
  assert.deepEqual(pngSize(await readFile(new URL("icons/pwa/android-chrome-512x512.png", publicRoot))), { width: 512, height: 512 });
  assert.deepEqual(pngSize(await readFile(new URL("apple-icon.png", publicRoot))), { width: 180, height: 180 });

  const manifest = JSON.parse(await readFile(new URL("manifest.webmanifest", publicRoot), "utf8"));
  assert.equal(manifest.name, "yeezyflow");
  assert.equal(manifest.short_name, "yeezyflow");
  assert.equal((await readFile(new URL("package.json", projectRoot), "utf8")).includes("react-loading-skeleton"), false);
  assert.ok((await stat(new URL("favicon.ico", publicRoot))).size > 100);
});

test("serves byte-identical social cards from the public metadata routes", async () => {
  for (const [route, source] of [
    ["/opengraph-image?5bd683d04aac139f", "opengraph-image.png"],
    ["/runaway/opengraph-image?30c237afccd2e788", "og-tracks/runaway.png"],
  ]) {
    const response = await fetch(new URL(route, baseUrl));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/png");
    const expected = await readFile(new URL(source, publicRoot));
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected);
  }
});

test("keeps snap metadata monotonic and album transitions literal", async () => {
  const flowSource = await readFile(new URL("app/flow-experience.tsx", projectRoot), "utf8");
  const styles = await readFile(new URL("app/globals.css", projectRoot), "utf8");
  const settleStart = flowSource.indexOf("const settlePosition = useCallback");
  const settleEnd = flowSource.indexOf("const snapToIndex = useCallback", settleStart);
  assert.ok(settleStart >= 0 && settleEnd > settleStart, "missing coverflow settle implementation");
  const settleSource = flowSource.slice(settleStart, settleEnd);
  const ownershipGuard = settleSource.indexOf("programmaticRef.current = true");
  const springTarget = settleSource.indexOf("setTarget(destination)");
  assert.ok(ownershipGuard >= 0 && ownershipGuard < springTarget, "snap target must suppress stale spring index emissions");

  assert.doesNotMatch(flowSource, /function\s+(?:ScrambledAlbum|randomCharacter)\b/);
  assert.match(flowSource, /data-meta-transition="album"/);
  assert.match(flowSource, /className=\{`\$\{C\.meta\.album\} yf-album-layer`\}/);
  assert.match(styles, /\.yf-title-layer,\s*\.yf-album-layer\s*\{/);
});

test("contains no retired catalog assets or source identity", async () => {
  const coverNames = await readdir(new URL("covers/", publicRoot));
  const cardNames = await readdir(new URL("og-tracks/", publicRoot));
  assert.equal(coverNames.length, 18);
  assert.equal(cardNames.length, 55);
  assert.equal(coverNames.some((name) => /finally-rich|almighty|chief|sosa/i.test(name)), false);
  assert.equal(cardNames.some((name) => /citgo|faneto|love-sosa|chief/i.test(name)), false);

  const sourceFiles = [
    "AGENTS.md",
    "README.md",
    "package.json",
    "app/layout.tsx",
    "app/page.tsx",
    "app/flow-experience.tsx",
    "app/not-found.tsx",
    "app/data/tracks.json",
    "public/manifest.webmanifest",
  ];
  const text = (await Promise.all(sourceFiles.map((file) => readFile(new URL(file, projectRoot), "utf8")))).join("\n");
  assert.doesNotMatch(text, /chief\s*keef|chiefkeef|chief-keef|love sosa|faneto|cki-/i);
});

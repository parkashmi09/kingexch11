// Generates src/constants/messages.js from the backend's server/constants/messages.js.
// Runs automatically on `npm run dev` / `npm run build` (predev / prebuild).
//
// The backend lives in a separate checkout, so when it can't be found this script
// warns and exits 0 — the committed src/constants/messages.js is left untouched and
// dev/build carry on. Point SERVER_MESSAGES at the backend file to force a path.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '..');
const OUT_FILE = path.join(frontendRoot, 'src', 'constants', 'messages.js');

// Keys the frontend actually uses. Add here (and to the backend file) for new messages.
const FRONTEND_NEEDS = {
    AUTH: ['LOGIN_FAILED', 'TERMS_AGREE_REQUIRED'],
    VALIDATION: ['FIELD_REQUIRED', 'USERNAME_REQUIRED', 'PASSWORD_REQUIRED'],
};

const CANDIDATES = [
    process.env.SERVER_MESSAGES,
    path.resolve(frontendRoot, '..', 'server', 'constants', 'messages.js'),
    path.resolve(frontendRoot, '..', 'backend', 'constants', 'messages.js'),
    path.resolve(frontendRoot, '..', '..', 'server', 'constants', 'messages.js'),
].filter(Boolean);

const source = CANDIDATES.find((p) => fs.existsSync(p));

if (!source) {
    console.warn(
        '[sync-messages] backend messages.js not found — skipping sync, keeping existing src/constants/messages.js.\n' +
        '[sync-messages] looked in:\n' + CANDIDATES.map((p) => `  - ${p}`).join('\n') + '\n' +
        '[sync-messages] set SERVER_MESSAGES=<path to server/constants/messages.js> to sync.'
    );
    process.exit(0);
}

const mod = await import(url.pathToFileURL(source).href);
const MESSAGES = mod.MESSAGES ?? mod.default?.MESSAGES ?? mod.default;

if (!MESSAGES || typeof MESSAGES !== 'object') {
    console.error(`[sync-messages] ${source} does not export MESSAGES`);
    process.exit(1);
}

const missing = [];
const picked = {};
for (const [group, keys] of Object.entries(FRONTEND_NEEDS)) {
    picked[group] = {};
    for (const key of keys) {
        const value = MESSAGES[group]?.[key];
        if (typeof value !== 'string') {
            missing.push(`${group}.${key}`);
            continue;
        }
        picked[group][key] = value;
    }
}

if (missing.length) {
    console.error(`[sync-messages] missing in backend messages.js: ${missing.join(', ')}`);
    process.exit(1);
}

const indent = (n) => ' '.repeat(n * 4);
const body = Object.entries(picked)
    .map(([group, entries]) => {
        const lines = Object.entries(entries)
            .map(([key, value]) => `${indent(2)}${key}: ${JSON.stringify(value)},`)
            .join('\n');
        return `${indent(1)}${group}: {\n${lines}\n${indent(1)}},`;
    })
    .join('\n');

const out = `// ⚠️ AUTO-GENERATED FILE — isko haath se edit mat karo, changes kho jayenge.
// Source of truth: server/constants/messages.js
// Naya message chahiye to backend file me add karo, fir scripts/sync-messages.mjs
// ki FRONTEND_NEEDS whitelist me key jodo aur: npm run sync-messages
// (npm run build / dev par ye sync khud ho jata hai)

export const MESSAGES = {
${body}
};
`;

const prev = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, 'utf8') : null;
if (prev === out) {
    console.log('[sync-messages] up to date.');
} else {
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, out);
    console.log(`[sync-messages] wrote src/constants/messages.js from ${source}`);
}

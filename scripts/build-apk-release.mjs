import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import c0 from './apk-payload/c0.js';
import c1 from './apk-payload/c1.js';
import c20 from './apk-payload/c20.js';
import c21 from './apk-payload/c21.js';
import c22 from './apk-payload/c22.js';
import c23 from './apk-payload/c23.js';
import c30 from './apk-payload/c30.js';
import c31 from './apk-payload/c31.js';
import c32 from './apk-payload/c32.js';
import c33 from './apk-payload/c33.js';
import c34 from './apk-payload/c34.js';
import c35 from './apk-payload/c35.js';
import c36 from './apk-payload/c36.js';
import c37 from './apk-payload/c37.js';

const payload = c0 + c1 + c20 + c21 + c22 + c23 + c30 + c31 + c32 + c33 + c34 + c35 + c36 + c37;
const apk = inflateSync(Buffer.from(payload, 'base64'));
const sha256 = createHash('sha256').update(apk).digest('hex');
const expectedSha256 = '8330d5c82ad219f259cf5c55093093cee064ee9e72c1643dfdc4feb35485843a';
const expectedBytes = 21183;

if (apk.length !== expectedBytes) throw new Error(`APK size mismatch: ${apk.length}`);
if (sha256 !== expectedSha256) throw new Error(`APK SHA-256 mismatch: ${sha256}`);

writeFileSync(new URL('../public/afterparty-firetv.apk', import.meta.url), apk);
console.log(`Fire TV APK reconstructed: ${apk.length} bytes, sha256=${sha256}`);

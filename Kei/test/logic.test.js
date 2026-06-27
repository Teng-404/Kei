'use strict';
// ทดสอบ logic ที่ไม่พึ่ง Discord / unit-test the Discord-independent logic
const assert = require('assert');
const os = require('os');
const path = require('path');
const fs = require('fs');

// ใช้ไฟล์ข้อมูลชั่วคราว / use a temp data file
const tmp = path.join(os.tmpdir(), `kei-test-${Date.now()}.json`);
process.env.DATA_FILE = tmp;
process.env.COOLDOWN_MS = '1000';

const { detectType } = require('../src/util/types');
const { guessExt } = require('../src/util/assets');
const { Cooldowns } = require('../src/util/cooldown');
const { TriggerStore } = require('../src/store');
const { buildDashboard } = require('../src/ui/dashboard');
const { parseTrigger, pickValue, buildReplyPayload } = require('../src/handlers/messageHandler');
const { assetsDir, defaultKeyword } = require('../src/config');

let passed = 0;
const ok = (name) => { passed++; console.log('  ✓', name); };

// --- detectType ---
assert.strictEqual(detectType('https://x.com/a.png'), 'image'); ok('detect image url');
assert.strictEqual(detectType('https://x.com/a.PNG?v=2'), 'image'); ok('detect image with query');
assert.strictEqual(detectType('https://x.com/page'), 'link'); ok('detect link');
assert.strictEqual(detectType('hello there'), 'text'); ok('detect text');

// --- guessExt ---
assert.strictEqual(guessExt('cat.GIF', null), '.gif'); ok('ext from filename');
assert.strictEqual(guessExt('', 'image/webp'), '.webp'); ok('ext from content-type');
assert.strictEqual(guessExt('', 'image/unknown'), '.img'); ok('ext fallback');

// --- store CRUD ---
const store = new TriggerStore(tmp);
store.add('Peak', 'https://x.com/1.png');
store.add('peak', 'PEAK!', { type: 'text' });
store.add('docs', 'https://discord.js.org');
assert.strictEqual(store.count(), 2, 'two unique keywords'); ok('add + case-insensitive merge');
assert.strictEqual(store.get('PEAK').values.length, 2); ok('multiple values per keyword');
assert.strictEqual(store.get('peak').values[0].type, 'image'); ok('auto type detect on add');

store.recordFire('peak'); store.recordFire('peak');
assert.strictEqual(store.get('peak').fired, 2); ok('recordFire increments');

assert.ok(store.removeValue('peak', 1)); 
assert.strictEqual(store.get('peak').values.length, 1); ok('removeValue by index');
assert.ok(store.remove('docs'));
assert.strictEqual(store.get('docs'), null); ok('remove keyword');

// persistence: reload from disk
const store2 = new TriggerStore(tmp);
assert.strictEqual(store2.count(), 1); ok('persists + reloads from disk');

// --- uploaded-file value + asset cleanup ---
fs.mkdirSync(assetsDir, { recursive: true });
const assetName = `unit-${Date.now()}.png`;
fs.writeFileSync(path.join(assetsDir, assetName), 'fakebytes');
store.add('logo', 'logo.png', { type: 'image', file: assetName });
const lv = store.get('logo').values[0];
assert.strictEqual(lv.file, assetName); ok('add stores file field');
assert.ok(fs.existsSync(path.join(assetsDir, assetName)), 'asset exists before remove');
store.remove('logo');
assert.ok(!fs.existsSync(path.join(assetsDir, assetName))); ok('removing keyword deletes its asset file');

// --- pickValue / buildReplyPayload ---
const tri = { values: [{ type: 'text', content: 'a' }, { type: 'text', content: 'b' }] };
for (let i = 0; i < 30; i++) assert.ok(['a', 'b'].includes(pickValue(tri).content));
ok('pickValue returns a member value');
assert.ok(buildReplyPayload({ type: 'text', content: 'hi' }).content === 'hi'); ok('text value -> content payload');
assert.ok(Array.isArray(buildReplyPayload({ type: 'image', content: 'x.png', file: 'x.png' }).files)); ok('file value -> files payload');

// --- cooldown ---
const cd = new Cooldowns(1000);
assert.strictEqual(cd.hit('u1'), 0); ok('first hit passes');
assert.ok(cd.hit('u1') > 0); ok('second hit blocked');
assert.strictEqual(cd.hit('u2'), 0); ok('different key independent');
assert.strictEqual(new Cooldowns(0).hit('x'), 0); ok('cooldown 0 = disabled');

// --- dashboard build ---
const many = [];
for (let i = 0; i < 20; i++) {
  many.push({ keyword: `kw${String(i).padStart(2,'0')}`, values: [{ type:'text', content:'v'}], createdAt: i, updatedAt: 100 - i, fired: i, createdBy: null });
}
const d = buildDashboard(many, { page: 2, sort: 'alpha' });
assert.strictEqual(d.embeds.length, 1); ok('dashboard returns embed');
assert.strictEqual(d.components.length, 3); ok('dashboard has sort+nav+tools rows');
assert.ok(d.embeds[0].data.footer.text.includes('Page 2/3')); ok('footer page count correct');
assert.ok(d.embeds[0].data.footer.text.includes('20 keywords')); ok('footer keyword count');
const dz = buildDashboard(many, { page: 999, sort: 'fired' });
assert.ok(dz.embeds[0].data.footer.text.includes('Page 3/3')); ok('page clamps to max');
const dt = buildDashboard(many, { page: 1, sort: 'fired' });
assert.strictEqual(dt.embeds[0].data.fields[0].name, '.kw19'); ok('top-fired sort order');
// file value preview marks attachment
const df = buildDashboard([{ keyword:'k', values:[{type:'image',content:'a.png',file:'a.png'}], createdAt:1, updatedAt:1, fired:0 }], { page:1, sort:'alpha' });
assert.ok(df.embeds[0].data.fields[0].value.includes('ไฟล์แนบ')); ok('uploaded file marked in preview');

// --- parseTrigger ---
const BOT='111';
const mkMsg = (content, mentioned=false) => ({ content, mentions: { users: { has: (id) => mentioned && id===BOT } } });
assert.deepStrictEqual(parseTrigger(mkMsg('.peak'), BOT), { keyword: 'peak' }); ok('dot trigger parsed');
assert.strictEqual(parseTrigger(mkMsg('..'), BOT), null); ok('".." ignored');
assert.strictEqual(parseTrigger(mkMsg('...lol'), BOT), null); ok('"...lol" ignored');
assert.strictEqual(parseTrigger(mkMsg('hello'), BOT), null); ok('plain text ignored');
assert.deepStrictEqual(parseTrigger(mkMsg('<@111> peak', true), BOT), { keyword: 'peak' }); ok('mention + keyword parsed');
assert.deepStrictEqual(parseTrigger(mkMsg('<@111>', true), BOT), { keyword: defaultKeyword }); ok('bare mention -> default keyword');

fs.unlinkSync(tmp);
console.log(`\nAll ${passed} checks passed`);

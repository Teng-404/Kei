'use strict';

const fs = require('fs');
const path = require('path');
const { assetsDir } = require('../config');

// เดานามสกุลไฟล์จาก content-type / map content-type -> extension
const EXT_BY_MIME = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/bmp': '.bmp',
  'image/svg+xml': '.svg',
};

function guessExt(name, contentType) {
  const e = path.extname(name || '');
  if (e) return e.toLowerCase();
  return EXT_BY_MIME[String(contentType || '').split(';')[0]] || '.img';
}

// path จริงของ asset / absolute path of a stored asset
function assetPath(file) {
  return path.join(assetsDir, file);
}

/**
 * ดาวน์โหลดไฟล์แนบจาก Discord มาเก็บไว้ในเครื่อง / download a Discord attachment locally.
 * คืนชื่อไฟล์ (relative ต่อ assetsDir) เพื่อนำไปเก็บใน store
 * @param {{ url: string, name?: string, contentType?: string }} attachment
 * @param {string} keyword
 * @returns {Promise<string>} relative filename
 */
async function saveAttachment(attachment, keyword) {
  const res = await fetch(attachment.url);
  if (!res.ok) throw new Error(`ดาวน์โหลดไฟล์ไม่สำเร็จ (HTTP ${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());

  fs.mkdirSync(assetsDir, { recursive: true });
  const ext = guessExt(attachment.name, attachment.contentType);
  const safe = String(keyword).replace(/[^\p{L}\p{N}_-]/gu, '_').slice(0, 32) || 'kw';
  const fname = `${safe}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  fs.writeFileSync(path.join(assetsDir, fname), buf);
  return fname;
}

// ลบไฟล์ asset ทิ้ง (เงียบถ้าไม่มี) / delete a stored asset, silent if missing
function removeAsset(file) {
  if (!file) return;
  try {
    fs.unlinkSync(path.join(assetsDir, file));
  } catch {
    /* หายไปแล้ว ไม่เป็นไร */
  }
}

module.exports = { saveAttachment, assetPath, removeAsset, guessExt };

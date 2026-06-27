'use strict';
require('dotenv').config();
const path = require('path');

// ตำแหน่งไฟล์เก็บข้อมูล / data file location
const dataFile = process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'triggers.json');

// ค่าตั้งค่าทั้งหมดของบอท / Central bot configuration
module.exports = {
  // โทเคนของบอท (จำเป็น) / Discord bot token (required)
  token: process.env.BOT_TOKEN,

  // ลงทะเบียน slash command เฉพาะกิลด์นี้เพื่อให้ขึ้นทันที (ออปชัน)
  guildId: process.env.GUILD_ID || null,

  // ตัวนำหน้าคีย์เวิร์ด / keyword prefix
  prefix: process.env.PREFIX || '.',

  // จำนวน trigger ต่อหน้าใน /triggers
  perPage: Number(process.env.PER_PAGE) || 8,

  dataFile,

  // โฟลเดอร์เก็บรูปที่อัปโหลดแนบ / where uploaded image attachments are stored
  assetsDir: process.env.ASSETS_DIR || path.join(path.dirname(dataFile), 'assets'),

  // คีย์เวิร์ดที่ยิงเมื่อ @mention บอทเปล่าๆ / keyword fired on a bare @mention
  defaultKeyword: (process.env.DEFAULT_KEYWORD || 'kei').trim().toLowerCase(),

  // คูลดาวน์ต่อผู้ใช้ (มิลลิวินาที, 0 = ปิด) / per-user cooldown in ms (0 disables)
  cooldownMs: process.env.COOLDOWN_MS != null ? Math.max(0, Number(process.env.COOLDOWN_MS) || 0) : 3000,

  // ขนาดไฟล์อัปโหลดสูงสุด / max upload size
  maxUploadBytes: (Number(process.env.MAX_UPLOAD_MB) || 25) * 1024 * 1024,
};

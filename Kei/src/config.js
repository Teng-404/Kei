'use strict';
require('dotenv').config();

// ค่าตั้งค่าทั้งหมดของบอท / Central bot configuration
module.exports = {
  // โทเคนของบอท (จำเป็น) / Discord bot token (required)
  token: process.env.BOT_TOKEN,

  // ลงทะเบียน slash command เฉพาะกิลด์นี้เพื่อให้ขึ้นทันที (ออปชัน)
  // Register slash commands to this guild for instant availability (optional).
  // เว้นว่างไว้ = ลงทะเบียนแบบ global (ใช้เวลาแพร่กระจายสักครู่)
  guildId: process.env.GUILD_ID || null,

  // ตัวนำหน้าคีย์เวิร์ด / keyword prefix
  prefix: process.env.PREFIX || '.',

  // จำนวน trigger ต่อหน้าใน /triggers
  perPage: Number(process.env.PER_PAGE) || 8,

  // ตำแหน่งไฟล์เก็บข้อมูล / data file location
  dataFile: process.env.DATA_FILE || require('path').join(__dirname, '..', 'data', 'triggers.json'),
};

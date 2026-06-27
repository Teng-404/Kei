'use strict';

const { prefix, defaultKeyword, cooldownMs } = require('../config');
const { assetPath } = require('../util/assets');
const { Cooldowns } = require('../util/cooldown');

// ดึงคีย์เวิร์ดจากข้อความ / extract keyword from an incoming message
// คืน { keyword } เมื่อเจอ หรือ null
function parseTrigger(message, botId) {
  const content = (message.content || '').trim();

  // วิธีที่ 1: mention บอท / mention syntax
  const mentioned = message.mentions.users.has(botId);
  if (mentioned) {
    const stripped = content
      .replace(new RegExp(`<@!?${botId}>`, 'g'), ' ')
      .trim();
    const keyword = stripped.split(/\s+/)[0];
    // mention เปล่า = ยิงคีย์เวิร์ดเริ่มต้น (ส่งรูป) / bare mention -> default keyword
    if (!keyword) return { keyword: defaultKeyword };
    return { keyword };
  }

  // วิธีที่ 2: จุดนำหน้า เช่น ".peak" / dot-prefix syntax
  if (content.startsWith(prefix) && content.length > prefix.length) {
    const rest = content.slice(prefix.length);
    // กันกรณี ".." หรือ "...777" ที่ขึ้นต้นด้วยอักขระไม่ใช่คีย์เวิร์ด
    if (!/^[\p{L}\p{N}_-]/u.test(rest)) return null;
    const keyword = rest.split(/\s+/)[0];
    if (keyword) return { keyword };
  }

  return null;
}

// สุ่มเลือกค่าหนึ่งค่าจาก trigger / pick a single random value
function pickValue(trigger) {
  const vals = trigger.values;
  if (!vals || vals.length === 0) return null;
  return vals[Math.floor(Math.random() * vals.length)];
}

// สร้าง payload สำหรับตอบกลับค่าหนึ่งค่า / build the reply payload for one value
function buildReplyPayload(value) {
  const base = { allowedMentions: { repliedUser: false } };
  if (value.file) {
    // รูปที่อัปโหลดไว้ → ส่งเป็นไฟล์แนบจริง / uploaded image -> send as a real attachment
    return { ...base, files: [{ attachment: assetPath(value.file), name: value.content || 'image' }] };
  }
  // ข้อความ/ลิงก์/URL รูป → ส่งเป็นข้อความ (Discord จะ embed ให้เอง)
  return { ...base, content: String(value.content).slice(0, 2000) };
}

function createMessageHandler(client, store) {
  const cooldowns = new Cooldowns(cooldownMs);

  return async function onMessage(message) {
    if (message.author.bot || !message.guild) return; // ข้ามบอทและ DM

    const parsed = parseTrigger(message, client.user.id);
    if (!parsed) return;

    const trigger = store.get(parsed.keyword);
    if (!trigger || trigger.values.length === 0) return; // ไม่พบ = เงียบไว้ (ไม่บอกวิธีใช้)

    // คูลดาวน์กันสแปม (ต่อผู้ใช้ต่อกิลด์) — ติดคูลดาวน์ก็เงียบไว้
    const remain = cooldowns.hit(`${message.guildId}:${message.author.id}`);
    if (remain > 0) return;

    const value = pickValue(trigger);
    if (!value) return;

    store.recordFire(trigger.keyword);
    try {
      await message.reply(buildReplyPayload(value));
    } catch (err) {
      console.error('[message] failed to fire trigger:', err.message);
    }
  };
}

module.exports = { createMessageHandler, parseTrigger, pickValue, buildReplyPayload };

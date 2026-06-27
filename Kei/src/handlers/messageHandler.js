'use strict';

const { prefix } = require('../config');

// ดึงคีย์เวิร์ดจากข้อความ / extract keyword from an incoming message
// คืน { keyword } เมื่อเจอ, { help: true } เมื่อ mention เปล่า, หรือ null
function parseTrigger(message, botId) {
  const content = (message.content || '').trim();

  // วิธีที่ 1: mention บอท เช่น "@Kei peak" / mention syntax
  const mentioned = message.mentions.users.has(botId);
  if (mentioned) {
    const stripped = content
      .replace(new RegExp(`<@!?${botId}>`, 'g'), ' ')
      .trim();
    const keyword = stripped.split(/\s+/)[0];
    if (!keyword) return { help: true }; // mention เปล่า = แสดงคำใบ้
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

// ส่งทุกค่าที่ผูกไว้กลับไป / fire all bound values back to the channel
async function fireTrigger(message, trigger) {
  const body = trigger.values.map((v) => v.content).join('\n').slice(0, 2000);
  await message.reply({ content: body, allowedMentions: { repliedUser: false } });
}

function createMessageHandler(client, store) {
  return async function onMessage(message) {
    if (message.author.bot || !message.guild) return; // ข้ามบอทและ DM

    const parsed = parseTrigger(message, client.user.id);
    if (!parsed) return;

    if (parsed.help) {
      await message.reply({
        content:
          `เรียก trigger ได้สองวิธี:\n` +
          `• \`${prefix}คีย์เวิร์ด\` เช่น \`${prefix}peak\`\n` +
          `• \`@${client.user.username} คีย์เวิร์ด\`\n` +
          `ดูคีย์เวิร์ดทั้งหมดด้วย \`/triggers\``,
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    const trigger = store.get(parsed.keyword);
    if (!trigger || trigger.values.length === 0) return; // ไม่พบ = เงียบไว้

    store.recordFire(trigger.keyword);
    try {
      await fireTrigger(message, trigger);
    } catch (err) {
      console.error('[message] failed to fire trigger:', err.message);
    }
  };
}

module.exports = { createMessageHandler, parseTrigger };

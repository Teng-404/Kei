'use strict';

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const { perPage } = require('../config');
const { typeIcon } = require('../util/types');

// ตัวเลือกการจัดเรียง / available sort orders (matches README)
const SORTS = {
  updated: { label: 'Date updated', cmp: (a, b) => b.updatedAt - a.updatedAt },
  created: { label: 'Date created', cmp: (a, b) => b.createdAt - a.createdAt },
  fired: { label: 'Top fired', cmp: (a, b) => (b.fired || 0) - (a.fired || 0) || a.keyword.localeCompare(b.keyword) },
  alpha: { label: 'Alphabetical', cmp: (a, b) => a.keyword.localeCompare(b.keyword) },
};

const DEFAULT_SORT = 'updated';

function clampPage(page, total) {
  return Math.min(Math.max(1, page | 0 || 1), Math.max(1, total));
}

// พรีวิวทุกค่าที่ผูกกับคีย์เวิร์ด / preview every value bound to a keyword
function previewValues(trigger) {
  return trigger.values
    .map((v, i) => {
      const raw = v.content.replace(/\n+/g, ' ');
      const text = raw.length > 80 ? `${raw.slice(0, 77)}…` : raw;
      let label;
      if (v.file) {
        label = `\`${text}\` 📎 *(ไฟล์แนบ)*`; // รูปที่อัปโหลดไว้ ไม่มี URL ให้ลิงก์
      } else if (v.type === 'text') {
        label = text;
      } else {
        label = `[${v.type}](${v.content}) — \`${text}\``;
      }
      return `\`${i + 1}.\` ${typeIcon(v.type)} ${label}`;
    })
    .join('\n');
}

/**
 * สร้างแดชบอร์ด /triggers / build the /triggers dashboard payload.
 * @param {object[]} triggers
 * @param {{ page?: number, sort?: string }} opts
 */
function buildDashboard(triggers, { page = 1, sort = DEFAULT_SORT } = {}) {
  const sortKey = SORTS[sort] ? sort : DEFAULT_SORT;
  const sorted = [...triggers].sort(SORTS[sortKey].cmp);

  const totalAssets = sorted.reduce((n, t) => n + t.values.length, 0);
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const current = clampPage(page, totalPages);
  const slice = sorted.slice((current - 1) * perPage, current * perPage);

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setAuthor({ name: 'Kei · Triggers' })
    .setFooter({
      text:
        `Page ${current}/${totalPages}  •  ` +
        `${sorted.length} keyword${sorted.length === 1 ? '' : 's'}  •  ` +
        `${totalAssets} asset${totalAssets === 1 ? '' : 's'}  •  ` +
        `Sorted by ${SORTS[sortKey].label}`,
    });

  if (slice.length === 0) {
    embed.setDescription('ยังไม่มี trigger เลย — เพิ่มด้วย `/trigger add`\nNo triggers yet — add one with `/trigger add`.');
  } else {
    for (const t of slice) {
      const meta = `fired ${t.fired || 0}× • updated <t:${Math.floor(t.updatedAt / 1000)}:R>`;
      const value = `${previewValues(t)}\n*${meta}*`;
      embed.addFields({ name: `.${t.keyword}`, value: value.slice(0, 1024) });
    }
  }

  // แถวเลือกการจัดเรียง / sort select menu
  const sortRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('triggers:sort')
      .setPlaceholder('Sort by…')
      .addOptions(
        Object.entries(SORTS).map(([key, def]) => ({
          label: def.label,
          value: key,
          default: key === sortKey,
        })),
      ),
  );

  // แถวเลื่อนหน้า / pagination row
  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`triggers:nav:1:${sortKey}`).setEmoji('⏮️').setStyle(ButtonStyle.Secondary).setDisabled(current === 1),
    new ButtonBuilder().setCustomId(`triggers:nav:${current - 1}:${sortKey}`).setEmoji('◀️').setStyle(ButtonStyle.Secondary).setDisabled(current === 1),
    new ButtonBuilder().setCustomId('triggers:noop').setLabel(`${current} / ${totalPages}`).setStyle(ButtonStyle.Secondary).setDisabled(true),
    new ButtonBuilder().setCustomId(`triggers:nav:${current + 1}:${sortKey}`).setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(current === totalPages),
    new ButtonBuilder().setCustomId(`triggers:nav:${totalPages}:${sortKey}`).setEmoji('⏭️').setStyle(ButtonStyle.Secondary).setDisabled(current === totalPages),
  );

  // แถวเครื่องมือ / tools row (jump + refresh)
  const toolRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`triggers:jump:${current}:${sortKey}`).setEmoji('🔢').setLabel('Jump to page').setStyle(ButtonStyle.Primary).setDisabled(totalPages <= 1),
    new ButtonBuilder().setCustomId(`triggers:nav:${current}:${sortKey}`).setEmoji('🔄').setLabel('Refresh').setStyle(ButtonStyle.Secondary),
  );

  return { embeds: [embed], components: [sortRow, navRow, toolRow] };
}

module.exports = { buildDashboard, SORTS, DEFAULT_SORT, clampPage };

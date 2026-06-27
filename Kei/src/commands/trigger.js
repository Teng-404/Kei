'use strict';

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { typeIcon } = require('../util/types');
const { saveAttachment } = require('../util/assets');
const { maxUploadBytes } = require('../config');

// คำสั่ง /trigger — จัดการ trigger (เพิ่ม/ลบ/ดูข้อมูล)
module.exports = {
  data: new SlashCommandBuilder()
    .setName('trigger')
    .setDescription('จัดการ trigger ของ Kei / Manage Kei triggers')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) =>
      s
        .setName('add')
        .setDescription('เพิ่มค่าให้คีย์เวิร์ด / bind a value to a keyword')
        .addStringOption((o) => o.setName('keyword').setDescription('คีย์เวิร์ด เช่น peak').setRequired(true))
        .addStringOption((o) => o.setName('value').setDescription('ข้อความ / ลิงก์ / URL รูป (เว้นได้ถ้าแนบไฟล์)'))
        .addAttachmentOption((o) => o.setName('file').setDescription('อัปโหลดรูปแนบโดยตรง / upload an image file'))
        .addStringOption((o) =>
          o
            .setName('type')
            .setDescription('บังคับชนิดของ value (ปล่อยว่างให้ตรวจอัตโนมัติ)')
            .addChoices(
              { name: 'image', value: 'image' },
              { name: 'link', value: 'link' },
              { name: 'text', value: 'text' },
            ),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName('remove')
        .setDescription('ลบคีย์เวิร์ด หรือเฉพาะค่าหนึ่งค่า / remove a keyword or one value')
        .addStringOption((o) => o.setName('keyword').setDescription('คีย์เวิร์ดที่จะลบ').setRequired(true))
        .addIntegerOption((o) => o.setName('index').setDescription('ลำดับค่าที่จะลบ (เว้นว่าง = ลบทั้งคีย์เวิร์ด)').setMinValue(1)),
    )
    .addSubcommand((s) =>
      s
        .setName('info')
        .setDescription('ดูรายละเอียดของคีย์เวิร์ด / inspect a keyword')
        .addStringOption((o) => o.setName('keyword').setDescription('คีย์เวิร์ด').setRequired(true)),
    ),

  async execute(interaction, store) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const keyword = interaction.options.getString('keyword');
      const value = interaction.options.getString('value');
      const file = interaction.options.getAttachment('file');
      const type = interaction.options.getString('type') || undefined;

      if (!value && !file) {
        await interaction.reply({ content: '❌ ต้องระบุ `value` หรือแนบ `file` อย่างน้อยหนึ่งอย่าง', flags: MessageFlags.Ephemeral });
        return;
      }

      // มีไฟล์ = อาจต้องดาวน์โหลด → defer ก่อน / downloading may take a moment
      if (file) await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const reply = (payload) => (file ? interaction.editReply(payload) : interaction.reply({ ...payload, flags: MessageFlags.Ephemeral }));

      const lines = [];
      try {
        if (file) {
          if (!String(file.contentType || '').startsWith('image/')) {
            throw new Error('แนบได้เฉพาะไฟล์รูปภาพ / attachment must be an image');
          }
          if (file.size > maxUploadBytes) {
            throw new Error(`ไฟล์ใหญ่เกินไป จำกัด ${Math.round(maxUploadBytes / 1024 / 1024)}MB`);
          }
          const stored = await saveAttachment(file, keyword);
          const t = store.add(keyword, file.name || 'image', { type: 'image', userId: interaction.user.id, file: stored });
          lines.push(`🖼️ image (ไฟล์แนบ \`${file.name || 'image'}\`) — รวม ${t.values.length} ค่า`);
        }
        if (value) {
          const t = store.add(keyword, value, { type, userId: interaction.user.id });
          const last = t.values[t.values.length - 1];
          lines.push(`${typeIcon(last.type)} ${last.type} — รวม ${t.values.length} ค่า`);
        }
      } catch (err) {
        await reply({ content: `❌ ${err.message}` });
        return;
      }

      const key = store.constructor.norm(keyword);
      await reply({ content: `✅ เพิ่มค่าให้ \`.${key}\` แล้ว:\n• ${lines.join('\n• ')}` });
      return;
    }

    if (sub === 'remove') {
      const keyword = interaction.options.getString('keyword');
      const index = interaction.options.getInteger('index');
      if (index == null) {
        const ok = store.remove(keyword);
        await interaction.reply({
          content: ok ? `🗑️ ลบ \`.${store.constructor.norm(keyword)}\` ทั้งหมดแล้ว` : '❌ ไม่พบคีย์เวิร์ดนี้',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        const ok = store.removeValue(keyword, index);
        await interaction.reply({
          content: ok ? `🗑️ ลบค่าลำดับ ${index} ของ \`.${store.constructor.norm(keyword)}\` แล้ว` : '❌ ไม่พบคีย์เวิร์ดหรือลำดับนั้น',
          flags: MessageFlags.Ephemeral,
        });
      }
      return;
    }

    if (sub === 'info') {
      const t = store.get(interaction.options.getString('keyword'));
      if (!t) {
        await interaction.reply({ content: '❌ ไม่พบคีย์เวิร์ดนี้', flags: MessageFlags.Ephemeral });
        return;
      }
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`.${t.keyword}`)
        .setDescription(
          t.values
            .map((v, i) => `\`${i + 1}.\` ${typeIcon(v.type)} **${v.type}** — ${v.content}${v.file ? ' *(ไฟล์แนบ)*' : ''}`)
            .join('\n')
            .slice(0, 4000),
        )
        .addFields(
          { name: 'Fired', value: `${t.fired || 0}×`, inline: true },
          { name: 'Created', value: `<t:${Math.floor(t.createdAt / 1000)}:R>`, inline: true },
          { name: 'Updated', value: `<t:${Math.floor(t.updatedAt / 1000)}:R>`, inline: true },
        );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  },
};

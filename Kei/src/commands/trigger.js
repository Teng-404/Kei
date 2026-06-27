'use strict';

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { typeIcon } = require('../util/types');

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
        .addStringOption((o) => o.setName('value').setDescription('รูปภาพ(URL) / ข้อความ / ลิงก์').setRequired(true))
        .addStringOption((o) =>
          o
            .setName('type')
            .setDescription('บังคับชนิด (ปล่อยว่างให้ตรวจอัตโนมัติ)')
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
      const type = interaction.options.getString('type') || undefined;
      try {
        const t = store.add(keyword, value, { type, userId: interaction.user.id });
        const last = t.values[t.values.length - 1];
        await interaction.reply({
          content: `ผูกค่าให้ \`.${t.keyword}\` แล้ว (${typeIcon(last.type)} ${last.type}) — ตอนนี้มี ${t.values.length} ค่า`,
          flags: MessageFlags.Ephemeral,
        });
      } catch (err) {
        await interaction.reply({ content: `${err.message}`, flags: MessageFlags.Ephemeral });
      }
      return;
    }

    if (sub === 'remove') {
      const keyword = interaction.options.getString('keyword');
      const index = interaction.options.getInteger('index');
      if (index == null) {
        const ok = store.remove(keyword);
        await interaction.reply({
          content: ok ? `ลบ \`.${store.constructor.norm(keyword)}\` ทั้งหมดแล้ว` : '❌ ไม่พบคีย์เวิร์ดนี้',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        const ok = store.removeValue(keyword, index);
        await interaction.reply({
          content: ok ? `ลบค่าลำดับ ${index} ของ \`.${store.constructor.norm(keyword)}\` แล้ว` : '❌ ไม่พบคีย์เวิร์ดหรือลำดับนั้น',
          flags: MessageFlags.Ephemeral,
        });
      }
      return;
    }

    if (sub === 'info') {
      const t = store.get(interaction.options.getString('keyword'));
      if (!t) {
        await interaction.reply({ content: 'ไม่พบคีย์เวิร์ดนี้', flags: MessageFlags.Ephemeral });
        return;
      }
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`.${t.keyword}`)
        .setDescription(
          t.values.map((v, i) => `\`${i + 1}.\` ${typeIcon(v.type)} **${v.type}** — ${v.content}`).join('\n').slice(0, 4000),
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

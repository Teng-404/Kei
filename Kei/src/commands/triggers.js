'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildDashboard } = require('../ui/dashboard');

// คำสั่ง /triggers — แดชบอร์ดเรียกดูคีย์เวิร์ดทั้งหมด
module.exports = {
  data: new SlashCommandBuilder()
    .setName('triggers')
    .setDescription('เปิดแดชบอร์ดดู trigger ทั้งหมด / Browse every keyword trigger')
    .addStringOption((o) =>
      o
        .setName('sort')
        .setDescription('การจัดเรียงเริ่มต้น / initial sort order')
        .addChoices(
          { name: 'Date updated', value: 'updated' },
          { name: 'Date created', value: 'created' },
          { name: 'Top fired', value: 'fired' },
          { name: 'Alphabetical', value: 'alpha' },
        ),
    ),

  async execute(interaction, store) {
    const sort = interaction.options.getString('sort') || 'updated';
    const payload = buildDashboard(store.all(), { page: 1, sort });
    await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral });
  },
};

'use strict';

const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { buildDashboard, clampPage } = require('../ui/dashboard');

function createInteractionHandler(client, store) {
  return async function onInteraction(interaction) {
    try {
      // ---- slash command ----
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, store);
        return;
      }

      // ---- ปุ่มของแดชบอร์ด / dashboard buttons ----
      if (interaction.isButton()) {
        const [ns, action, ...args] = interaction.customId.split(':');
        if (ns !== 'triggers') return;

        if (action === 'noop') {
          await interaction.deferUpdate();
          return;
        }

        if (action === 'nav') {
          const [page, sort] = args;
          const payload = buildDashboard(store.all(), { page: Number(page), sort });
          await interaction.update(payload);
          return;
        }

        if (action === 'jump') {
          const [page, sort] = args;
          const modal = new ModalBuilder()
            .setCustomId(`triggers:jumpmodal:${sort}`)
            .setTitle('ไปยังหน้า / Jump to page')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('page')
                  .setLabel('หมายเลขหน้า / page number')
                  .setStyle(TextInputStyle.Short)
                  .setPlaceholder(page)
                  .setRequired(true),
              ),
            );
          await interaction.showModal(modal);
          return;
        }
      }

      // ---- เมนูจัดเรียง / sort select menu ----
      if (interaction.isStringSelectMenu() && interaction.customId === 'triggers:sort') {
        const sort = interaction.values[0];
        const payload = buildDashboard(store.all(), { page: 1, sort });
        await interaction.update(payload);
        return;
      }

      // ---- ส่ง modal ไปยังหน้า / jump modal submit ----
      if (interaction.isModalSubmit() && interaction.customId.startsWith('triggers:jumpmodal:')) {
        const sort = interaction.customId.split(':')[2];
        const raw = parseInt(interaction.fields.getTextInputValue('page'), 10);
        const page = clampPage(Number.isNaN(raw) ? 1 : raw, Number.MAX_SAFE_INTEGER);
        const payload = buildDashboard(store.all(), { page, sort });
        await interaction.update(payload);
        return;
      }
    } catch (err) {
      console.error('[interaction] error:', err);
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง', ephemeral: true }).catch(() => {});
      }
    }
  };
}

module.exports = { createInteractionHandler };

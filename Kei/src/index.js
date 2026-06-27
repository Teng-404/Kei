'use strict';

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');

const config = require('./config');
const { TriggerStore } = require('./store');
const { createMessageHandler } = require('./handlers/messageHandler');
const { createInteractionHandler } = require('./handlers/interactionHandler');

if (!config.token) {
  console.error('❌ ไม่พบ BOT_TOKEN — ตั้งค่าในไฟล์ .env ก่อน / set BOT_TOKEN in .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // ต้องเปิด privileged intent นี้ใน Developer Portal
  ],
});

const store = new TriggerStore();

// โหลดคำสั่งจากโฟลเดอร์ commands/ / load slash commands
client.commands = new Collection();
const commandsDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsDir).filter((f) => f.endsWith('.js'))) {
  const command = require(path.join(commandsDir, file));
  if (command?.data?.name) client.commands.set(command.data.name, command);
}

// ลงทะเบียนคำสั่งเมื่อบอทพร้อม / register commands on ready (token-only setup)
client.once(Events.ClientReady, async (c) => {
  console.log(`ล็อกอินเป็น ${c.user.tag} — โหลด ${store.count()} triggers`);
  const body = [...client.commands.values()].map((cmd) => cmd.data.toJSON());
  try {
    if (config.guildId) {
      const guild = await c.guilds.fetch(config.guildId);
      await guild.commands.set(body);
      console.log(`📌 ลงทะเบียนคำสั่งในกิลด์ ${config.guildId} แล้ว`);
    } else {
      await c.application.commands.set(body);
      console.log('ลงทะเบียนคำสั่งแบบ global แล้ว (อาจใช้เวลาแพร่กระจายสักครู่)');
    }
  } catch (err) {
    console.error('[ready] ลงทะเบียนคำสั่งล้มเหลว:', err.message);
  }
});

client.on(Events.MessageCreate, createMessageHandler(client, store));
client.on(Events.InteractionCreate, createInteractionHandler(client, store));

client.on(Events.Error, (e) => console.error('[client] error:', e));
process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));

client.login(config.token);

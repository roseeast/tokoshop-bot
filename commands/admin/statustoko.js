const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');
const cron = require('node-cron');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('statustoko')
    .setDescription('🔧 Ubah status toko (buka / tutup)')
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Pilih status toko')
        .setRequired(true)
        .addChoices(
          { name: '🟢 Buka', value: 'open' },
          { name: '🔴 Tutup', value: 'close' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const status = interaction.options.getString('status');
    const member = interaction.member;
    const ADMIN_ROLE_ID = config.ADMIN_ROLE_ID;
    const CHANNEL_ID = config.CHANNEL_TOKO_ID;

    if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
      return interaction.reply({
        content: '🚫 Kamu tidak punya izin untuk menggunakan perintah ini.',
        ephemeral: true
      });
    }

    const isOpen = status === 'open';
    const embed = createEmbed(isOpen);
    const channel = interaction.client.channels.cache.get(CHANNEL_ID);

    if (!channel) {
      return interaction.reply({ content: '❌ Channel toko tidak ditemukan.', ephemeral: true });
    }

    await channel.send({
      content: '@everyone',
      embeds: [embed],
      allowedMentions: { parse: ['everyone'] }
    });

    await interaction.reply({
      content: `✅ Status toko berhasil diubah menjadi **${isOpen ? 'BUKA' : 'TUTUP'}**.`,
      ephemeral: true
    });
  },

  async init(client) {
    const CHANNEL_ID = config.CHANNEL_TOKO_ID;

    cron.schedule('0 7 * * *', async () => {
      await sendAutoMessage(client, CHANNEL_ID, true);
      console.log('[AUTO] 🟢 Toko dibuka otomatis jam 07:00');
    }, {
      timezone: 'Asia/Jakarta'
    });

    cron.schedule('0 23 * * *', async () => {
      await sendAutoMessage(client, CHANNEL_ID, false);
      console.log('[AUTO] 🔴 Toko ditutup otomatis jam 22:00');
    }, {
      timezone: 'Asia/Jakarta'
    });
  }
};

function createEmbed(isOpen) {
  return new EmbedBuilder()
    .setTitle(isOpen ? '🛍️ Toko Dibuka' : '🔒 Toko Ditutup')
    .setDescription(
      isOpen
        ? '✨ Toko telah **dibuka!**\nSilakan order via PM atau buat tiket.'
        : '📴 Toko sementara **ditutup.**\nTunggu info selanjutnya ya.'
    )
    .setImage(
      isOpen
        ? ''
        : ''
    )
    .setColor(isOpen ? 0x57F287 : 0xED4245)
    .setFooter({ text: '🛒 Boto Store' })
    .setTimestamp();
}

async function sendAutoMessage(client, channelId, isOpen) {
  try {
    const channel = client.channels.cache.get(channelId);
    if (!channel) return console.log('⚠️ Channel toko tidak ditemukan');

    const embed = createEmbed(isOpen);
    await channel.send({
      content: '@everyone',
      embeds: [embed],
      allowedMentions: { parse: ['everyone'] }
    });
  } catch (err) {
    console.error('❌ Gagal kirim pesan otomatis:', err);
  }
}
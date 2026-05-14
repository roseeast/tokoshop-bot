const { EmbedBuilder } = require('discord.js');
const { SELLER_ROLE_ID } = require('../config.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'confirm_payment') return;

    const { user, member, channel } = interaction;

    if (!member.roles.cache.has(SELLER_ROLE_ID)) {
      return interaction.reply({ content: '❌ Kamu tidak punya izin untuk mengkonfirmasi pembayaran.', ephemeral: true });
    }

        const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('✅ Pembayaran Dikonfirmasi!')
      .setDescription(
        `📢 **Pembayaran kamu sudah dikonfirmasi oleh seller!**\n` +
        `🎁 Harap tunggu, produk akan segera dikirimkan.\n\n` +
        `Terima kasih telah berbelanja di Bot TokoShop 🛍️`
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    await interaction.reply({ content: '✅ Konfirmasi pembayaran berhasil dikirim!', ephemeral: true });
  }
};
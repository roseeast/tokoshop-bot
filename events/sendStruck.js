
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField,
} = require('discord.js');

const { SELLER_ROLE_ID } = require('../config.json');
const LOG_STRUK_CHANNEL_ID = '1503215681909293088';

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {

    if (interaction.isButton() && interaction.customId === 'send_struk') {
      const modal = new ModalBuilder()
        .setCustomId('upload_struk')
        .setTitle('🧾 Upload Struk Pembayaran')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('product_name')
              .setLabel('Nama Produk')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Contoh: gamemode')
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('product_price')
              .setLabel('Harga Produk (Rp)')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Contoh: 50000')
              .setRequired(true)
          )
        );
      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'upload_struk') {
      const productName  = interaction.fields.getTextInputValue('product_name');
      const productPrice = interaction.fields.getTextInputValue('product_price');

      await interaction.reply({
        content: '✅ Silakan upload **gambar struk** di ticket ini (60 detik).',
        flags: 1 << 6
      });

      const collector = interaction.channel.createMessageCollector({
        filter: m => m.author.id === interaction.user.id && m.attachments.size > 0,
        max: 1,
        time: 60_000
      });

      collector.on('collect', async m => {
        const struk = m.attachments.first();

        const embed = new EmbedBuilder()
          .setTitle('🧾 Struk Pembayaran')
          .setDescription(
            `📛 **Produk:** ${productName}\n` +
            `💸 **Harga:** Rp ${Number(productPrice).toLocaleString('id-ID')}\n` +
            `👤 **Pembeli:** <@${interaction.user.id}>`
          )
          .setImage(struk.url)
          .setColor('Green')
          .setTimestamp();

        const confirmRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`confirm_payment_${interaction.user.id}`)
            .setLabel('✅ Konfirmasi Pembayaran')
            .setStyle(ButtonStyle.Success)
        );

        await interaction.channel.send({ embeds: [embed], components: [confirmRow] });

        const logChannel = m.guild.channels.cache.get(LOG_STRUK_CHANNEL_ID);
        if (logChannel) {
          await logChannel.send({
            content: `📩 Ticket \`${interaction.channel.name}\` mengirim struk! Mohon dicek oleh <@&${SELLER_ROLE_ID}>.`,
            embeds: [embed]
          });
        }

        await m.reply({ content: '✅ Struk berhasil dikirim!', flags: 1 << 6 });
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          interaction.followUp({
            content: '❌ Waktu upload struk habis. Klik tombol **Send Struk** lagi untuk mencoba ulang.',
            flags: 1 << 6
          });
        }
      });
    }

    if (interaction.isButton() && interaction.customId.startsWith('confirm_payment_')) {
      if (!interaction.member.roles.cache.has(SELLER_ROLE_ID)) {
        return interaction.reply({ content: '🚫 Hanya seller yang dapat mengkonfirmasi pembayaran.', flags: 1 << 6 });
      }

      const buyerId = interaction.customId.split('_')[2] ?? 'unknown';

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Pembayaran Dikonfirmasi!')
        .setDescription(
          `🎉 **Pembayaran kamu sudah dikonfirmasi!**\n` +
          `Harap tunggu, seller akan segera mengirimkan produkmu. 🎁\n\n` +
          `Terima kasih telah berbelanja di Bot TokoShop 🛍️`
        )
        .setTimestamp();

      await interaction.channel.send({ content: `<@${buyerId}>`, embeds: [embed] });
      await interaction.reply({ content: '✅ Pembayaran berhasil dikonfirmasi.', flags: 1 << 6 });
    }
  }
};
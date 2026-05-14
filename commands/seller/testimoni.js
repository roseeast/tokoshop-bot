const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { TESTIMONI_CHANNEL_ID, SELLER_ROLE_ID } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('proof')
    .setDescription('🧾 Kirim testimoni dari pembeli dengan tampilan keren.')
    .addIntegerOption(option =>
      option.setName('nomor')
        .setDescription('Nomor urut testimoni')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('pembeli')
        .setDescription('Pilih pembeli yang memberikan testimoni')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('harga')
        .setDescription('Harga transaksi (Rp)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('produk')
        .setDescription('Produk yang dibeli oleh pembeli')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('bukti')
        .setDescription('Bukti pembelian (opsional)')),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(SELLER_ROLE_ID)) {
      return interaction.reply({
        content: '🚫 | Kamu tidak memiliki izin untuk menggunakan perintah ini.',
        ephemeral: true
      });
    }

    const nomor = interaction.options.getInteger('nomor');
    const pembeli = interaction.options.getUser('pembeli');
    const harga = interaction.options.getInteger('harga');
    const produk = interaction.options.getString('produk');
    const bukti = interaction.options.getAttachment('bukti');

    const colors = ['#00C897', '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#F15BB5'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const embed = new EmbedBuilder()
      .setColor(randomColor)
      .setAuthor({
        name: ` Proof #${nomor}`,
        iconURL: pembeli.displayAvatarURL({ dynamic: true })
      })
      .setDescription(
        `🛒 **Transaction Success!**\n` +
        `Pembeli <@${pembeli.id}> telah menyelesaikan pembelian dan memberikan testimoni untuk produk berikut.`
      )
      .addFields(
        { name: '👤 Penjual', value: `<@${interaction.user.id}>`, inline: true },
        { name: '💰 Harga', value: `Rp **${harga.toLocaleString('id-ID')}**`, inline: true },
        { name: '📦 Produk', value: `\`${produk}\``, inline: false },
        { name: '📅 Tanggal', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
      )
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/5404/5404012.png')
      .setFooter({ text: '💚 Bot TokoShop • Kepuasan Anda Prioritas Kami' })
      .setTimestamp();

    if (bukti) {
      embed.setImage(bukti.url);
    }

    const channel = interaction.client.channels.cache.get(TESTIMONI_CHANNEL_ID);
    if (!channel) {
      return interaction.reply({
        content: '❌ | Channel testimoni tidak ditemukan. Cek kembali ID di config.json!',
        ephemeral: true
      });
    }

    await channel.send({ embeds: [embed] });

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00C897')
          .setDescription('✅ | Testimoni berhasil dikirim ke channel <#' + TESTIMONI_CHANNEL_ID + '>!')
      ],
      ephemeral: true
    });
  }
};
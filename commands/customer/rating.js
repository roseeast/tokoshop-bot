const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { BUYER_ROLE_ID, RATING_CHANNEL_ID } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rating')
    .setDescription('📝 Berikan rating dan ulasan keren kepada penjual.')
    .addUserOption(option =>
      option.setName('penjual')
        .setDescription('Tag penjual')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('harga')
        .setDescription('Harga transaksi (angka)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('produk')
        .setDescription('Nama produk yang dibeli')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('rating')
        .setDescription('Rating dari 1 (buruk) - 5 (sangat puas)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5))
    .addStringOption(option =>
      option.setName('ulasan')
        .setDescription('Tulis ulasan singkat (opsional)')),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(BUYER_ROLE_ID)) {
      return interaction.reply({
        content: '🚫 | Kamu tidak memiliki izin untuk memberi rating.',
        ephemeral: true
      });
    }

    const seller = interaction.options.getUser('penjual');
    const price = interaction.options.getInteger('harga');
    const product = interaction.options.getString('produk');
    const rating = interaction.options.getInteger('rating');
    const review = interaction.options.getString('ulasan') || '_Tidak ada ulasan ditulis._';

    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

    const color =
      rating >= 5 ? '#00C897' : 
      rating >= 4 ? '#FFD93D' :
      rating >= 3 ? '#FFA45B' : 
      '#FF6B6B';                

    const embed = new EmbedBuilder()
      .setColor(color)
      .setAuthor({
        name: `⭐ Ulasan Transaksi #${Math.floor(Math.random() * 9999)}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail(seller.displayAvatarURL({ dynamic: true }))
      .setDescription(
        `💬 **Ulasan baru dari <@${interaction.user.id}> untuk <@${seller.id}>**\n` +
        `\n**📦 Produk:** \`${product}\`\n` +
        `**💵 Harga:** Rp ${price.toLocaleString('id-ID')}\n`
      )
      .addFields(
        { name: '⭐ Rating', value: `${stars}`, inline: true },
        { name: '🗒️ Ulasan Pembeli', value: `> ${review}`, inline: false },
        { name: '🕒 Tanggal', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
      )
      .setFooter({ text: '💚 Bot TokoShop • Customer Satisfaction Review' })
      .setTimestamp();

    const channel = interaction.guild.channels.cache.get(RATING_CHANNEL_ID);
    if (!channel) {
      return interaction.reply({
        content: '❌ | Channel rating tidak ditemukan. Periksa ID di config.json!',
        ephemeral: true
      });
    }

    await channel.send({ embeds: [embed] });

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00C897')
          .setDescription(`✅ | Terima kasih <@${interaction.user.id}>! Ulasan kamu untuk <@${seller.id}> berhasil dikirim.`)
      ],
      ephemeral: true
    });
  }
};
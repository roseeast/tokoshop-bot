const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');
const { PRODUCT_CHANNEL_ID, ADMIN_ROLE_ID } = require('../../config.json');

function generateProductId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addproduct')
    .setDescription('📦 Tambahkan produk ke etalase')
    .addStringOption(o =>
      o.setName('nama').setDescription('Nama produk').setRequired(true))
    .addIntegerOption(o =>
      o.setName('harga').setDescription('Harga produk').setRequired(true))
    .addIntegerOption(o =>
      o.setName('stok').setDescription('Stok produk').setRequired(true))
    .addStringOption(o =>
      o.setName('status').setDescription('Status produk').setRequired(true)
        .addChoices(
          { name: '✅ Ready',     value: '✅ Ready' },
          { name: '⏳ Pre-Order', value: '⏳ Pre-Order' },
          { name: '❌ Sold Out',  value: '❌ Sold Out' },
        ))
    .addStringOption(o =>
      o.setName('deskripsi').setDescription('Deskripsi produk').setRequired(true))
    .addAttachmentOption(o =>
      o.setName('gambar').setDescription('Gambar produk').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    /* ── izin admin ── */
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
      return interaction.reply({
        content: '🚫 Kamu tidak punya izin menjalankan perintah ini.',
        ephemeral: true,
      });
    }

    const nama      = interaction.options.getString('nama');
    const harga     = interaction.options.getInteger('harga');
    const stok      = interaction.options.getInteger('stok');
    const status    = interaction.options.getString('status');
    const deskripsi = interaction.options.getString('deskripsi');
    const gambar    = interaction.options.getAttachment('gambar');

    const idProduk  = generateProductId();

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle(`📦 Produk Baru: ${nama}`)
      .setDescription(
        `📦 **Detail Produk**\n\n` +
        `📝 **Deskripsi:**\n${deskripsi}`
      )
      .addFields(
        { name: '🆔 ID Produk', value: `\`${idProduk}\``, inline: true },
        { name: '📛 Nama',      value: nama,             inline: true },
        { name: '💸 Harga',     value: `Rp ${harga.toLocaleString('id-ID')}`, inline: true },
        { name: '📦 Stok',      value: `${stok} unit`,   inline: true },
        { name: '📌 Status',    value: status,           inline: true },
      )
      .setImage(gambar.url)
      .setTimestamp();

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`order_${idProduk}_${nama.replace(/\s+/g, '-')}`)
        .setLabel('🛒 Beli Produk Ini')
        .setStyle(ButtonStyle.Success),
    );

    const etalase = interaction.client.channels.cache.get(PRODUCT_CHANNEL_ID);
    if (!etalase) {
      return interaction.reply({
        content: '❌ Channel etalase produk tidak ditemukan.',
        ephemeral: true,
      });
    }

    await etalase.send({ embeds: [embed], components: [button] });

    await interaction.reply({
      content: `✅ Produk “${nama}” berhasil diposting di <#${PRODUCT_CHANNEL_ID}>.`,
      ephemeral: true,
    });
  },
};
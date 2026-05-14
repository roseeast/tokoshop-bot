// events/Buyproduct.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType,
} = require('discord.js');

const {
  CategoryTicketId,
  ADMIN_ROLE_ID,
  SELLER_ROLE_ID,
  ChannelLogTicketId,
} = require('../config.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('order_')) return;

    const { guild, user } = interaction;

    const [, prodId, ...rawName] = interaction.customId.split('_');
    const productNameFromId = rawName.join(' ').replace(/-/g, ' ');

    let priceText = 'Rp -';
    const sourceEmbed = interaction.message.embeds[0];
    if (sourceEmbed) {
      const priceField = sourceEmbed.fields?.find((f) => f.name.startsWith('💸'));
      if (priceField) priceText = priceField.value;
    }

    const safe = productNameFromId.slice(0, 10).toLowerCase().replace(/[^a-z0-9]/g, '');
    const ticketName = `ticket-${user.username.toLowerCase()}-${safe}`;
    if (guild.channels.cache.find((ch) => ch.name === ticketName)) {
      return interaction.reply({
        content: '❌ Kamu sudah punya ticket untuk produk ini.',
        ephemeral: true,
      });
    }

    const ticketChannel = await guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      parent: CategoryTicketId,
      permissionOverwrites: [
        { id: guild.id, deny: PermissionsBitField.Flags.ViewChannel },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        },
        {
          id: SELLER_ROLE_ID,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
      ],
    });

    const orderEmbed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('🛒 Pesanan Baru')
      .setDescription(
        `📦 **Produk:** ${productNameFromId}\n` +
          `🆔 **ID Produk:** \`${prodId}\`\n` +
          `💸 **Harga:** ${priceText}\n` +
          `👤 **Pembeli:** <@${user.id}>\n\n` +
          `📝 **Note:**\nGunakan perintah **/payment** untuk melihat metode pembayaran yang tersedia.`
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('send_struk')
        .setLabel('🧾 Send Struk')
        .setStyle(ButtonStyle.Success),
    
      new ButtonBuilder()
        .setCustomId('panggil_seller')
        .setLabel('🔔 Panggil Seller')
        .setStyle(ButtonStyle.Primary),
    
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('❌ Close Ticket')
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({
      content: `<@${user.id}>`,
      embeds: [orderEmbed],
      components: [row],
    });

    await interaction.reply({
      content: `✅ Ticket pesanan dibuat di <#${ticketChannel.id}>`,
      ephemeral: true,
    });

    const log = guild.channels.cache.get(ChannelLogTicketId);
    if (log) {
      const logEmbed = new EmbedBuilder()
        .setTitle('📥 Ticket Order Dibuka')
        .addFields(
          { name: 'Ticket', value: ticketChannel.name, inline: true },
          { name: 'Pembeli', value: `<@${user.id}>`, inline: true },
          { name: 'Produk', value: productNameFromId, inline: true }
        )
        .setColor('Blue')
        .setTimestamp();
      log.send({ embeds: [logEmbed] });
    }
  },
};
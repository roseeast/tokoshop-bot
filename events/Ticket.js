const {

  ActionRowBuilder,

  ButtonBuilder,

  ButtonStyle,

  ChannelType,

  EmbedBuilder,

  ModalBuilder,

  TextInputBuilder,

  TextInputStyle,

  PermissionsBitField,

  AttachmentBuilder,

} = require('discord.js');

const fs = require('fs');

const path = require('path');

const {

  CategoryTicketId,

  SELLER_ROLE_ID,

  ChannelLogTicketId

} = require('../config.json');

const REKAP_CHANNEL_ID = '';

const ticketPath = path.join(__dirname, '../data/tickets.json');


const loadTicketData = () => {

  try {

    if (!fs.existsSync(ticketPath)) return {};

    const data = fs.readFileSync(ticketPath, 'utf-8');

    return data ? JSON.parse(data) : {};

  } catch {

    return {};

  }

};

const saveTicketData = (d) => {

  fs.writeFileSync(ticketPath, JSON.stringify(d, null, 2));

};

module.exports = {

  name: 'Ticket',

  async execute(interaction) {

    const { customId, guild, user, channel } = interaction;

    const ticketData = loadTicketData();

    if (interaction.isButton() && customId === 'panggil_seller') {

      return interaction.reply({

        content: `🔔 <@&${SELLER_ROLE_ID}> telah dipanggil oleh <@${user.id}>.`,

        ephemeral: false,

      });

    }

    if (interaction.isButton() && customId === 'create_ticket') {

      if (ticketData[user.id]) {

        const existing = guild.channels.cache.get(ticketData[user.id].channelId);

        if (existing) {

          return interaction.reply({

            content: `❌ Kamu sudah memiliki ticket aktif: ${existing}`,

            ephemeral: true,

          });

        }

      }

      const modal = new ModalBuilder()

        .setCustomId('ticket_modal')

        .setTitle('🛒 Buat Order Baru');

      const produkInput = new TextInputBuilder()

        .setCustomId('produk_input')

        .setLabel('Nama Produk')

        .setPlaceholder('Contoh: Diamond ML 86')

        .setStyle(TextInputStyle.Short)

        .setRequired(true);

      const hargaInput = new TextInputBuilder()

        .setCustomId('harga_input')

        .setLabel('Harga Produk')

        .setPlaceholder('Contoh: Rp20.000')

        .setStyle(TextInputStyle.Short)

        .setRequired(true);

      const row1 = new ActionRowBuilder().addComponents(produkInput);

      const row2 = new ActionRowBuilder().addComponents(hargaInput);

      modal.addComponents(row1, row2);

      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'ticket_modal') {

      const produk = interaction.fields.getTextInputValue('produk_input');

      const harga = interaction.fields.getTextInputValue('harga_input');

      const randomId = Math.floor(1000 + Math.random() * 9000);

      const ticketName = `order-${user.username.toLowerCase()}`;

      const existingChannel = guild.channels.cache.find(c => c.name === ticketName);

      if (existingChannel) {

        return interaction.reply({

          content: `⚠️ Ticket kamu sudah ada: ${existingChannel}`,

          ephemeral: true,

        });

      }


      const ticketChannel = await guild.channels.create({

        name: ticketName,

        type: ChannelType.GuildText,

        parent: CategoryTicketId || null,

        permissionOverwrites: [

          { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },

          { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },

          { id: SELLER_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },

        ],

      });

      const orderEmbed = new EmbedBuilder()

        .setTitle('🛒 Detail Order')

        .setDescription(

          `📦 **Produk:** ${produk}\n💸 **Harga:** ${harga}\n👤 **Pembeli:** <@${user.id}>`

        )

        .setColor('Green')

        .setFooter({ text: `Ticket ID: ${randomId}` })

        .setTimestamp();

      const actionRow = new ActionRowBuilder().addComponents(

        new ButtonBuilder().setCustomId('panggil_seller').setLabel('🔔 Panggil Seller').setStyle(ButtonStyle.Primary),

        new ButtonBuilder().setCustomId('close_ticket').setLabel('❌ Tutup Ticket').setStyle(ButtonStyle.Danger),

      );

      await ticketChannel.send({

        content: `<@${user.id}> Terima kasih telah membuat ticket order!`,

        embeds: [orderEmbed],

        components: [actionRow],

      });

      ticketData[user.id] = { channelId: ticketChannel.id, idTicket: randomId, userId: user.id };

      saveTicketData(ticketData);

      await interaction.reply({ content: `✅ Ticket berhasil dibuat: ${ticketChannel}`, ephemeral: true });

      const logChannel = guild.channels.cache.get(ChannelLogTicketId);

      if (logChannel) {

        const openEmbed = new EmbedBuilder()

          .setTitle('📥 Ticket Dibuka')

          .addFields(

            { name: 'Nama Ticket', value: ticketChannel.name, inline: true },

            { name: 'User', value: `<@${user.id}>`, inline: true },

            { name: 'Produk', value: produk, inline: true },

            { name: 'Harga', value: harga, inline: true },

          )

          .setColor('Blue')

          .setTimestamp();

        logChannel.send({ embeds: [openEmbed] });

      }

    }


    if (interaction.isButton() && customId === 'close_ticket') {

      await interaction.reply({ content: '📪 Menutup ticket dalam 5 detik...', ephemeral: true });

      const ticketOwner = Object.keys(ticketData).find(k => ticketData[k].channelId === channel.id);

      const ticketInfo = ticketData[ticketOwner];

      if (!ticketInfo) {

        return interaction.followUp({ content: '⚠️ Data ticket tidak ditemukan.', ephemeral: true });

      }

      setTimeout(async () => {

        const messages = await channel.messages.fetch({ limit: 100 });

        const transcriptTxt = messages

          .reverse()

          .map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`)

          .join('\n');

        const transcriptFile = new AttachmentBuilder(Buffer.from(transcriptTxt), { name: `${channel.name}-transcript.txt` });

        const orderMsg = messages.find(m => m.embeds[0]?.title === '🛒 Detail Order');

        const orderEmbed = orderMsg?.embeds[0];

        const produk = orderEmbed?.description?.match(/📦 \*\*Produk:\*\* (.+)/)?.[1] || 'Tidak diketahui';

        const harga = orderEmbed?.description?.match(/💸 \*\*Harga:\*\* (.+)/)?.[1] || 'Tidak diketahui';

        const buyerId = orderEmbed?.description?.match(/👤 \*\*Pembeli:\*\* <@(\d+)>/)?.[1] || ticketOwner;

        const adaStruk = messages.some(m => m.embeds[0]?.title === '🧾 Struk Pembayaran');

        const rekapChannel = guild.channels.cache.get(REKAP_CHANNEL_ID);

        if (rekapChannel) {

          const rekapEmbed = new EmbedBuilder()

            .setTitle('📋 Rekap Order')

            .setColor('Yellow')

            .addFields(

              { name: '👤 Pembeli', value: `<@${buyerId}>`, inline: true },

              { name: 'Ticket', value: channel.name, inline: true },

              { name: '📦 Produk', value: produk, inline: false },

              { name: '💸 Harga', value: harga, inline: true },

              { name: '🧾 Struk', value: adaStruk ? '✅ Ada' : '❌ Tidak ada', inline: true },

              {

                name: '📅 Tanggal',

                value:

                  `Dibuat: <t:${Math.floor((orderMsg?.createdTimestamp ?? Date.now()) / 1000)}:f>\n` +

                  `Ditutup: <t:${Math.floor(Date.now() / 1000)}:f>`,

              }

            )

            .setTimestamp();

          await rekapChannel.send({ embeds: [rekapEmbed] });

        }


        const ownerUser = await interaction.client.users.fetch(ticketOwner).catch(() => null);

        if (ownerUser) {

          await ownerUser.send({

            content: `📄 Berikut transcript ticket kamu (${channel.name}):`,

            files: [transcriptFile],

          }).catch(() => null);

        }

        const logChannel = guild.channels.cache.get(ChannelLogTicketId);

        if (logChannel) {

          const closeEmbed = new EmbedBuilder()

            .setTitle('📪 Ticket Ditutup')

            .addFields(

              { name: 'Nama Ticket', value: channel.name, inline: true },

              { name: 'User', value: `<@${ticketOwner}>`, inline: true },

              { name: 'Ditutup Oleh', value: `<@${user.id}>`, inline: true },

            )

            .setColor('Red')

            .setTimestamp();

          logChannel.send({ embeds: [closeEmbed] });

        }

        delete ticketData[ticketOwner];

        saveTicketData(ticketData);

        await channel.delete().catch(() => null);

      }, 5000);

    }

  },

};
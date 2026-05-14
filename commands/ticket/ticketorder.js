const {
SlashCommandBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
EmbedBuilder,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
ChannelType,
PermissionFlagsBits,
Events
} = require("discord.js");

const path = require("path");

const { ADMIN_ROLE_ID, LOG_CHANNEL_ID } = require(path.join(__dirname, "../../config.json"));

module.exports = {

  data: new SlashCommandBuilder()

    .setName("ticketorder")

    .setDescription("📩 Tampilkan panel ticket order produk"),

  async execute(interaction, client) {

    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {

      return interaction.reply({

        content: "🚫 Kamu tidak memiliki izin untuk menjalankan perintah ini.",

        ephemeral: true,

      });

    }

    const embed = new EmbedBuilder()

      .setTitle("🛒 Order Produk")

      .setDescription(

        "Klik tombol **Order Sekarang** di bawah untuk memulai pembelian.\n\n" +

          "> ⚠️ Mohon gunakan fitur ini dengan bijak.\n> Penyalahgunaan akan dikenakan sanksi."

      )

      .setColor(0x5865f2)

      .setImage("https://cdn.discordapp.com/attachments/1274003029632221348/1431125406861496352/ccbaff6e0ef03ba3bed8b2441ab96106.jpg?ex=68fc46e6&is=68faf566&hm=fad67135a7d2b19fefde0d7f919f569dc1006c2e223155009dc62f8b095ba7d4&")

      .setFooter({ text: "Bot TokoShop • Ticket System" })

      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(

      new ButtonBuilder()

        .setCustomId("create_ticket")

        .setLabel("📝 Order Sekarang")

        .setStyle(ButtonStyle.Primary)

    );

    await interaction.reply({ embeds: [embed], components: [row] });

  },

  async onButton(interaction, client) {

    if (interaction.customId !== "create_ticket") return;

    const modal = new ModalBuilder()

      .setCustomId("ticket_modal")

      .setTitle("🛍️ Formulir Order Produk");

    const nameInput = new TextInputBuilder()

      .setCustomId("product_name")

      .setLabel("Nama Produk")

      .setPlaceholder("Contoh: Diamond ML 86")

      .setStyle(TextInputStyle.Short)

      .setRequired(true);

    const priceInput = new TextInputBuilder()

      .setCustomId("product_price")

      .setLabel("Harga Produk")

      .setPlaceholder("Contoh: 20.000")

      .setStyle(TextInputStyle.Short)

      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(nameInput);

    const row2 = new ActionRowBuilder().addComponents(priceInput);

    modal.addComponents(row1, row2);

    await interaction.showModal(modal);

  },

  async onModal(interaction, client) {

    if (interaction.customId !== "ticket_modal") return;

    const productName = interaction.fields.getTextInputValue("product_name");

    const productPrice = interaction.fields.getTextInputValue("product_price");

    const guild = interaction.guild;

    const user = interaction.user;


    const existing = guild.channels.cache.find(

      (ch) => ch.name === `order-${user.username}`

    );

    if (existing) {

      return interaction.reply({

        content: "⚠️ Kamu sudah memiliki ticket order yang aktif!",

        ephemeral: true,

      });

    }


    const ticketChannel = await guild.channels.create({

      name: `order-${user.username}`,

      type: ChannelType.GuildText,

      permissionOverwrites: [

        {

          id: guild.id,

          deny: [PermissionFlagsBits.ViewChannel],

        },

        {

          id: user.id,

          allow: [

            PermissionFlagsBits.ViewChannel,

            PermissionFlagsBits.SendMessages,

            PermissionFlagsBits.ReadMessageHistory,

          ],

        },

      ],

    });

    const embed = new EmbedBuilder()

      .setTitle("🧾 Detail Order Produk")

      .setDescription(

        `📦 **Nama Produk:** ${productName}\n💰 **Harga:** ${productPrice}\n👤 **Pemesan:** <@${user.id}>`

      )

      .setColor(0x00ff9d)

      .setFooter({ text: "Bot TokoShop • Ticket System" })

      .setTimestamp();

    const closeBtn = new ActionRowBuilder().addComponents(

      new ButtonBuilder()

        .setCustomId("close_ticket")

        .setLabel("🔒 Tutup Ticket")

        .setStyle(ButtonStyle.Danger)

    );

    await ticketChannel.send({

      content: `<@${user.id}> Terima kasih telah membuat order!`,

      embeds: [embed],

      components: [closeBtn],

    });

    await interaction.reply({

      content: `✅ Ticket order berhasil dibuat di ${ticketChannel}`,

      ephemeral: true,

    });


    const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);

    if (logChannel) {

      const logEmbed = new EmbedBuilder()

        .setTitle("🆕 Order Baru Dibuat")

        .setColor(0x00ff9d)

        .setDescription(

          `📦 **Nama Produk:** ${productName}\n💰 **Harga:** ${productPrice}\n👤 **User:** ${user.tag} (<@${user.id}>)\n📁 **Channel:** ${ticketChannel}`

        )

        .setTimestamp()

        .setFooter({ text: "Bot TokoShop • Order Log" });

      await logChannel.send({ embeds: [logEmbed] });

    }

  },


  async onClose(interaction) {

    if (interaction.customId !== "close_ticket") return;

    await interaction.reply({

      content: "🔒 Ticket akan ditutup dalam 5 detik...",

      ephemeral: true,

    });

    setTimeout(() => {

      interaction.channel.delete().catch(() => {});

    }, 5000);

  },

};


module.exports.registerHandlers = (client) => {

  client.on(Events.InteractionCreate, async (interaction) => {

    if (interaction.isButton()) {

      if (interaction.customId === "create_ticket")

        await module.exports.onButton(interaction, client);

      else if (interaction.customId === "close_ticket")

        await module.exports.onClose(interaction);

    } else if (interaction.isModalSubmit()) {

      await module.exports.onModal(interaction, client);

    }

  });

};
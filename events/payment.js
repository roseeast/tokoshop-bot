const { EmbedBuilder } = require('discord.js');

client.on('interactionCreate', async interaction => {

  if (!interaction.isButton()) return;


  const validIds = ['dana', 'gopay', 'ovo', 'qris'];

  if (!validIds.includes(interaction.customId)) return;

  let embed;

  const baseColor = 0x00b0f4; 

  const userTag = interaction.user.tag;

  switch (interaction.customId) {

    case 'dana':

      embed = new EmbedBuilder()

        .setTitle('📱 Pembayaran via DANA')

        .setDescription([

          '💠 **Silakan transfer ke nomor berikut:**',

          '``````',

          '📤 Setelah transfer, kirim **bukti pembayaran** ke admin atau ticket support.',

          '',

          '> ⚠️ Pastikan nominal sesuai sebelum mengirim.'

        ].join('\n'))

        .setColor(baseColor)

        .setThumbnail('https://cdn-icons-png.flaticon.com/512/6124/6124994.png')

        .setFooter({ text: `Permintaan oleh ${userTag} • Bot TokoShop 💳` })

        .setTimestamp();

      break;

    case 'gopay':

      embed = new EmbedBuilder()

         .setTitle('🔮 Pembayaran via GOPAY')

        .setDescription('🚧 **Coming Soon!**\nMetode ini belum aktif, silakan gunakan DANA sementara waktu.')

        .setColor(0x9b59b6)

        .setThumbnail('https://cdn-icons-png.flaticon.com/512/5968/5968880.png')

        .setFooter({ text: 'Segera hadir di Bot TokoShop 💫' })

        .setTimestamp();

      break;

    case 'ovo':

      embed = new EmbedBuilder()

        .setTitle('🔮 Pembayaran via OVO')

        .setDescription('🚧 **Coming Soon!**\nMetode ini belum aktif, silakan gunakan DANA atau GoPay sementara waktu.')

        .setColor(0x9b59b6)

        .setThumbnail('https://cdn-icons-png.flaticon.com/512/5968/5968880.png')

        .setFooter({ text: 'Segera hadir di Bot TokoShop 💫' })

        .setTimestamp();

      break;

    case 'qris':

      embed = new EmbedBuilder()

        .setTitle('🔮 Pembayaran via QRIS')

        .setDescription('🚧 **Coming Soon!**\nMetode ini belum aktif, silakan gunakan DANA ementara waktu.')

        .setColor(0x9b59b6)

        .setThumbnail('https://cdn-icons-png.flaticon.com/512/5968/5968880.png')

        .setFooter({ text: 'Segera hadir di Bot TokoShop 💫' })

        .setTimestamp();

      break;

  }

  try {

    await interaction.reply({

      embeds: [embed],

      ephemeral: true

    });

  } catch (err) {

    console.error('❌ Gagal kirim embed pembayaran:', err);

  }

});
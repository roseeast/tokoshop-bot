const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    if (message.channel.id !== config.VERIFY_SUBSCRIBE_ID) return;

    const attachment = message.attachments.first();

    if (!attachment) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setTitle('⚠️ Bukti Subscribe Tidak Ditemukan')
            .setDescription('Kirim **screenshot bukti subscribe** YouTube Bot TokoShop untuk mendapatkan role **Subscriber** 💫')
            .setFooter({ text: 'Pastikan tangkapan layar jelas dan tidak buram.' })
        ]
      });
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(attachment.contentType)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('📁 File Tidak Didukung')
            .setDescription('Kamu hanya boleh mengirim **gambar (.png, .jpg, .jpeg)** sebagai bukti subscribe.')
        ]
      });
    }

    const subscriberRole = message.guild.roles.cache.get(config.SUBSCRIBER_ROLE_ID);
    if (!subscriberRole) {
      console.log("❌ Role Subscriber tidak ditemukan!");
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setTitle('❌ Role Tidak Ditemukan')
            .setDescription('Role **Subscriber** tidak ditemukan di server ini. Hubungi admin.')
        ]
      });
    }

    if (message.member.roles.cache.has(config.SUBSCRIBER_ROLE_ID)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Blue')
            .setTitle('✅ Kamu Sudah Terverifikasi')
            .setDescription('Kamu sudah memiliki role **Subscriber** 💚')
        ]
      });
    }

    try {
      await message.member.roles.add(subscriberRole);

            const successEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('🎉 Terima Kasih Telah Subscribe!')
        .setDescription(`Hai <@${message.author.id}>! Kamu berhasil mendapatkan role **Subscriber** 💫`)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'Selamat datang di komunitas Bot TokoShop 💚' });

      await message.reply({ embeds: [successEmbed] });

           const logChannel = message.guild.channels.cache.get(config.LOG_CHANNEL_ID);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor('Purple')
          .setTitle('🧾 Log Verifikasi Subscriber')
          .setDescription([
            `👤 **User:** ${message.author.tag} (<@${message.author.id}>)`,
            `🆔 **User ID:** ${message.author.id}`,
            `📷 **Bukti:** [Klik Lihat Gambar](${attachment.url})`,
            `📅 **Tanggal:** <t:${Math.floor(Date.now() / 1000)}:F>`
          ].join('\n'))
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: 'Bot TokoShop | Sistem Verifikasi Otomatis' });

        await logChannel.send({ embeds: [logEmbed] });
      } else {
        console.log("⚠️ Channel log tidak ditemukan!");
      }

      console.log(`✅ ${message.author.tag} berhasil diverifikasi sebagai Subscriber.`);

    } catch (err) {
      console.error("❌ Gagal menambahkan role Subscriber:", err);
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setTitle('⚠️ Gagal Menambahkan Role')
            .setDescription('Terjadi kesalahan saat menambahkan role **Subscriber**. Coba lagi nanti.')
        ]
      });
    }
  },
};
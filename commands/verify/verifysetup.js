const {

  SlashCommandBuilder,

  ActionRowBuilder,

  ButtonBuilder,

  ButtonStyle,

  EmbedBuilder,

} = require('discord.js');

module.exports = {

  data: new SlashCommandBuilder()

    .setName('verifysetup')

    .setDescription('📋 Kirim pesan verifikasi dengan tombol popup.'),

  async execute(interaction) {

    const embed = new EmbedBuilder()

      .setColor('#00b0f4')

      .setTitle('🔒 Verifikasi Anggota')

      .setDescription(

        'Selamat datang di **Bot Server**!\n\nKlik tombol **Verify** di bawah untuk memulai proses verifikasi.\nKamu akan diminta memasukkan kode acak di popup untuk memastikan kamu bukan bot 🤖.'

      )

      .setImage('https://cdn.discordapp.com/attachments/1502086425385107588/1503220657406611507/ChatGPT_Image_May_11_2026_09_20_30_AM.png?ex=6a028ed5&is=6a013d55&hm=1f954f61ca7be80167a02275424e644b85e57bee17fd66171a2a0db071af4308') // ganti dengan URL gambar banner kamu

      .setFooter({ text: 'Bot Verification System • Aman & Cepat' })

      .setTimestamp();

    const button = new ButtonBuilder()

      .setCustomId('verify_button')

      .setLabel('✅ Verify Sekarang')

      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({

      embeds: [embed],

      components: [row],

    });

  },

};
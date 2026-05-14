const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearchat')
    .setDescription('🧹 Hapus semua pesan di channel ini (admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),   // hanya admin/mod

  async execute(interaction) {
    await interaction.reply({ content: '⏳ Menghapus pesan…', ephemeral: true });

    let deleted = 0;
    let fetched;

    do {
      fetched = await interaction.channel.messages.fetch({ limit: 100 });
      if (fetched.size === 0) break;

      const younger = fetched.filter(m => (Date.now() - m.createdTimestamp) < 14 * 24 * 60 * 60 * 1000);
      const older   = fetched.filter(m => !younger.has(m.id));

      if (younger.size) {
        const del = await interaction.channel.bulkDelete(younger, true);
        deleted += del.size;
      }

      for (const msg of older.values()) {
        await msg.delete().catch(() => null);
        deleted++;
      }
    } while (fetched.size >= 2);

    await interaction.editReply({
      content: `✅ Berhasil menghapus **${deleted}** pesan di <#${interaction.channel.id}>.`
    });
  }
};
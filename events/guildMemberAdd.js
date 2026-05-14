const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const channel = member.guild.channels.cache.get("");

    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#00ff88")
      .setTitle("🎉 Selamat Datang di Server!")
      .setDescription(`Halo ${member}, selamat datang di **${member.guild.name}**! 🎊`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setImage("")
      .setFooter({ text: "Semoga betah ya!" })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  },
};
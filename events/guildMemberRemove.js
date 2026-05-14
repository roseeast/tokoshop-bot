const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const channel = member.guild.channels.cache.get("");

    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff5555")
      .setTitle("😢 Member Keluar")
      .setDescription(`Selamat tinggal **${member.user.tag}** 👋\nSemoga sukses di tempat lain!`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setImage("") 
      .setFooter({ text: "Sampai jumpa lagi!" })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  },
};
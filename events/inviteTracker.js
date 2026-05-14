const { Events, EmbedBuilder } = require("discord.js");

const invites = new Map();

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    for (const [guildId, guild] of client.guilds.cache) {
      try {
        const guildInvites = await guild.invites.fetch();
        invites.set(guild.id, new Map(guildInvites.map((invite) => [invite.code, invite.uses])));
      } catch (err) {
        console.log(`⚠️ Gagal ambil data invite di guild ${guild.name}:`, err.message);
      }
    }
    console.log("✅ [InviteTracker] Cache awal sudah dimuat.");
  },
};

module.exports.onMemberJoin = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const cachedInvites = invites.get(member.guild.id);
      const newInvites = await member.guild.invites.fetch();
      invites.set(member.guild.id, new Map(newInvites.map((invite) => [invite.code, invite.uses])));

      const usedInvite = newInvites.find((inv) => cachedInvites && inv.uses > (cachedInvites.get(inv.code) || 0));

      const inviter = usedInvite?.inviter ? usedInvite.inviter : null;
      const inviteCode = usedInvite ? usedInvite.code : "Tidak diketahui";

      const channel = member.guild.channels.cache.get("");
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#00ff9d")
        .setTitle("📥 Member Baru Bergabung!")
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `👤 **${member.user.tag}** baru saja bergabung ke server!\n\n` +
          (inviter
            ? `📨 Diundang oleh: **${inviter.tag}** (Kode: \`${inviteCode}\`)\nJumlah invite: **${usedInvite.uses}**`
            : "❓ Tidak dapat menemukan siapa yang mengundang.")
        )
        .setTimestamp()
        .setFooter({ text: member.guild.name });

      await channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("❌ [InviteTracker] Error:", err);
    }
  },
};

module.exports.onMemberLeave = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const channel = member.guild.channels.cache.get("");
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff5555")
      .setTitle("📤 Member Keluar")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`👋 **${member.user.tag}** telah keluar dari server.`)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  },
};
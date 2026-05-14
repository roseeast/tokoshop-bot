const userMessages = new Map();

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    const now = Date.now();
    const timestamps = userMessages.get(message.author.id) || [];
    const filtered = timestamps.filter(t => now - t < 5000);
    filtered.push(now);
    userMessages.set(message.author.id, filtered);

    if (filtered.length >= 5) {
      await message.member.timeout(30_000, "Spam terdeteksi");
      message.channel.send(`⚠️ ${message.author} dihentikan sementara karena spam!`);
      logViolation(message, "Anti-Spam", `${filtered.length} pesan/5s`);
    }
  });

  function logViolation(message, type, content) {
    const logChannel = message.guild.channels.cache.find(c => c.name === "👻┃Bot-log");
    if (logChannel) {
      logChannel.send(`⚠️ **${type}** | ${message.author.tag}\n> ${content}`);
    }
  }
};
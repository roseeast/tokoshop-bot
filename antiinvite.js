module.exports = (client) => {

  client.on("messageCreate", async (message) => {

    if (!message.guild || message.author.bot) return;


    const inviteRegex = /(discord\.gg|discord\.me|discord\.io|discord\.com\/invite)/i;


    const allowedRoleName = "Partnership";


    const member = message.member;

    if (member.roles.cache.some(role => role.name.toLowerCase() === allowedRoleName.toLowerCase())) return;

    if (inviteRegex.test(message.content)) {

      await message.delete().catch(() => {});

      await message.channel.send(`🚫 ${message.author}, tautan invite **tidak diizinkan** di sini kecuali kamu memiliki role **${allowedRoleName}**.`);

      logViolation(message, "Anti-Invite", message.content);

    }

  });

  function logViolation(message, type, content) {


    const logChannel = message.guild.channels.cache.find(c => c.name === "👻┃Bot-log");

    if (logChannel) {

      logChannel.send({

        content: `⚠️ **${type}** | ${message.author.tag} (${message.author.id})\n> ${content}`

      });

    }

  }

};
const { ActivityType } = require('discord.js');

module.exports = (client) => {
  const activities = [
    { text: '🛒 Bot TokoShop | Harga Termurah 🔥', type: ActivityType.Watching },
    { text: '💤 Bot TokoShop | Pelayanan 24 Jam 🕒', type: ActivityType.Playing },
  ];

  let index = 0;

  const updateStatus = () => {
    const totalMembers = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );

    const current = activities[index];
    const displayText = `${current.text} | ${totalMembers} Members`;

    client.user.setPresence({
      status: 'idle',
      activities: [
        {
          name: displayText,
          type: current.type,
        },
      ],
    });

    console.log(`🌙 [Activity] Status diperbarui → ${displayText}`);

    index = (index + 1) % activities.length;
  };

  client.once('ready', () => {
    console.log('⚙️ [AutoActivity] Sistem aktivitas otomatis aktif.');
    updateStatus();
    setInterval(updateStatus, 30 * 1000);
  });
};
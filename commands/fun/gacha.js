const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const fs = require("fs");

const path = require("path");

const rewardsFile = path.join(__dirname, "../../data/gacha_rewards.json");

function loadRewards() {

  if (!fs.existsSync(rewardsFile)) return [];

  return JSON.parse(fs.readFileSync(rewardsFile, "utf8"));

}


function getRandomReward(rewards) {

  const totalChance = rewards.reduce((a, b) => a + b.chance, 0);

  const random = Math.random() * totalChance;

  let sum = 0;

  for (const r of rewards) {

    sum += r.chance;

    if (random <= sum) return r;

  }

  return rewards[rewards.length - 1];

}

module.exports = {

  data: new SlashCommandBuilder()

    .setName("gacha")

    .setDescription("🎰 Putar gacha dan dapatkan hadiah acak!"),

  async execute(interaction) {


    await interaction.deferReply();

    const rewards = loadRewards();

    if (!rewards.length) {

      return await interaction.editReply({

        content: "❌ Belum ada hadiah yang tersedia. Admin bisa menambahkannya dengan `/gacha-manage add`.",

      });

    }

    const rollingEmbed = new EmbedBuilder()

      .setTitle("🎲 Gacha Dimulai!")

      .setDescription("Memutar mesin keberuntunganmu...")

      .setColor("#00FFFF");

    await interaction.editReply({ embeds: [rollingEmbed] });


    const rollingMessages = [

      "🎰 Rolling .",

      "🎰 Rolling ..",

      "🎰 Rolling ...",

      "🎰 Rolling 🎲",

      "🎰 Rolling 🎲🎲",

      "🎰 Rolling 🎲🎲🎲",

    ];

    for (const msg of rollingMessages) {

      await new Promise(r => setTimeout(r, 500));

      await interaction.editReply({

        embeds: [rollingEmbed.setDescription(msg)],

      });

    }


    const reward = getRandomReward(rewards);

    await new Promise(r => setTimeout(r, 1000));

    const resultEmbed = new EmbedBuilder()

      .setTitle("🎁 Hasil Gacha!")

      .setColor(reward.type === "kosong" ? "Red" : "Gold")

      .setDescription(

        reward.type === "kosong"

          ? `😢 Sayang sekali, kamu tidak mendapatkan apa-apa kali ini.`

          : `🎉 **Selamat <@${interaction.user.id}>!**\nKamu mendapatkan **${reward.name}**!`

      )

      .setFooter({ text: `Tipe: ${reward.type.toUpperCase()} • Peluang: ${reward.chance}%` })

      .setTimestamp();

    await interaction.editReply({ embeds: [resultEmbed] });

  },

};
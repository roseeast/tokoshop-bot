const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const fs = require("fs");

const path = require("path");

const rewardsFile = path.join(__dirname, "../../data/gacha_rewards.json");

function loadRewards() {

  if (!fs.existsSync(rewardsFile)) return [];

  return JSON.parse(fs.readFileSync(rewardsFile, "utf8"));

}

function saveRewards(data) {

  fs.writeFileSync(rewardsFile, JSON.stringify(data, null, 2));

}

module.exports = {

  data: new SlashCommandBuilder()

    .setName("gacha-manage")

    .setDescription("⚙️ Kelola daftar hadiah gacha")

    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(sub =>

      sub.setName("list")

        .setDescription("Lihat semua hadiah yang tersedia.")

    )


    .addSubcommand(sub =>

      sub.setName("add")

        .setDescription("Tambah hadiah baru ke daftar gacha.")

        .addStringOption(o =>

          o.setName("type")

            .setDescription("Tipe hadiah (produk/saldo/diskon/kosong)")

            .setRequired(true)

        )

        .addStringOption(o =>

          o.setName("name")

            .setDescription("Nama hadiah")

            .setRequired(true)

        )

        .addIntegerOption(o =>

          o.setName("chance")

            .setDescription("Peluang (0-100)")

            .setRequired(true)

        )

    )


    .addSubcommand(sub =>

      sub.setName("remove")

        .setDescription("Hapus hadiah berdasarkan nomor urut.")

        .addIntegerOption(o =>

          o.setName("index")

            .setDescription("Nomor urut hadiah di /gacha-manage list")

            .setRequired(true)

        )

    )


    .addSubcommand(sub =>

      sub.setName("edit")

        .setDescription("Ubah peluang hadiah berdasarkan nomor urut.")

        .addIntegerOption(o =>

          o.setName("index")

            .setDescription("Nomor urut hadiah")

            .setRequired(true)

        )

        .addIntegerOption(o =>

          o.setName("chance")

            .setDescription("Peluang baru (0-100)")

            .setRequired(true)

        )

    ),

  async execute(interaction) {

    const sub = interaction.options.getSubcommand();

    const rewards = loadRewards();


    if (sub === "list") {

      if (rewards.length === 0)

        return interaction.reply({ content: "❌ Belum ada hadiah gacha yang tersimpan.", ephemeral: true });

      const embed = new EmbedBuilder()

        .setTitle("🎁 Daftar Hadiah Gacha")

        .setColor("#00FFFF")

        .setDescription(

          rewards.map((r, i) => `**${i + 1}.** ${r.name} — 🎯 ${r.chance}% [${r.type}]`).join("\n")

        )

        .setFooter({ text: `Total hadiah: ${rewards.length}` });

      return interaction.reply({ embeds: [embed], ephemeral: true });

    }


    if (sub === "add") {

      const type = interaction.options.getString("type");

      const name = interaction.options.getString("name");

      const chance = interaction.options.getInteger("chance");

      if (chance <= 0 || chance > 100)

        return interaction.reply({ content: "⚠️ Peluang harus antara 1 hingga 100.", ephemeral: true });

      rewards.push({ type, name, chance });

      saveRewards(rewards);

      return interaction.reply({

        content: `✅ Hadiah baru **${name}** (${chance}%) berhasil ditambahkan.`,

        ephemeral: true,

      });

    }


    if (sub === "remove") {

      const index = interaction.options.getInteger("index") - 1;

      if (!rewards[index])

        return interaction.reply({ content: "❌ Nomor hadiah tidak valid.", ephemeral: true });

      const removed = rewards.splice(index, 1);

      saveRewards(rewards);

      return interaction.reply({

        content: `🗑️ Hadiah **${removed[0].name}** telah dihapus dari daftar.`,

        ephemeral: true,

      });

    }



    if (sub === "edit") {

      const index = interaction.options.getInteger("index") - 1;

      const newChance = interaction.options.getInteger("chance");

      if (!rewards[index])

        return interaction.reply({ content: "❌ Nomor hadiah tidak ditemukan.", ephemeral: true });

      if (newChance <= 0 || newChance > 100)

        return interaction.reply({ content: "⚠️ Nilai chance harus antara 1 dan 100.", ephemeral: true });

      const oldChance = rewards[index].chance;

      rewards[index].chance = newChance;

      saveRewards(rewards);

      return interaction.reply({

        content: `🔄 Peluang hadiah **${rewards[index].name}** diubah dari **${oldChance}% → ${newChance}%**.`,

        ephemeral: true,

      });

    }

  },

};
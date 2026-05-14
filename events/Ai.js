
const { Events } = require("discord.js");
const fs = require("fs");
const path = require("path");
const fetch = globalThis.fetch || require("node-fetch");
const config = require("../config.json");

const AI_CHANNEL_ID = "YOUR_AI_CHANNEL_ID";

const memoryFile = path.join(__dirname, "../data/ai_memory.json");
const modeFile = path.join(__dirname, "../data/ai_mode.json");

if (!fs.existsSync(path.dirname(memoryFile))) fs.mkdirSync(path.dirname(memoryFile), { recursive: true });

let userMemory = fs.existsSync(memoryFile)
  ? JSON.parse(fs.readFileSync(memoryFile, "utf8"))
  : {};
let userMode = fs.existsSync(modeFile)
  ? JSON.parse(fs.readFileSync(modeFile, "utf8"))
  : {};

function saveMemory() {
  fs.writeFileSync(memoryFile, JSON.stringify(userMemory, null, 2));
}
function saveMode() {
  fs.writeFileSync(modeFile, JSON.stringify(userMode, null, 2));
}

const cooldown = new Map();

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    const isDM = message.channel.type === 1;
    const isAIChannel = message.channel.id === AI_CHANNEL_ID;
    if (!isDM && !isAIChannel) return;

    const last = cooldown.get(message.author.id);
    if (last && Date.now() - last < 5000)
      return message.reply("⏳ Tunggu 5 detik sebelum bertanya lagi.");
    cooldown.set(message.author.id, Date.now());

    if (!userMemory[message.author.id]) {
      userMemory[message.author.id] = [];
    }

    const currentMode = userMode[message.author.id] || "default";

    const personalities = {
      default:
        "Kamu adalah Bot AI — asisten Discord yang ramah, humoris, dan santai. Gunakan bahasa casual seperti teman Discord.",
      lucu:
        "Kamu adalah Bot AI versi lucu, suka bercanda dan menjawab dengan gaya anak tongkrongan Discord. Gunakan emoji dan humor ringan.",
      formal:
        "Kamu adalah Bot AI versi profesional. Gunakan bahasa sopan, lengkap, dan terstruktur seperti asisten kerja.",
      galak:
        "Kamu adalah Bot AI versi galak. Jawabanmu tegas, sedikit sarkas, tapi tetap informatif dan tidak kasar.",
      bucin:
        "Kamu adalah Bot AI versi bucin. Jawab dengan gaya manja, penuh perhatian, dan suka menggombal.",
    };

    const systemPrompt = {
      role: "system",
      content: personalities[currentMode] || personalities.default,
    };

    const userMessage = { role: "user", content: message.content };
    userMemory[message.author.id].push(userMessage);

    if (userMemory[message.author.id].length > 20)
      userMemory[message.author.id].splice(0, 2);

    saveMemory();

    await message.channel.sendTyping();

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [systemPrompt, ...userMemory[message.author.id]],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || "⚠️ Tidak ada respons dari AI.";

      userMemory[message.author.id].push({ role: "assistant", content: reply });
      saveMemory();

      if (reply.length > 1900) {
        const buffer = Buffer.from(reply, "utf-8");
        return message.reply({
          content: "📄 Jawaban panjang dikirim sebagai file:",
          files: [{ attachment: buffer, name: "Bot_ai.txt" }],
        });
      }

      await message.reply(reply);
    } catch (err) {
      console.error("[BotAI Error]", err);
      message.reply("❌ Gagal memproses pesan. Coba lagi nanti.");
    }
  },
};

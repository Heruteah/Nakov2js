const axios = require("axios");

module.exports = {
  name: "ai",
  description: "Chat with AI freely, no prefix needed.",
  usePrefix: false,
  async execute({ api, event, args }) {
    const prompt = args.join(" ").trim();

    if (!prompt || prompt.toLowerCase() === "ai") {
      return api.sendMessage("🤖 Please provide a question first.", event.threadID, event.messageID);
    }

    try {
      const user = event.senderID;
      const waitingMsg = await api.sendMessage("⏳ Thinking...", event.threadID);
      const url = `https://api-library-kohi.onrender.com/api/copilot?prompt=${encodeURIComponent(prompt)}&model=gpt-5&user=${user}`;
      const res = await axios.get(url);

      if (!res.data || !res.data.status) {
        return api.editMessage("⚠️ The AI didn’t respond properly.", waitingMsg.messageID, event.threadID);
      }

      const text = res.data.data?.text || "🤖 The AI had no response.";
      api.editMessage(text, waitingMsg.messageID, event.threadID);
    } catch (err) {
      console.error("AI Command Error:", err);
      api.sendMessage("❌ Error contacting the AI API.", event.threadID, event.messageID);
    }
  }
};

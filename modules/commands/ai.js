const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    description: "Chat with AI freely, no prefix needed.",
    usage: "ai <question>",
    cooldown: 3,
    role: 0,
    prefix: false
  },
  run: async (api, event, args, reply, react) => {
    const prompt = args.join(" ").trim();

    if (!prompt || prompt.toLowerCase() === "ai") {
      return reply("Please provide a question first.");
    }

    try {
      const user = event.senderID;
      const waitingMsg = await api.sendMessage("⏳ Searching...", event.threadID);
      const url = `https://api-library-kohi.onrender.com/api/copilot?prompt=${encodeURIComponent(prompt)}&model=gpt-5&user=${user}`;
      const res = await axios.get(url);

      if (!res.data || !res.data.status) {
        const errMsg = res.data?.message || res.data?.error || "⚠️ The AI returned an invalid response.";
        return api.editMessage(errMsg, waitingMsg.messageID, event.threadID);
      }

      const text = res.data.data?.text || res.data.message || "⚠️ Empty response from AI.";
      api.editMessage(text, waitingMsg.messageID, event.threadID);

    } catch (err) {
      console.error("❎ Error:", err);
      const errMessage = err.response?.data?.error || 
                         err.response?.data?.message || 
                         err.message || 
                         "Unknown error occurred.";
      reply(`❌ Error contacting the AI API:\n\n${errMessage}`);
    }
  }
};

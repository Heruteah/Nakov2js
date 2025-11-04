module.exports = {
  name: "help",
  description: "Shows all available commands (requires prefix).",
  usePrefix: true,
  async execute({ api, event, args }) {
    const helpMessage = `📋 Available Commands:\n\n` +
      `!help - Shows this help message (uses prefix)\n` +
      `ai - Chat with AI (no prefix needed)\n\n` +
      `Note: Some commands require the prefix "!" and some don't.`;
    
    api.sendMessage(helpMessage, event.threadID, event.messageID);
  }
};

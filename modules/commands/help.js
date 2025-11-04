module.exports = {
  name: "help",
  description: "Shows all available commands (requires prefix).",
  usePrefix: true,
  async execute({ api, event, args }) {
    const helpMessage = `📋 Available Commands:\n\n` +
      `!help - Shows this help message\n` +
      `!poli <prompt> - Generate an image using AI\n` +
      `ai <question> - Chat with AI (no prefix needed)\n` +
      `prefix - Shows the current command prefix (no prefix needed)\n\n` +
      `Examples:\n` +
      `!poli beautiful sunset over mountains\n` +
      `ai what is the weather today?`;
    
    api.sendMessage(helpMessage, event.threadID, event.messageID);
  }
};

module.exports = {
  name: "help",
  description: "Shows all available commands (requires prefix).",
  usePrefix: true,
  async execute({ api, event, args }) {
    const helpMessage = `📋 Available Commands:\n\n` +
      `!help - Shows this help message\n` +
      `!prefix - Shows the current command prefix\n` +
      `!poli <prompt> - Generate an image using AI\n\n` +
      `Example: !poli beautiful sunset over mountains`;
    
    api.sendMessage(helpMessage, event.threadID, event.messageID);
  }
};

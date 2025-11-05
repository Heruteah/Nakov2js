module.exports = {
  config: {
    name: "help",
    description: "Shows all available commands",
    usage: "help",
    cooldown: 5,
    role: 0,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    const helpMessage = `📋 Available Commands:\n\n` +
      `!help - Shows this help message\n` +
      `!uptime - Shows how long the bot has been running\n` +
      `!uid - Get your Facebook user ID\n` +
      `!poli <prompt> - Generate an image using AI\n` +
      `ai <question> - Chat with AI (no prefix needed)\n` +
      `prefix - Shows the current command prefix (no prefix needed)\n\n` +
      `Examples:\n` +
      `!poli beautiful sunset over mountains\n` +
      `ai what is the weather today?`;
    
    reply(helpMessage);
  }
};

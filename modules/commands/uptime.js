module.exports = {
  name: "uptime",
  description: "Shows how long the bot has been running (requires prefix).",
  usePrefix: true,
  async execute({ api, event, args }) {
    const uptime = Date.now() - global.botStartTime;
    
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const displaySeconds = seconds % 60;
    const displayMinutes = minutes % 60;
    const displayHours = hours % 24;
    
    let uptimeMessage = "⏰ Bot Uptime:\n\n";
    
    if (days > 0) {
      uptimeMessage += `${days} day${days !== 1 ? 's' : ''}, `;
    }
    if (hours > 0 || days > 0) {
      uptimeMessage += `${displayHours} hour${displayHours !== 1 ? 's' : ''}, `;
    }
    if (minutes > 0 || hours > 0 || days > 0) {
      uptimeMessage += `${displayMinutes} minute${displayMinutes !== 1 ? 's' : ''}, `;
    }
    uptimeMessage += `${displaySeconds} second${displaySeconds !== 1 ? 's' : ''}`;
    
    uptimeMessage += `\n\n✅ Bot is running smoothly!`;
    
    api.sendMessage(uptimeMessage, event.threadID, event.messageID);
  }
};

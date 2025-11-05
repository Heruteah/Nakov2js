module.exports = {
  config: {
    name: "uptime",
    description: "Shows how long the bot has been running",
    usage: "uptime",
    cooldown: 5,
    role: 0,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    const uptime = Date.now() - global.botStartTime;
    const startDate = new Date(global.botStartTime);
    
    const milliseconds = uptime % 1000;
    const totalSeconds = Math.floor(uptime / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalYears = Math.floor(totalDays / 365);
    
    const displaySeconds = totalSeconds % 60;
    const displayMinutes = totalMinutes % 60;
    const displayHours = totalHours % 24;
    const displayDays = totalDays % 365;
    
    let uptimeMessage = "⏰ 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡\n";
    uptimeMessage += "━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    uptimeMessage += "📊 Detailed Uptime:\n";
    uptimeMessage += `├─ Years: ${totalYears}\n`;
    uptimeMessage += `├─ Days: ${displayDays}\n`;
    uptimeMessage += `├─ Hours: ${displayHours}\n`;
    uptimeMessage += `├─ Minutes: ${displayMinutes}\n`;
    uptimeMessage += `├─ Seconds: ${displaySeconds}\n`;
    uptimeMessage += `└─ Milliseconds: ${milliseconds}\n\n`;
    
    uptimeMessage += "📈 Total Runtime:\n";
    uptimeMessage += `├─ ${totalDays} total days\n`;
    uptimeMessage += `├─ ${totalHours} total hours\n`;
    uptimeMessage += `├─ ${totalMinutes} total minutes\n`;
    uptimeMessage += `└─ ${totalSeconds} total seconds\n\n`;
    
    uptimeMessage += "🕐 Started At:\n";
    uptimeMessage += `└─ ${startDate.toLocaleString()}\n\n`;
    
    uptimeMessage += "💾 System Info:\n";
    uptimeMessage += `├─ Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n`;
    uptimeMessage += `├─ Platform: ${process.platform}\n`;
    uptimeMessage += `└─ Node Version: ${process.version}\n\n`;
    
    uptimeMessage += "✅ Status: Running Smoothly\n\n";
    uptimeMessage += "━━━━━━━━━━━━━━━━━━━━━━━\n";
    uptimeMessage += "👨‍💻 Developer: ioa39rkdev\n";
    uptimeMessage += "━━━━━━━━━━━━━━━━━━━━━━━";
    
    reply(uptimeMessage);
  }
};

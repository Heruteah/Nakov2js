const { format, FontSystem } = require('cassidy-styler');

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
    
    let content = '';
    
    content += FontSystem.applyFonts('📊 Detailed Uptime:', 'bold') + '\n';
    content += `  ├─ Years: ${FontSystem.applyFonts(totalYears.toString(), 'double_struck')}\n`;
    content += `  ├─ Days: ${FontSystem.applyFonts(displayDays.toString(), 'double_struck')}\n`;
    content += `  ├─ Hours: ${FontSystem.applyFonts(displayHours.toString(), 'double_struck')}\n`;
    content += `  ├─ Minutes: ${FontSystem.applyFonts(displayMinutes.toString(), 'double_struck')}\n`;
    content += `  ├─ Seconds: ${FontSystem.applyFonts(displaySeconds.toString(), 'double_struck')}\n`;
    content += `  └─ Milliseconds: ${FontSystem.applyFonts(milliseconds.toString(), 'double_struck')}\n\n`;
    
    content += FontSystem.applyFonts('📈 Total Runtime:', 'bold') + '\n';
    content += `  ├─ ${FontSystem.applyFonts(totalDays.toString(), 'typewriter')} total days\n`;
    content += `  ├─ ${FontSystem.applyFonts(totalHours.toString(), 'typewriter')} total hours\n`;
    content += `  ├─ ${FontSystem.applyFonts(totalMinutes.toString(), 'typewriter')} total minutes\n`;
    content += `  └─ ${FontSystem.applyFonts(totalSeconds.toString(), 'typewriter')} total seconds\n\n`;
    
    content += FontSystem.applyFonts('🕐 Started At:', 'bold') + '\n';
    content += `  └─ ${FontSystem.applyFonts(startDate.toLocaleString(), 'fancy')}\n\n`;
    
    content += FontSystem.applyFonts('💾 System Info:', 'bold') + '\n';
    content += `  ├─ Memory: ${FontSystem.applyFonts((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB', 'typewriter')}\n`;
    content += `  ├─ Platform: ${FontSystem.applyFonts(process.platform, 'typewriter')}\n`;
    content += `  └─ Node: ${FontSystem.applyFonts(process.version, 'typewriter')}\n\n`;
    
    content += `✅ ${FontSystem.applyFonts('Status: Running Smoothly', 'fancy')}\n`;
    content += `👨‍💻 ${FontSystem.applyFonts('Developer: ioa39rkdev', 'script')}`;
    
    const uptimeMessage = format({
      title: '⏰ Bot Uptime',
      titleFont: 'bold',
      content: content,
      contentFont: 'none'
    });
    
    reply(uptimeMessage);
  }
};

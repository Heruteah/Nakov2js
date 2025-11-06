const { format, FontSystem } = require('cassidy-styler');

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
    const config = require("../../config.json");
    const commands = global.commands;
    
    if (!commands || commands.size === 0) {
      return reply("❌ No commands loaded.");
    }
    
    const prefixCommands = [];
    const noPrefixCommands = [];
    
    for (const [name, cmd] of commands) {
      const cmdConfig = cmd.config;
      const prefix = cmdConfig.prefix ? config.prefix : "";
      const description = cmdConfig.description || "No description";
      
      if (cmdConfig.prefix) {
        prefixCommands.push(`  ${FontSystem.applyFonts(prefix + name, 'typewriter')} - ${description}`);
      } else {
        noPrefixCommands.push(`  ${FontSystem.applyFonts(name, 'typewriter')} - ${description}`);
      }
    }
    
    let content = '';
    
    if (prefixCommands.length > 0) {
      content += FontSystem.applyFonts('✅ Prefix Commands:', 'fancy') + '\n';
      content += prefixCommands.join('\n') + '\n\n';
    }
    
    if (noPrefixCommands.length > 0) {
      content += FontSystem.applyFonts('❎ No Prefix Needed:', 'fancy') + '\n';
      content += noPrefixCommands.join('\n') + '\n\n';
    }
    
    content += `💡 ${FontSystem.applyFonts('Tip:', 'bold')} Type ${FontSystem.applyFonts(config.prefix + 'commandname', 'typewriter')} to use a command`;
    
    const helpMessage = format({
      title: `📋 Commands (${commands.size})`,
      titleFont: 'bold',
      content: content,
      contentFont: 'none',
      noFormat: false
    });
    
    reply(helpMessage);
  }
};

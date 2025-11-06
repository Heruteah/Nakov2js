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

    let helpMessage = `📋 Available Commands (${commands.size}):\n\n`;
    
    const prefixCommands = [];
    const noPrefixCommands = [];
    
    for (const [name, cmd] of commands) {
      const cmdConfig = cmd.config;
      const prefix = cmdConfig.prefix ? config.prefix : "";
      const displayName = `${prefix}${cmdConfig.usage || name}`;
      const description = cmdConfig.description || "No description";
      
      if (cmdConfig.prefix) {
        prefixCommands.push(`${prefix}${name} - ${description}`);
      } else {
        noPrefixCommands.push(`${name} - ${description}`);
      }
    }
    
    if (prefixCommands.length > 0) {
      helpMessage += "✅ Prefix Commands:\n";
      prefixCommands.forEach(cmd => helpMessage += `${cmd}\n`);
      helpMessage += "\n";
    }
    
    if (noPrefixCommands.length > 0) {
      helpMessage += "❎ No Prefix Needed:\n";
      noPrefixCommands.forEach(cmd => helpMessage += `${cmd}\n`);
      helpMessage += "\n";
    }
    
    helpMessage += `💡 Type ${config.prefix}commandname to use a command`;
    
    reply(helpMessage);
  }
};

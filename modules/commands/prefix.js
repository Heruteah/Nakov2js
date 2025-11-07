const { format, FontSystem } = require('cassidy-styler');

module.exports = {
  config: {
    name: "prefix",
    description: "Shows the current command prefix",
    usage: "prefix",
    cooldown: 3,
    role: 0,
    prefix: false
  },
  run: async (api, event, args, reply, react) => {
    const config = require("../../config.json");
    
    const content = `${FontSystem.applyFonts('Current prefix:', 'fancy')} ${FontSystem.applyFonts(config.prefix, 'bold')}\n\n${FontSystem.applyFonts('Use', 'fancy')} ${FontSystem.applyFonts(config.prefix + 'help', 'typewriter')} ${FontSystem.applyFonts('to see available commands.', 'fancy')}`;
    
    const message = format({
      title: '📌 Prefix Information',
      titleFont: 'bold',
      content: content,
      contentFont: 'none'
    });
    
    reply(message);
  }
};

const { format, FontSystem } = require('cassidy-styler');

module.exports = {
  config: {
    name: "out",
    description: "Remove bot from the current thread (Admin only)",
    usage: "out",
    cooldown: 5,
    role: 2,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    try {
      const config = require("../../config.json");
      const adminList = config.admin || [];
      
      if (!adminList.includes(event.senderID)) {
        const deniedMessage = format({
          title: '🚫 Access Denied',
          titleFont: 'bold',
          content: `${FontSystem.applyFonts('Only admins can use this command!', 'fancy')}`,
          contentFont: 'none'
        });
        return reply(deniedMessage);
      }
      
      const goodbyeMessage = format({
        title: '👋 Goodbye!',
        titleFont: 'bold',
        content: `${FontSystem.applyFonts('The bot is leaving this thread. Thanks for using me!', 'fancy')} 💫\n\n${FontSystem.applyFonts('Note:', 'bold')} ${FontSystem.applyFonts('If the bot doesn\'t leave automatically, please remove it manually from the group settings.', 'fancy')}`,
        contentFont: 'none'
      });
      
      await reply(goodbyeMessage);
      
      setTimeout(() => {
        try {
          if (typeof api.removeUserFromGroup === 'function') {
            api.removeUserFromGroup(api.getCurrentUserID(), event.threadID, (err) => {
              if (err) console.error('Error leaving thread:', err);
            });
          } else {
            console.log('removeUserFromGroup method not available in this FCA version');
          }
        } catch (err) {
          console.error('Error attempting to leave thread:', err);
        }
      }, 2000);
      
    } catch (err) {
      console.error("Out Command Error:", err);
      const errorMessage = format({
        title: '❌ Error',
        titleFont: 'bold',
        content: `${FontSystem.applyFonts('Failed to leave the thread. Please try again.', 'fancy')}`,
        contentFont: 'none'
      });
      reply(errorMessage);
    }
  }
};

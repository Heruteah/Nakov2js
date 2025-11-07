const { format, FontSystem } = require('cassidy-styler');

module.exports = {
  config: {
    name: "uid",
    description: "Get your Facebook user ID",
    usage: "uid",
    cooldown: 3,
    role: 0,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    try {
      const userID = event.senderID;
      
      const content = `${FontSystem.applyFonts('Your Facebook User ID:', 'fancy')}\n${FontSystem.applyFonts(userID, 'typewriter')}`;
      
      const message = format({
        title: '👤 User ID',
        titleFont: 'bold',
        content: content,
        contentFont: 'none'
      });
      
      reply(message);
    } catch (err) {
      console.error("UID Command Error:", err);
      
      const errorMessage = format({
        title: '❌ Error',
        titleFont: 'bold',
        content: `${FontSystem.applyFonts('Error retrieving your user ID.', 'fancy')}`,
        contentFont: 'none'
      });
      
      reply(errorMessage);
    }
  }
};

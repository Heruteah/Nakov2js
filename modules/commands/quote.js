const axios = require("axios");
const { format, FontSystem } = require('cassidy-styler');

module.exports = {
  config: {
    name: "quote",
    description: "Get an inspirational quote",
    usage: "quote",
    cooldown: 5,
    role: 0,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    try {
      await react("✨");
      
      const response = await axios.get('https://api.quotable.io/random');
      
      if (response.data) {
        const { content, author } = response.data;
        
        const quoteMessage = format({
          title: '💭 Inspirational Quote',
          titleFont: 'bold',
          content: `${FontSystem.applyFonts(`"${content}"`, 'fancy')}\n\n${FontSystem.applyFonts(`— ${author}`, 'script')}`,
          contentFont: 'none'
        });
        
        reply(quoteMessage);
      }
    } catch (err) {
      console.error("Quote Command Error:", err);
      
      const errorMsg = format({
        title: '❌ Error',
        titleFont: 'bold',
        content: 'Failed to fetch quote. Please try again later.',
        contentFont: 'fancy'
      });
      
      reply(errorMsg);
    }
  }
};

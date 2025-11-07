const axios = require("axios");
const { format, FontSystem } = require('cassidy-styler');

module.exports = {
  config: {
    name: "joke",
    description: "Get a random joke to brighten your day",
    usage: "joke",
    cooldown: 5,
    role: 0,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    try {
      await react("😄");
      
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
      
      if (response.data) {
        const { setup, punchline } = response.data;
        
        const jokeMessage = format({
          title: '😂 Random Joke',
          titleFont: 'bold',
          content: `${FontSystem.applyFonts(setup, 'fancy')}\n\n${FontSystem.applyFonts(punchline, 'bold')} 🎉`,
          contentFont: 'none'
        });
        
        reply(jokeMessage);
      }
    } catch (err) {
      console.error("Joke Command Error:", err);
      
      const errorMsg = format({
        title: '❌ Error',
        titleFont: 'bold',
        content: 'Failed to fetch joke. Please try again later.',
        contentFont: 'fancy'
      });
      
      reply(errorMsg);
    }
  }
};

const axios = require("axios");
const { format, FontSystem } = require('cassidy-styler');

module.exports = {
  config: {
    name: "define",
    description: "Get the definition of a word",
    usage: "define <word>",
    cooldown: 5,
    role: 0,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    const word = args.join(" ").trim().toLowerCase();

    if (!word) {
      const helpMsg = format({
        title: '📖 Dictionary',
        titleFont: 'bold',
        content: `Please provide a word to define.\n\n${FontSystem.applyFonts('Example:', 'bold')} ${FontSystem.applyFonts('-define happy', 'typewriter')}`,
        contentFont: 'fancy'
      });
      return reply(helpMsg);
    }

    try {
      await react("📚");
      
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      
      if (response.data && response.data[0]) {
        const entry = response.data[0];
        const meaning = entry.meanings[0];
        const definition = meaning.definitions[0].definition;
        const partOfSpeech = meaning.partOfSpeech;
        const example = meaning.definitions[0].example || 'No example available';
        
        const defineMessage = format({
          title: `📖 ${FontSystem.applyFonts(word.toUpperCase(), 'bold')}`,
          titleFont: 'none',
          content: `${FontSystem.applyFonts('Part of Speech:', 'bold')} ${FontSystem.applyFonts(partOfSpeech, 'fancy')}\n\n${FontSystem.applyFonts('Definition:', 'bold')}\n${FontSystem.applyFonts(definition, 'fancy')}\n\n${FontSystem.applyFonts('Example:', 'bold')}\n${FontSystem.applyFonts(example, 'fancy')}`,
          contentFont: 'none'
        });
        
        reply(defineMessage);
      }
    } catch (err) {
      console.error("Define Command Error:", err);
      
      const errorMsg = format({
        title: '❌ Word Not Found',
        titleFont: 'bold',
        content: `Could not find definition for "${word}". Please check the spelling and try again.`,
        contentFont: 'fancy'
      });
      
      reply(errorMsg);
    }
  }
};

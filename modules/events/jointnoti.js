const { format, FontSystem } = require('cassidy-styler');

module.exports = {
  name: "jointnoti",
  execute: async ({ api, event, config }) => {
    try {
      const { threadID, logMessageData } = event;
      const { addedParticipants } = logMessageData;

      if (!addedParticipants || addedParticipants.length === 0) return;

      for (const participant of addedParticipants) {
        const userID = participant.userFbId;
        
        if (userID === api.getCurrentUserID()) {
          const botName = config.botName || "Bot";
          
          const joinMessage = format({
            title: `🤖 ${botName}`,
            titleFont: 'bold',
            content: `Hello everyone! I'm here to help and make your chat more fun!\n\n${FontSystem.applyFonts('Type', 'fancy')} ${FontSystem.applyFonts(config.prefix + 'help', 'typewriter')} ${FontSystem.applyFonts('to see what I can do!', 'fancy')} 🚀`,
            contentFont: 'none'
          });
          
          await api.sendMessage(joinMessage, threadID);

          if (config.botName) {
            try {
              await api.nickname(config.botName, threadID, api.getCurrentUserID());
              console.log(`✅ Changed bot nickname to "${config.botName}" in thread ${threadID}`);
            } catch (error) {
              console.error("Error changing bot nickname:", error);
            }
          }
          
          break;
        }
      }
    } catch (error) {
      console.error("Error in jointnoti event:", error);
    }
  }
};

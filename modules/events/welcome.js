const { format, FontSystem } = require('cassidy-styler');

module.exports = {
  name: "welcome",
  execute: async ({ api, event, config }) => {
    try {
      const { threadID, logMessageData } = event;
      const { addedParticipants } = logMessageData;

      if (!addedParticipants || addedParticipants.length === 0) return;

      for (const participant of addedParticipants) {
        const userID = participant.userFbId;
        
        if (userID === api.getCurrentUserID()) continue;

        let userName = participant.fullName || "New Member";
        
        const welcomeMessage = format({
          title: `👋 Welcome ${userName}! 🎉`,
          titleFont: 'bold',
          content: `We're glad to have you here! Feel free to chat and have fun! 😊`,
          contentFont: 'fancy'
        });
        
        await api.sendMessage(welcomeMessage, threadID);
      }
    } catch (error) {
      console.error("Error in welcome event:", error);
    }
  }
};

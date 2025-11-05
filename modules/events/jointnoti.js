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
          const joinMessage = `🤖 Hello everyone! I'm ${config.botName || "Bot"}!\n\nI'm here to help and make your chat more fun! Type ${config.prefix}help to see what I can do! 🚀`;
          
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

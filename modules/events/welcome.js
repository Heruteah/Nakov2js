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
        
        const welcomeMessage = `👋 Welcome to the group, ${userName}! 🎉\n\nWe're glad to have you here! Feel free to chat and have fun! 😊`;
        
        await api.sendMessage(welcomeMessage, threadID);
      }
    } catch (error) {
      console.error("Error in welcome event:", error);
    }
  }
};

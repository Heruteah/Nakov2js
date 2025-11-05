module.exports = {
  name: "leavenoti",
  execute: async ({ api, event, config }) => {
    try {
      const { threadID, logMessageData } = event;
      const { leftParticipantFbId } = logMessageData;

      if (!leftParticipantFbId) return;

      if (leftParticipantFbId === api.getCurrentUserID()) return;

      let userName = "A member";
      
      try {
        const userInfo = await api.getUserInfo(leftParticipantFbId);
        if (userInfo && userInfo[leftParticipantFbId]) {
          userName = userInfo[leftParticipantFbId].name;
        }
      } catch (err) {
        console.error("Error getting user info:", err);
      }

      const leaveMessage = `👋 ${userName} has left the group. Goodbye! 😢`;
      
      await api.sendMessage(leaveMessage, threadID);
    } catch (error) {
      console.error("Error in leavenoti event:", error);
    }
  }
};

module.exports = {
  name: "uid",
  description: "Get your Facebook user ID",
  usePrefix: true,
  async execute({ api, event, args }) {
    try {
      const userID = event.senderID;
      
      await api.sendMessage(
        `👤 Your Facebook User ID:\n${userID}`,
        event.threadID,
        event.messageID
      );
    } catch (err) {
      console.error("UID Command Error:", err);
      api.sendMessage("❌ Error retrieving your user ID.", event.threadID, event.messageID);
    }
  }
};

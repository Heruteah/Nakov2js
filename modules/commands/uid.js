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
      reply(`👤 Your Facebook User ID:\n${userID}`);
    } catch (err) {
      console.error("UID Command Error:", err);
      reply("❌ Error retrieving your user ID.");
    }
  }
};

module.exports = {
  name: "prefix",
  description: "Shows the current command prefix.",
  usePrefix: false,
  async execute({ api, event, args }) {
    const config = require("../../config.json");
    const message = `📌 Current prefix: ${config.prefix}\n\nUse ${config.prefix}help to see available commands.`;
    api.sendMessage(message, event.threadID, event.messageID);
  }
};
